// Estrutura de dados do Firebase Firestore
// VERSÃO SIMPLIFICADA (Atual - Em uso)

/*
ESTRUTURA ATUAL:
===============

1. users (coleção) - TODOS OS DADOS EM UM ÚNICO DOCUMENTO
   - uid (documento ID)
   - email: string
   - userType: 'olheiro' | 'instituicao' | 'responsavel'
   - profile: {
       // Para OLHEIROS:
       nome: string
       telefone: string
       profileImage: string
       endereco: {
         cep: string
         logradouro: string
         numero: string
         complemento: string
         bairro: string
         cidade: string
         estado: string
       }
       
       // Para INSTITUIÇÕES:
       nomeEscola: string
       cnpj: string
       telefone: string
       profileImage: string
       endereco: { ... }
       
       // Para RESPONSÁVEIS:
       nome: string
       telefone: string
       profileImage: string
       instituicaoId: string (referência)
   }
   - createdAt: timestamp
   - updatedAt: timestamp

2. atletas (coleção)
   - id (documento ID auto-gerado)
   - nome: string
   - idade: number
   - posicao: string
   - altura: number (opcional)
   - peso: number (opcional)
   - instituicaoId: string (referência à instituição)
   - responsavelId: string (referência ao responsável, opcional)
   - profileImage: string (URL)
   - midias: {
     fotos: array of {
       url: string
       isFavorite: boolean
       uploadedBy: string (uid do usuário)
       uploadedAt: timestamp
     }
     videos: array of {
       url: string
       thumbnail: string
       isFavorite: boolean
       uploadedBy: string (uid do usuário)
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

3. agendamentos (coleção)
   - id (documento ID auto-gerado)
   - olheiroId: string (referência ao olheiro)
   - instituicaoId: string (referência à instituição)
   - dataVisita: timestamp
   - horario: string (formato HH:MM)
   - status: 'pendente' | 'confirmado' | 'cancelado' | 'realizado'
   - observacoes: string
   - olheiro: { // Dados denormalizados para exibição
     nome: string
   }
   - instituicao: { // Dados denormalizados para exibição
     nomeEscola: string
   }
   - createdAt: timestamp
   - updatedAt: timestamp

4. convites (coleção)
   - id (documento ID auto-gerado)
   - instituicaoId: string (uid da instituição)
   - olheiroId: string (uid do olheiro)
   - atletaId: string (referência ao atleta)
   - mensagem: string
   - status: 'enviado' | 'aceito' | 'recusado'
   - olheiro: { // Dados denormalizados para exibição
     nome: string
   }
   - instituicao: { // Dados denormalizados para exibição
     nomeEscola: string
   }
   - atleta: { // Dados denormalizados para exibição
     nome: string
   }
   - createdAt: timestamp
   - updatedAt: timestamp

5. notificacoes (coleção) - OPCIONAL (não implementado ainda)
   - id (documento ID auto-gerado)
   - userId: string (uid do usuário)
   - titulo: string
   - mensagem: string
   - tipo: 'agendamento' | 'convite' | 'sistema'
   - isRead: boolean
   - createdAt: timestamp

ÍNDICES NECESSÁRIOS NO FIRESTORE:
==================================
- users: email, userType
- atletas: instituicaoId, responsavelId, createdAt
- agendamentos: olheiroId, instituicaoId, dataVisita, status
- convites: instituicaoId, olheiroId, status, createdAt
- notificacoes: userId, isRead, createdAt

REGRAS DE SEGURANÇA (Firestore Rules):
=======================================
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Atletas - Instituições e responsáveis podem gerenciar
    match /atletas/{atletaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'instituicao' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'responsavel'
      );
    }
    
    // Agendamentos - olheiros e instituições
    match /agendamentos/{agendamentoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'olheiro'
      );
      allow update, delete: if request.auth != null;
    }
    
    // Convites - instituições e olheiros
    match /convites/{conviteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && (
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'instituicao' ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userType == 'responsavel'
      );
      allow update: if request.auth != null;
    }
    
    // Notificações
    match /notificacoes/{notificacaoId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
  }
}
*/

