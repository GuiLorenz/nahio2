import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";
import { COLLECTIONS, USER_TYPES } from "./firebaseStructure";

/**
 * Serviço para gerenciar todas as operações de Autenticação e Perfil do Usuário
 * no Firebase Auth e Firestore.
 */
class AuthService {
  /**
   * Auxiliar privado para padronizar o tratamento de erros.
   */
  _handleError(operation, error) {
    console.error(`Erro ao ${operation}:`, error);
    return { success: false, error: error.message };
  }

  /**
   * Auxiliar privado para determinar o nome da coleção de perfil.
   */
  _getProfileCollectionName(userType) {
    switch (userType) {
      case USER_TYPES.OLHEIRO:
        return COLLECTIONS.OLHEIROS;
      case USER_TYPES.INSTITUICAO:
        return COLLECTIONS.INSTITUICOES;
      case USER_TYPES.RESPONSAVEL:
        return COLLECTIONS.RESPONSAVEIS;
      default:
        return null;
    }
  }

  /**
   * Auxiliar privado para salvar o documento base na coleção 'users'.
   */
  async _saveBaseUserDoc(uid, email, userType) {
    const userDocRef = doc(db, COLLECTIONS.USERS, uid);
    await setDoc(userDocRef, {
      email: email,
      userType: userType,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    });
  }

  // ✅ MÉTODO PRINCIPAL DE REGISTRO (compatível com AuthContext)
  /**
   * Registra um novo usuário no Auth e cria documentos no Firestore.
   * @param {string} email Email do usuário.
   * @param {string} password Senha.
   * @param {string} userType Tipo de usuário ('olheiro', 'instituicao', 'responsavel').
   * @param {object} additionalData Dados específicos do perfil.
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  async register(email, password, userType, additionalData = {}) {
    try {
      // Normalizar userType para uppercase (se necessário)
      const normalizedUserType = userType.toLowerCase();

      // Mapear strings para constantes USER_TYPES
      let mappedUserType;
      switch (normalizedUserType) {
        case "olheiro":
          mappedUserType = USER_TYPES.OLHEIRO;
          break;
        case "instituicao":
          mappedUserType = USER_TYPES.INSTITUICAO;
          break;
        case "responsavel":
          mappedUserType = USER_TYPES.RESPONSAVEL;
          break;
        default:
          throw new Error("Tipo de usuário inválido");
      }

      const collectionName = this._getProfileCollectionName(mappedUserType);

      if (!collectionName) {
        throw new Error("Tipo de usuário inválido para registro");
      }

      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. Criar documento base na coleção 'users'
      await this._saveBaseUserDoc(user.uid, email, mappedUserType);

      // 3. Criar documento específico do perfil
      await setDoc(doc(db, collectionName, user.uid), {
        ...additionalData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, user };
    } catch (error) {
      return this._handleError("registrar usuário", error);
    }
  }

  // ✅ MANTIDO: Método antigo para compatibilidade (opcional)
  /**
   * @deprecated Use register() ao invés de registerUser()
   */
  async registerUser(email, password, userData, userType) {
    return this.register(email, password, userType, userData);
  }

  /**
   * Realiza o login do usuário.
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
      if (!userDoc.exists()) {
        throw new Error("Dados do usuário não encontrados no Firestore.");
      }

      return { success: true, user, userData: userDoc.data() };
    } catch (error) {
      return this._handleError("fazer login", error);
    }
  }

  /**
   * Realiza o logout do usuário.
   */
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return this._handleError("fazer logout", error);
    }
  }

  /**
   * Envia um email de redefinição de senha.
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      return this._handleError("enviar email de recuperação", error);
    }
  }

  /**
   * Observa mudanças no estado de autenticação.
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Obtém os dados do usuário (base + perfil específico).
   */
  async getUserData(uid) {
    try {
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (!userDoc.exists()) {
        return { success: false, error: "Usuário não encontrado" };
      }

      const userData = userDoc.data();
      const userType = userData.userType;
      let profileData = null;

      const collectionName = this._getProfileCollectionName(userType);

      if (collectionName) {
        const profileDoc = await getDoc(doc(db, collectionName, uid));
        if (profileDoc.exists()) {
          profileData = profileDoc.data();
        }
      }

      return {
        success: true,
        userData: { ...userData, profile: profileData },
      };
    } catch (error) {
      return this._handleError("buscar dados do usuário", error);
    }
  }

  /**
   * Cria um usuário do tipo RESPONSÁVEL para uma instituição.
   */
  async createResponsavel(
    instituicaoId,
    responsavelEmail,
    responsavelNome,
    senhaProvisoria
  ) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        responsavelEmail,
        senhaProvisoria
      );
      const user = userCredential.user;

      await this._saveBaseUserDoc(
        user.uid,
        responsavelEmail,
        USER_TYPES.RESPONSAVEL
      );

      await setDoc(doc(db, COLLECTIONS.RESPONSAVEIS, user.uid), {
        nome: responsavelNome,
        instituicaoId: instituicaoId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await sendPasswordResetEmail(auth, responsavelEmail);

      return { success: true, responsavelId: user.uid };
    } catch (error) {
      return this._handleError("criar responsável", error);
    }
  }

  /**
   * ✅ ADICIONADO: Método para cadastrar responsável (compatível com RegisterInstituicaoScreen)
   */
  async cadastrarResponsavel(instituicaoId, nome, email, senhaProvisoria) {
    return this.createResponsavel(instituicaoId, email, nome, senhaProvisoria);
  }

  /**
   * Atualiza os dados de perfil do usuário.
   */
  async updateProfile(uid, userType, updatedData) {
    try {
      const collectionName = this._getProfileCollectionName(userType);

      if (!collectionName) {
        throw new Error("Tipo de usuário inválido para atualização");
      }

      await setDoc(
        doc(db, collectionName, uid),
        {
          ...updatedData,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { success: true };
    } catch (error) {
      return this._handleError("atualizar perfil", error);
    }
  }

  /**
   * ✅ ADICIONADO: Wrapper para updateProfile (compatível com AuthContext)
   */
  async updateUserProfile(uid, profileData) {
    try {
      // Buscar o userType do usuário
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid));
      if (!userDoc.exists()) {
        throw new Error("Usuário não encontrado");
      }

      const userData = userDoc.data();
      const userType = userData.userType;

      return await this.updateProfile(uid, userType, profileData);
    } catch (error) {
      return this._handleError("atualizar perfil de usuário", error);
    }
  }
}

export default new AuthService();
