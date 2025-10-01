 // Estrutura de dados do Firebase Firestore
 /*
 COLEÇÕES PRINCIPAIS:
 1. users (coleção)
   - uid (documento ID)
   - email: string
   - userType: 'olheiro' | 'instituicao' | 'responsavel'
   - createdAt: timestamp
   - updatedAt: timestamp
   - isActive: boolean
 2. olheiros (coleção)
   - uid (documento ID - mesmo do users)
   - nome: string
   - formacaoAcademica: string
   - experiencia: string
   - telefone: string
   - endereco: {
     cep: string
     estado: string
     cidade: string
     rua: string
     numero: string
   }
   - profileImage: string (URL)
   - createdAt: timestamp
   - updatedAt: timestamp
 3. instituicoes (coleção)
   - uid (documento ID - mesmo do users)
   - nomeEscola: string
   - cnpj: string
   - modalidades: array of strings
   - telefoneComercial: string
   - emailContato: string
   - endereco: {
     cep: string
     estado: string
     cidade: string
     rua: string
     numero: string
   }
   - responsavel: {
     nome: string
     email: string
     uid: string (referência ao documento do responsável)
   }
   - profileImage: string (URL)
   - bannerImage: string (URL)
   - createdAt: timestamp
   - updatedAt: timestamp
 4. responsaveis (coleção)
   - uid (documento ID - mesmo do users)
   - nome: string
    - instituicaoId: string (referência à instituição)
   - telefone: string
   - createdAt: timestamp
   - updatedAt: timestamp
 5. atletas (coleção)
   - id (documento ID auto-gerado)
   - nome: string
   - idade: number
   - posicao: string
   - altura: number
   - peso: number
   - pe_dominante: 'direito' | 'esquerdo' | 'ambos'
   - instituicaoId: string (referência à instituição)
   - responsavelId: string (referência ao responsável)
   - profileImage: string (URL)
   - midias: {
     fotos: array of {
       url: string
       isFavorite: boolean
       uploadedBy: string (uid do usuário que fez upload)
       uploadedAt: timestamp
     }
     videos: array of {
       url: string
       thumbnail: string
       isFavorite: boolean
       uploadedBy: string (uid do usuário que fez upload)
       uploadedAt: timestamp
     }
   }
   - estatisticas: {
     gols: number
     assistencias: number
     jogos: number
   }
   - createdAt: timestamp
   - updatedAt: timestamp
 6. agendamentos (coleção)
   - id (documento ID auto-gerado)
   - olheiroId: string (referência ao olheiro)
   - instituicaoId: string (referência à instituição)
   - dataVisita: timestamp
   - horario: string
   - status: 'pendente' | 'confirmado' | 'cancelado' | 'realizado'
   - observacoes: string
   - createdAt: timestamp
   - updatedAt: timestamp
 7. convites (coleção)
   - id (documento ID auto-gerado)
   - remetenteId: string (uid do remetente)
   - destinatarioId: string (uid do destinatário)
   - tipoRemetente: 'olheiro' | 'instituicao'
   - tipoDestinatario: 'olheiro' | 'instituicao'
   - atletaId: string (referência ao atleta, se aplicável)
   - mensagem: string
   - status: 'enviado' | 'aceito' | 'recusado'
   - createdAt: timestamp
   - updatedAt: timestamp
8. notificacoes (coleção)- id (documento ID auto-gerado)- userId: string (uid do usuário)- titulo: string- mensagem: string- tipo: 'agendamento' | 'convite' | 'sistema'- isRead: boolean- createdAt: timestamp
 ÍNDICES RECOMENDADOS:- users: email, userType- olheiros: createdAt- instituicoes: createdAt, modalidades- atletas: instituicaoId, responsavelId, createdAt- agendamentos: olheiroId, instituicaoId, dataVisita, status- convites: remetenteId, destinatarioId, status, createdAt- notificacoes: userId, isRead, createdAt
 REGRAS DE SEGURANÇA (Security Rules):- Usuários só podem ler/escrever seus próprios dados- Olheiros podem ler dados de instituições e atletas- Instituições podem gerenciar seus atletas- Responsáveis podem gerenciar atletas de sua instituição
 */
 export const COLLECTIONS = {
    USERS: 'users',
    OLHEIROS: 'olheiros',
    INSTITUICOES: 'instituicoes',
    RESPONSAVEIS: 'responsaveis',
    ATLETAS: 'atletas',
    AGENDAMENTOS: 'agendamentos',
    CONVITES: 'convites',
    NOTIFICACOES: 'notificacoes',
    };
    export const USER_TYPES = {
    OLHEIRO: 'olheiro',
    INSTITUICAO: 'instituicao',
    RESPONSAVEL: 'responsavel',
    };
    export const AGENDAMENTO_STATUS = {
    PENDENTE: 'pendente',
    CONFIRMADO: 'confirmado',
    CANCELADO: 'cancelado',
    REALIZADO: 'realizado',
    };
    export const CONVITE_STATUS = {
    ENVIADO: 'enviado',
    ACEITO: 'aceito',
    RECUSADO: 'recusado',
    };
    export const MODALIDADES = [
    'Futebol de Campo',
    'Futsal',
    'Futebol Society',
    'Futebol Feminino',
];