// ========================================
// CONSTANTES
// ========================================

export const COLLECTIONS = {
  USERS: "users",
  ATLETAS: "atletas",
  AGENDAMENTOS: "agendamentos",
  CONVITES: "convites",
  NOTIFICACOES: "notificacoes",
};

export const USER_TYPES = {
  OLHEIRO: "olheiro",
  INSTITUICAO: "instituicao",
  RESPONSAVEL: "responsavel",
};

export const AGENDAMENTO_STATUS = {
  PENDENTE: "pendente",
  CONFIRMADO: "confirmado",
  CANCELADO: "cancelado",
  REALIZADO: "realizado",
};

export const CONVITE_STATUS = {
  ENVIADO: "enviado",
  ACEITO: "aceito",
  RECUSADO: "recusado",
};

// ========================================
// TEMPLATES DE DOCUMENTOS
// ========================================

export const createUserDocument = (uid, email, userType, profileData) => ({
  uid,
  email,
  userType,
  profile: profileData,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createAtletaDocument = (atletaData) => ({
  nome: atletaData.nome,
  idade: atletaData.idade,
  posicao: atletaData.posicao,
  altura: atletaData.altura || null,
  peso: atletaData.peso || null,
  instituicaoId: atletaData.instituicaoId,
  responsavelId: atletaData.responsavelId || null,
  profileImage: "",
  midias: {
    fotos: [],
    videos: [],
  },
  estatisticas: atletaData.estatisticas || {
    gols: 0,
    assistencias: 0,
    jogos: 0,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createAgendamentoDocument = (agendamentoData) => ({
  olheiroId: agendamentoData.olheiroId,
  instituicaoId: agendamentoData.instituicaoId,
  dataVisita: agendamentoData.dataVisita,
  horario: agendamentoData.horario,
  status: AGENDAMENTO_STATUS.PENDENTE,
  observacoes: agendamentoData.observacoes || "",
  olheiro: agendamentoData.olheiro || {},
  instituicao: agendamentoData.instituicao || {},
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const createConviteDocument = (conviteData) => ({
  instituicaoId: conviteData.instituicaoId,
  olheiroId: conviteData.olheiroId,
  atletaId: conviteData.atletaId,
  mensagem: conviteData.mensagem || "",
  status: CONVITE_STATUS.ENVIADO,
  olheiro: conviteData.olheiro || {},
  instituicao: conviteData.instituicao || {},
  atleta: conviteData.atleta || {},
  createdAt: new Date(),
  updatedAt: new Date(),
});

// ========================================
// VALIDAÇÕES
// ========================================

export const validateUserType = (userType) => {
  return Object.values(USER_TYPES).includes(userType);
};

export const validateAgendamentoStatus = (status) => {
  return Object.values(AGENDAMENTO_STATUS).includes(status);
};

export const validateConviteStatus = (status) => {
  return Object.values(CONVITE_STATUS).includes(status);
};

// ========================================
// NOTAS PARA MIGRAÇÃO FUTURA
// ========================================

/*
QUANDO MIGRAR PARA ESTRUTURA SEPARADA:
======================================

1. Criar coleções separadas:
   - olheiros (dados de olheiros)
   - instituicoes (dados de instituições)
   - responsaveis (dados de responsáveis)

2. Manter 'users' apenas com:
   - uid, email, userType, isActive, createdAt, updatedAt

3. Script de migração necessário:
   - Ler todos documentos de 'users'
   - Copiar 'profile' para coleção específica
   - Remover 'profile' de 'users'
   - Manter compatibilidade durante transição

4. Atualizar AuthService para:
   - Criar/ler de coleções separadas
   - Combinar dados em getUserData()
   - Atualizar em coleção específica

5. Benefícios:
   - Queries mais rápidas
   - Melhor organização
   - Segurança granular
   - Escalabilidade
*/
