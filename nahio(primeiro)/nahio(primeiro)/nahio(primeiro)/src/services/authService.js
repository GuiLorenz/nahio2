import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as updateFirebaseProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebaseConfig";

class AuthService {
  // Listener para mudanças no estado de autenticação
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Login
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: "Erro ao fazer logout" };
    }
  }

  // Registro de Olheiro
  async registerOlheiro(email, password, userData) {
    try {
      // Cria o usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Atualiza o displayName no Firebase Auth
      await updateFirebaseProfile(user, {
        displayName: userData.nome,
      });

      // Cria o documento do usuário no Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        userType: "olheiro",
        profile: {
          nome: userData.nome,
          telefone: userData.telefone || "",
          profileImage: "",
          endereco: {
            cep: "",
            logradouro: "",
            numero: "",
            complemento: "",
            bairro: "",
            cidade: "",
            estado: "",
          },
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, user: user };
    } catch (error) {
      console.error("Register Olheiro error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Registro de Instituição
  async registerInstituicao(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateFirebaseProfile(user, {
        displayName: userData.nomeEscola,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        userType: "instituicao",
        profile: {
          nomeEscola: userData.nomeEscola,
          cnpj: userData.cnpj,
          telefone: userData.telefone || "",
          profileImage: "",
          endereco: {
            cep: userData.cep || "",
            logradouro: userData.logradouro || "",
            numero: userData.numero || "",
            complemento: userData.complemento || "",
            bairro: userData.bairro || "",
            cidade: userData.cidade || "",
            estado: userData.estado || "",
          },
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, user: user };
    } catch (error) {
      console.error("Register Instituicao error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Registro de Responsável
  async registerResponsavel(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateFirebaseProfile(user, {
        displayName: userData.nome,
      });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        userType: "responsavel",
        profile: {
          nome: userData.nome,
          telefone: userData.telefone || "",
          profileImage: "",
          instituicaoId: userData.instituicaoId || null,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, user: user };
    } catch (error) {
      console.error("Register Responsavel error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Buscar dados do usuário
  async getUserData(uid) {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { success: true, userData: docSnap.data() };
      } else {
        return { success: false, error: "Usuário não encontrado" };
      }
    } catch (error) {
      console.error("Get user data error:", error);
      return { success: false, error: "Erro ao buscar dados do usuário" };
    }
  }

  // Atualizar perfil do usuário
  async updateUserProfile(uid, profileData) {
    try {
      const userRef = doc(db, "users", uid);

      await updateDoc(userRef, {
        profile: profileData,
        updatedAt: serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: "Erro ao atualizar perfil" };
    }
  }

  // Resetar senha
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  // Mensagens de erro traduzidas
  getErrorMessage(errorCode) {
    const errorMessages = {
      "auth/email-already-in-use": "Este email já está em uso",
      "auth/invalid-email": "Email inválido",
      "auth/operation-not-allowed": "Operação não permitida",
      "auth/weak-password": "Senha muito fraca. Use pelo menos 6 caracteres",
      "auth/user-disabled": "Usuário desabilitado",
      "auth/user-not-found": "Usuário não encontrado",
      "auth/wrong-password": "Senha incorreta",
      "auth/invalid-credential": "Credenciais inválidas",
      "auth/too-many-requests": "Muitas tentativas. Tente novamente mais tarde",
      "auth/network-request-failed": "Erro de conexão. Verifique sua internet",
    };

    return errorMessages[errorCode] || "Erro desconhecido. Tente novamente";
  }
}

export default new AuthService();
