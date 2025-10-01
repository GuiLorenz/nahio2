import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    serverTimestamp,
    QueryConstraint, // Importação adicionada para tipagem (melhor prática, se estiver usando TS/JSDoc)
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from 'firebase/storage';
import { db, storage } from '../config/firebaseConfig'; // Assumindo paths corretos
import { COLLECTIONS } from './firebaseStructure'; // Assumindo paths corretos

/**
 * Serviço para gerenciar todas as operações relacionadas a Atletas no Firestore e Storage.
 */
class AtletaService {
    
    /**
     * Auxiliar privado para padronizar o tratamento de erros.
     * @param {string} operation Nome da operação que falhou.
     * @param {Error} error Objeto de erro.
     * @returns {{ success: false, error: string }} Objeto de resultado padronizado.
     */
    _handleError(operation, error) {
        console.error(`Erro ao ${operation}:`, error);
        return { success: false, error: error.message };
    }

    /**
     * Auxiliar privado para obter a referência de um atleta.
     * @param {string} atletaId ID do atleta.
     * @returns {import('firebase/firestore').DocumentReference} Referência do documento.
     */
    _getAtletaRef(atletaId) {
        return doc(db, COLLECTIONS.ATLETAS, atletaId);
    }
    
    /**
     * Auxiliar privado para deletar um arquivo do Firebase Storage.
     * @param {string} url URL do arquivo ou path do storage.
     * @returns {Promise<void>}
     */
    async _deleteStorageFile(url) {
        try {
            const storageRef = ref(storage, url);
            await deleteObject(storageRef);
        } catch (error) {
            // Usar warn, pois o arquivo pode já ter sido deletado ou o path ser inválido.
            console.warn('Aviso: Erro ao tentar deletar arquivo do storage. Pode já ter sido deletado.', url, error);
        }
    }


    // --- Operações CRUD Básicas ---

