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
    serverTimestamp
   } from 'firebase/firestore';
   import { db } from '../config/firebaseConfig';
   import { COLLECTIONS, CONVITE_STATUS } from './firebaseStructure';
   class ConviteService {
    // Enviar convite
    async enviarConvite(conviteData) {
      try {
        const docRef = await addDoc(collection(db, COLLECTIONS.CONVITES), {
          ...conviteData,
          status: CONVITE_STATUS.ENVIADO,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return { success: true, conviteId: docRef.id };
      } catch (error) {
        console.error('Erro ao enviar convite:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar convites enviados
    async buscarConvitesEnviados(userId) {
      try {
        const q = query(
          collection(db, COLLECTIONS.CONVITES),
          where('remetenteId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const convites = [];
        for (const docSnap of querySnapshot.docs) {
          const convite = { id: docSnap.id, ...docSnap.data() };
          // Buscar dados do destinatário
          let destinatarioCollection;
          switch (convite.tipoDestinatario) {
            case 'olheiro':
              destinatarioCollection = COLLECTIONS.OLHEIROS;
              break;
            case 'instituicao':
              destinatarioCollection = COLLECTIONS.INSTITUICOES;
              break;
            default:
              continue;
          }
          const destinatarioDoc = await getDoc(doc(db, destinatarioCollection, 
  convite.destinatarioId));
          if (destinatarioDoc.exists()) {
            convite.destinatario = destinatarioDoc.data();
          }
          // Se há atletaId, buscar dados do atleta
          if (convite.atletaId) {
            const atletaDoc = await getDoc(doc(db, COLLECTIONS.ATLETAS, 
  convite.atletaId));
            if (atletaDoc.exists()) {
              convite.atleta = atletaDoc.data();
            }
          }
          convites.push(convite);
        }
        return { success: true, convites };
      } catch (error) {
        console.error('Erro ao buscar convites enviados:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar convites recebidos
    async buscarConvitesRecebidos(userId) {
      try {
        const q = query(
          collection(db, COLLECTIONS.CONVITES),
          where('destinatarioId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const convites = [];
        for (const docSnap of querySnapshot.docs) {
          const convite = { id: docSnap.id, ...docSnap.data() };
          // Buscar dados do remetente
          let remetenteCollection;
          switch (convite.tipoRemetente) {
            case 'olheiro':
              remetenteCollection = COLLECTIONS.OLHEIROS;
              break;
            case 'instituicao':
              remetenteCollection = COLLECTIONS.INSTITUICOES;
              break;
            default:
              continue;
          }
          const remetenteDoc = await getDoc(doc(db, remetenteCollection, 
  convite.remetenteId));
          if (remetenteDoc.exists()) {
            convite.remetente = remetenteDoc.data();
          }
          // Se há atletaId, buscar dados do atleta
          if (convite.atletaId) {
            const atletaDoc = await getDoc(doc(db, COLLECTIONS.ATLETAS, 
  convite.atletaId));
            if (atletaDoc.exists()) {
              convite.atleta = atletaDoc.data();
            }
          }
          convites.push(convite);
        }
        return { success: true, convites };
      } catch (error) {
        console.error('Erro ao buscar convites recebidos:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar convite por ID
    async buscarConvitePorId(conviteId) {
      try {
        const docRef = doc(db, COLLECTIONS.CONVITES, conviteId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const convite = { id: docSnap.id, ...docSnap.data() };
          // Buscar dados do remetente
          let remetenteCollection;
          switch (convite.tipoRemetente) {
            case 'olheiro':
              remetenteCollection = COLLECTIONS.OLHEIROS;
              break;
            case 'instituicao':
              remetenteCollection = COLLECTIONS.INSTITUICOES;
              break;
          }
          if (remetenteCollection) {
            const remetenteDoc = await getDoc(doc(db, remetenteCollection, 
  convite.remetenteId));
            if (remetenteDoc.exists()) {
              convite.remetente = remetenteDoc.data();
            }
          }
          // Buscar dados do destinatário
          let destinatarioCollection;
          switch (convite.tipoDestinatario) {
            case 'olheiro':
              destinatarioCollection = COLLECTIONS.OLHEIROS;
              break;
            case 'instituicao':
              destinatarioCollection = COLLECTIONS.INSTITUICOES;
              break;
          }
          if (destinatarioCollection) {
            const destinatarioDoc = await getDoc(doc(db, destinatarioCollection, 
  convite.destinatarioId));
            if (destinatarioDoc.exists()) {
              convite.destinatario = destinatarioDoc.data();
            }
          }
          // Se há atletaId, buscar dados do atleta
          if (convite.atletaId) {
            const atletaDoc = await getDoc(doc(db, COLLECTIONS.ATLETAS, 
  convite.atletaId));
            if (atletaDoc.exists()) {
              convite.atleta = atletaDoc.data();
            }
          }
          return { success: true, convite };
        } else {
          return { success: false, error: 'Convite não encontrado' };
        }
      } catch (error) {
        console.error('Erro ao buscar convite:', error);
        return { success: false, error: error.message };
      }
    }
    // Aceitar convite
    async aceitarConvite(conviteId) {
      try {
        const docRef = doc(db, COLLECTIONS.CONVITES, conviteId);
        await updateDoc(docRef, {
          status: CONVITE_STATUS.ACEITO,
          updatedAt: serverTimestamp()
        });
        return { success: true };
      } catch (error) {
        console.error('Erro ao aceitar convite:', error);
        return { success: false, error: error.message };
      }
    }
    // Recusar convite
    async recusarConvite(conviteId) {
      try {
        const docRef = doc(db, COLLECTIONS.CONVITES, conviteId);
        await updateDoc(docRef, {
          status: CONVITE_STATUS.RECUSADO,
          updatedAt: serverTimestamp()
        });
        return { success: true };
      } catch (error) {
        console.error('Erro ao recusar convite:', error);
        return { success: false, error: error.message };
      }
    }
    // Deletar convite
    async deletarConvite(conviteId) {
      try {
        await deleteDoc(doc(db, COLLECTIONS.CONVITES, conviteId));
        return { success: true };
      } catch (error) {
        console.error('Erro ao deletar convite:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar convites não lidos
    async buscarConvitesNaoLidos(userId) {
      try {
        const q = query(
          collection(db, COLLECTIONS.CONVITES),
          where('destinatarioId', '==', userId),
          where('status', '==', CONVITE_STATUS.ENVIADO),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const convites = [];
        for (const docSnap of querySnapshot.docs) {
          const convite = { id: docSnap.id, ...docSnap.data() };
          // Buscar dados básicos do remetente
          let remetenteCollection;
          switch (convite.tipoRemetente) {
            case 'olheiro':
              remetenteCollection = COLLECTIONS.OLHEIROS;
              break;
            case 'instituicao':
              remetenteCollection = COLLECTIONS.INSTITUICOES;
              break;
            default:
              continue;
          }
          const remetenteDoc = await getDoc(doc(db, remetenteCollection, 
  convite.remetenteId));
          if (remetenteDoc.exists()) {
            const remetenteData = remetenteDoc.data();
            convite.remetente = {
              nome: remetenteData.nome || remetenteData.nomeEscola,
              profileImage: remetenteData.profileImage
            };
          }
          convites.push(convite);
        }
        return { success: true, convites };
      } catch (error) {
        console.error('Erro ao buscar convites não lidos:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar estatísticas de convites
    async buscarEstatisticasConvites(userId) {
      try {
        // Convites enviados
        const qEnviados = query(
          collection(db, COLLECTIONS.CONVITES),
          where('remetenteId', '==', userId)
        );
        // Convites recebidos
        const qRecebidos = query(
          collection(db, COLLECTIONS.CONVITES),
          where('destinatarioId', '==', userId)
        );
        const [enviadosSnapshot, recebidosSnapshot] = await Promise.all([
          getDocs(qEnviados),
          getDocs(qRecebidos)
        ]);
        const stats = {
          enviados: {
            total: 0,
            aceitos: 0,
            recusados: 0,
            pendentes: 0
          },
          recebidos: {
            total: 0,
            aceitos: 0,
            recusados: 0,
            pendentes: 0
          }
        };
        // Processar convites enviados
        enviadosSnapshot.forEach((doc) => {
          const convite = doc.data();
          stats.enviados.total++;
          switch (convite.status) {
            case CONVITE_STATUS.ACEITO:
              stats.enviados.aceitos++;
              break;
            case CONVITE_STATUS.RECUSADO:
              stats.enviados.recusados++;
              break;
            case CONVITE_STATUS.ENVIADO:
              stats.enviados.pendentes++;
              break;
          }
        });
        // Processar convites recebidos
        recebidosSnapshot.forEach((doc) => {
          const convite = doc.data();
          stats.recebidos.total++;
          switch (convite.status) {
            case CONVITE_STATUS.ACEITO:
              stats.recebidos.aceitos++;
              break;
            case CONVITE_STATUS.RECUSADO:
              stats.recebidos.recusados++;
              break;
            case CONVITE_STATUS.ENVIADO:
              stats.recebidos.pendentes++;
              break;
          }
        });
        return { success: true, stats };
      } catch (error) {
        console.error('Erro ao buscar estatísticas de convites:', error);
        return { success: false, error: error.message };
      }
    }
    // Verificar se já existe convite entre usuários para um atleta específico
    async verificarConviteExistente(remetenteId, destinatarioId, atletaId = null) 
  {
      try {
        let q = query(
          collection(db, COLLECTIONS.CONVITES),
          where('remetenteId', '==', remetenteId),
          where('destinatarioId', '==', destinatarioId),
          where('status', '==', CONVITE_STATUS.ENVIADO)
        );
        if (atletaId) {
          q = query(q, where('atletaId', '==', atletaId));
        }
        const querySnapshot = await getDocs(q);
        return {
          success: true,
          existe: !querySnapshot.empty,
          conviteId: querySnapshot.empty ? null : querySnapshot.docs[0].id
        };
      } catch (error) {
        console.error('Erro ao verificar convite existente:', error);
        return { success: false, error: error.message };
      }
    }
    // Buscar instituições para envio de convites (para olheiros)
    async buscarInstituicoesParaConvite() {
      try {
        const q = query(
          collection(db, COLLECTIONS.INSTITUICOES),
          orderBy('nomeEscola', 'asc')
        );
        const querySnapshot = await getDocs(q);
        const instituicoes = [];
        querySnapshot.forEach((doc) => {
          instituicoes.push({
            id: doc.id,
            ...doc.data()
          });
        });
        return { success: true, instituicoes };
      } catch (error) {
        console.error('Erro ao buscar instituições:', error);
        return { success: false, error: error.message };
      }
    }
  // Buscar olheiros para envio de convites (para instituições)
   async buscarOlheirosParaConvite() {
   try {
   const q = query(
   collection(db, COLLECTIONS.OLHEIROS),
   orderBy('nome', 'asc')
   );
   const querySnapshot = await getDocs(q);
   const olheiros = [];
   querySnapshot.forEach((doc) => {
   olheiros.push({
   id: doc.id,
   ...doc.data()
   });
   });
   return { success: true, olheiros };
   } catch (error) {
   console.error('Erro ao buscar olheiros:', error);
   return { success: false, error: error.message };
   }
   }
   }
   export default new ConviteService();