    /**
     * Cria um novo atleta no banco de dados.
     * @param {object} atletaData Dados iniciais do atleta.
     * @param {string} instituicaoId ID da instituição vinculada.
     * @param {string | null} [responsavelId=null] ID do responsável/usuário que criou.
     * @returns {Promise<{success: boolean, atletaId?: string, error?: string}>}
     */
    async criarAtleta(atletaData, instituicaoId, responsavelId = null) {
        try {
            const novoAtleta = {
                ...atletaData,
                instituicaoId,
                responsavelId,
                midias: {
                    fotos: [],
                    videos: []
                },
                estatisticas: {
                    gols: 0,
                    assistencias: 0,
                    jogos: 0
                },
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, COLLECTIONS.ATLETAS), novoAtleta);
            return { success: true, atletaId: docRef.id };
        } catch (error) {
            return this._handleError('criar atleta', error);
        }
    }

    /**
     * Atualiza dados de um atleta.
     * @param {string} atletaId ID do atleta a ser atualizado.
     * @param {object} dadosAtualizados Dados a serem mesclados.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async atualizarAtleta(atletaId, dadosAtualizados) {
        try {
            const docRef = this._getAtletaRef(atletaId);
            await updateDoc(docRef, {
                ...dadosAtualizados,
                updatedAt: serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            return this._handleError('atualizar atleta', error);
        }
    }

    /**
     * Busca um atleta específico por ID.
     * @param {string} atletaId ID do atleta.
     * @returns {Promise<{success: boolean, atleta?: object, error?: string}>}
     */
    async buscarAtletaPorId(atletaId) {
        try {
            const docRef = this._getAtletaRef(atletaId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    success: true,
                    atleta: { id: docSnap.id, ...docSnap.data() }
                };
            } else {
                return { success: false, error: 'Atleta não encontrado' };
            }
        } catch (error) {
            return this._handleError('buscar atleta por ID', error);
        }
    }

    /**
     * Busca todos os atletas de uma instituição.
     * @param {string} instituicaoId ID da instituição.
     * @returns {Promise<{success: boolean, atletas?: object[], error?: string}>}
     */
    async buscarAtletasPorInstituicao(instituicaoId) {
        try {
            const q = query(
                collection(db, COLLECTIONS.ATLETAS),
                where('instituicaoId', '==', instituicaoId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            const atletas = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, atletas };
        } catch (error) {
            return this._handleError('buscar atletas por instituição', error);
        }
    }

    /**
     * Busca todos os atletas com opções de filtros. (Para Olheiros/Geral)
     * @param {{ posicao?: string, idadeMin?: number, idadeMax?: number }} [filtros={}] Filtros de busca.
     * @returns {Promise<{success: boolean, atletas?: object[], error?: string}>}
     */
    async buscarTodosAtletas(filtros = {}) {
        try {
            const { posicao, idadeMin, idadeMax } = filtros;
            /** @type {QueryConstraint[]} */
            const constraints = [];

            if (posicao) {
                constraints.push(where('posicao', '==', posicao));
            }
            // OBS: A consulta de faixa de idade só funcionará bem se houver um campo 'idade' numérico.
            if (idadeMin !== undefined && idadeMax !== undefined) {
                constraints.push(where('idade', '>=', idadeMin));
                constraints.push(where('idade', '<=', idadeMax));
            }

            constraints.push(orderBy('createdAt', 'desc'));

            const q = query(collection(db, COLLECTIONS.ATLETAS), ...constraints);
            const querySnapshot = await getDocs(q);

            const atletas = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            return { success: true, atletas };
        } catch (error) {
            return this._handleError('buscar todos os atletas', error);
        }
    }

    /**
     * Deleta um atleta, incluindo todas as suas mídias do Storage.
     * @param {string} atletaId ID do atleta a ser deletado.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async deletarAtleta(atletaId) {
        try {
            // 1. Buscar o atleta para obter as URLs das mídias
            const { success, atleta, error } = await this.buscarAtletaPorId(atletaId);
            if (!success) {
                return { success: false, error: error || 'Atleta não encontrado para exclusão.' };
            }

            // 2. Deletar todas as mídias do Storage
            const midias = [...(atleta.midias?.fotos || []), ...(atleta.midias?.videos || [])];
            
            await Promise.all(midias.map(media => 
                // O campo 'url' na mídia deve conter o path completo do Storage para funcionar com ref(storage, url)
                media.url && this._deleteStorageFile(media.url)
            ));

            // 3. Deletar o documento do atleta no Firestore
            await deleteDoc(this._getAtletaRef(atletaId));
            
            return { success: true };
        } catch (error) {
            return this._handleError('deletar atleta', error);
        }
    }
    
    // --- Operações de Mídia ---

    /**
     * Faz upload de uma foto e atualiza o array de fotos do atleta.
     * @param {string} atletaId ID do atleta.
     * @param {string} imageUri URI local da imagem.
     * @param {string} uploadedBy ID do usuário que fez o upload.
     * @returns {Promise<{success: boolean, fotoUrl?: string, error?: string}>}
     */
    async uploadFoto(atletaId, imageUri, uploadedBy) {
        try {
            const timestamp = Date.now();
            // Correção no template string: usar barra invertida (`${}`)
            const fileName = `atletas/${atletaId}/fotos/${timestamp}.jpg`; 
            const storageRef = ref(storage, fileName);

            // Converter URI para Blob
            const response = await fetch(imageUri);
            const blob = await response.blob();
            
            // Upload e obtenção da URL
            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            // Atualizar Firestore
            const { atleta, success: found } = await this.buscarAtletaPorId(atletaId);
            if (!found) {
                await this._deleteStorageFile(fileName); // Rollback
                return { success: false, error: 'Atleta não encontrado para associar foto' };
            }

            const novaFoto = {
                url: downloadURL,
                path: fileName, // Armazenar o path para facilitar a exclusão futura
                isFavorite: false,
                uploadedBy,
                uploadedAt: serverTimestamp()
            };

            const fotosAtualizadas = [...(atleta.midias?.fotos || []), novaFoto];
            
            await this.atualizarAtleta(atletaId, {
                'midias.fotos': fotosAtualizadas
            });

            return { success: true, fotoUrl: downloadURL };
        } catch (error) {
            return this._handleError('fazer upload da foto', error);
        }
    }

    /**
     * Faz upload de um vídeo e atualiza o array de vídeos do atleta.
     * @param {string} atletaId ID do atleta.
     * @param {string} videoUri URI local do vídeo.
     * @param {string} uploadedBy ID do usuário que fez o upload.
     * @returns {Promise<{success: boolean, videoUrl?: string, error?: string}>}
     */
    async uploadVideo(atletaId, videoUri, uploadedBy) {
        try {
            const timestamp = Date.now();
            // Correção no template string
            const fileName = `atletas/${atletaId}/videos/${timestamp}.mp4`; 
            const storageRef = ref(storage, fileName);

            const response = await fetch(videoUri);
            const blob = await response.blob();

            await uploadBytes(storageRef, blob);
            const downloadURL = await getDownloadURL(storageRef);

            const { atleta, success: found } = await this.buscarAtletaPorId(atletaId);
            if (!found) {
                await this._deleteStorageFile(fileName); // Rollback
                return { success: false, error: 'Atleta não encontrado para associar vídeo' };
            }
            
            const novoVideo = {
                url: downloadURL,
                path: fileName, // Armazenar o path para facilitar a exclusão futura
                thumbnail: '', // Pode ser gerado posteriormente
                isFavorite: false,
                uploadedBy,
                uploadedAt: serverTimestamp()
            };

            const videosAtualizados = [...(atleta.midias?.videos || []), novoVideo];
            
            await this.atualizarAtleta(atletaId, {
                'midias.videos': videosAtualizados
            });

            return { success: true, videoUrl: downloadURL };
        } catch (error) {
            return this._handleError('fazer upload do vídeo', error);
        }
    }
    
    // --- Mídia: Favoritar e Deletar ---

    /**
     * Alterna o status de favorito de uma foto. Garante que apenas uma foto esteja favoritada.
     * @param {string} atletaId ID do atleta.
     * @param {number} fotoIndex Índice da foto no array.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async toggleFavoritoFoto(atletaId, fotoIndex) {
        try {
            const { atleta, success: found } = await this.buscarAtletaPorId(atletaId);
            if (!found) return { success: false, error: 'Atleta não encontrado' };

            const fotos = [...(atleta.midias?.fotos || [])];

            if (fotoIndex >= 0 && fotoIndex < fotos.length) {
                const isCurrentlyFavorite = fotos[fotoIndex].isFavorite;
                
                // Desfavorita todos se o clique for para favoritar (mantém apenas um favorito)
                fotos.forEach(foto => foto.isFavorite = false);
                
                // Se a foto não estava favoritada, favorita ela. Se estava, a linha acima desfavoritou.
                if (!isCurrentlyFavorite) {
                    fotos[fotoIndex].isFavorite = true;
                }

                await this.atualizarAtleta(atletaId, {
                    'midias.fotos': fotos
                });
                return { success: true };
            } else {
                return { success: false, error: 'Índice de foto inválido' };
            }
        } catch (error) {
            return this._handleError('alternar favorito da foto', error);
        }
    }

    /**
     * Alterna o status de favorito de um vídeo. Garante que apenas um vídeo esteja favoritado.
     * @param {string} atletaId ID do atleta.
     * @param {number} videoIndex Índice do vídeo no array.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async toggleFavoritoVideo(atletaId, videoIndex) {
        try {
            const { atleta, success: found } = await this.buscarAtletaPorId(atletaId);
            if (!found) return { success: false, error: 'Atleta não encontrado' };

            const videos = [...(atleta.midias?.videos || [])];

            if (videoIndex >= 0 && videoIndex < videos.length) {
                const isCurrentlyFavorite = videos[videoIndex].isFavorite;

                // Desfavorita todos
                videos.forEach(video => video.isFavorite = false);

                // Favorita apenas se não estava favoritado
                if (!isCurrentlyFavorite) {
                    videos[videoIndex].isFavorite = true;
                }
                
                await this.atualizarAtleta(atletaId, {
                    'midias.videos': videos
                });
                return { success: true };
            } else {
                return { success: false, error: 'Índice de vídeo inválido' };
            }
        } catch (error) {
            return this._handleError('alternar favorito do vídeo', error);
        }
    }

    /**
     * Deleta uma foto do Storage e do array de mídias do atleta.
     * @param {string} atletaId ID do atleta.
     * @param {number} fotoIndex Índice da foto no array.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async deletarFoto(atletaId, fotoIndex) {
        try {
            const { atleta, success: found } = await this.buscarAtletaPorId(atletaId);
            if (!found) return { success: false, error: 'Atleta não encontrado' };

            const fotos = [...(atleta.midias?.fotos || [])];

            if (fotoIndex >= 0 && fotoIndex < fotos.length) {
                const fotoParaDeletar = fotos[fotoIndex];
                
                // 1. Deletar do Storage (usando o 'path' se existir, ou o 'url' se não)
                const storagePath = fotoParaDeletar.path || fotoParaDeletar.url; 
                if (storagePath) {
                    await this._deleteStorageFile(storagePath);
                }
                
                // 2. Remover do array no Firestore
                fotos.splice(fotoIndex, 1);
                
                await this.atualizarAtleta(atletaId, {
                    'midias.fotos': fotos
                });
                return { success: true };
            } else {
                return { success: false, error: 'Índice de foto inválido' };
            }
        } catch (error) {
            return this._handleError('deletar foto', error);
        }
    }

    /**
     * Deleta um vídeo do Storage e do array de mídias do atleta.
     * @param {string} atletaId ID do atleta.
     * @param {number} videoIndex Índice do vídeo no array.
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async deletarVideo(atletaId, videoIndex) {
        try {
            const { atleta, success: found } = await this.buscarAtletaPorId(atletaId);
            if (!found) return { success: false, error: 'Atleta não encontrado' };
            
            const videos = [...(atleta.midias?.videos || [])];
            
            if (videoIndex >= 0 && videoIndex < videos.length) {
                const videoParaDeletar = videos[videoIndex];
                
                // 1. Deletar do Storage
                const storagePath = videoParaDeletar.path || videoParaDeletar.url; 
                if (storagePath) {
                    await this._deleteStorageFile(storagePath);
                }
                
                // 2. Remover do array no Firestore
                videos.splice(videoIndex, 1);
                
                await this.atualizarAtleta(atletaId, {
                    'midias.videos': videos
                });
                return { success: true };
            } else {
                return { success: false, error: 'Índice de vídeo inválido' };
            }
        } catch (error) {
            return this._handleError('deletar vídeo', error);
        }
    }

    // --- Operações de Estatísticas ---
    
    /**
     * Atualiza as estatísticas do atleta.
     * @param {string} atletaId ID do atleta.
     * @param {object} novasEstatisticas Objeto com as estatísticas a serem atualizadas (ex: { gols: 5, jogos: 10 }).
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    async atualizarEstatisticas(atletaId, novasEstatisticas) {
        try {
            await this.atualizarAtleta(atletaId, {
                estatisticas: novasEstatisticas
            });
            return { success: true };
        } catch (error) {
            return this._handleError('atualizar estatísticas', error);
        }
    }
}

export default new AtletaService();