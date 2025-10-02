import React, { createContext, useContext, useEffect, useState } from "react";
import AuthService from "../services/authService";
import { Alert } from "react-native";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = null;

    // ✅ Timeout de segurança para garantir que o loading nunca fique travado
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn("⚠️ Timeout de segurança ativado - forçando fim do loading");
        setLoading(false);
        setIsAuthenticated(false);
      }
    }, 10000); // 10 segundos

    const initAuth = async () => {
      try {
        unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
          if (!mounted) return;

          try {
            if (firebaseUser) {
              console.log("✅ Usuário autenticado:", firebaseUser.uid);
              setUser(firebaseUser);

              // Buscar dados do usuário no Firestore
              const result = await AuthService.getUserData(firebaseUser.uid);

              if (!mounted) return;

              if (result.success && result.userData) {
                console.log("✅ Dados do usuário carregados:", result.userData.userType);
                
                // Validar dados mínimos necessários
                if (result.userData.uid && result.userData.userType) {
                  setUserData(result.userData);
                  setIsAuthenticated(true);
                } else {
                  console.error("❌ Dados do usuário incompletos");
                  await AuthService.logout();
                  setUser(null);
                  setUserData(null);
                  setIsAuthenticated(false);
                  Alert.alert(
                    "Erro",
                    "Seus dados de usuário estão incompletos. Por favor, entre em contato com o suporte."
                  );
                }
              } else {
                console.error("❌ Erro ao buscar dados:", result.error);
                await AuthService.logout();
                setUser(null);
                setUserData(null);
                setIsAuthenticated(false);
              }
            } else {
              console.log("ℹ️ Nenhum usuário autenticado");
              setUser(null);
              setUserData(null);
              setIsAuthenticated(false);
            }
          } catch (error) {
            console.error("❌ Erro no listener de autenticação:", error);
            if (mounted) {
              setUser(null);
              setUserData(null);
              setIsAuthenticated(false);
            }
          } finally {
            if (mounted) {
              clearTimeout(safetyTimeout);
              setLoading(false);
            }
          }
        });
      } catch (error) {
        console.error("❌ Erro ao inicializar autenticação:", error);
        if (mounted) {
          setUser(null);
          setUserData(null);
          setIsAuthenticated(false);
          setLoading(false);
        }
      }
    };

    initAuth();

    // Cleanup
    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (error) {
          console.error("Erro ao remover listener:", error);
        }
      }
    };
  }, []);

  const login = async (email, password) => {
    try {
      const result = await AuthService.login(email, password);
      if (result.success) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "Erro desconhecido no login.",
        };
      }
    } catch (error) {
      console.error("AuthContext Login Error:", error);
      return {
        success: false,
        error: "Ocorreu um erro no sistema. Tente novamente.",
      };
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setUserData(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Erro", "Não foi possível desconectar.");
    }
  };

  const register = async (email, password, userType, additionalData = {}) => {
    try {
      const result = await AuthService.register(
        email,
        password,
        userType,
        additionalData
      );
      if (result.success) {
        return { success: true, user: result.user };
      } else {
        return {
          success: false,
          error: result.error || "Erro ao cadastrar usuário.",
        };
      }
    } catch (error) {
      console.error("AuthContext Register Error:", error);
      return {
        success: false,
        error: "Ocorreu um erro no sistema. Tente novamente.",
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      if (!user?.uid) {
        return { success: false, error: "Usuário não autenticado." };
      }

      const result = await AuthService.updateUserProfile(user.uid, profileData);

      if (result.success) {
        setUserData((prevData) => ({
          ...prevData,
          profile: {
            ...(prevData?.profile || {}),
            ...profileData,
          },
        }));

        return { success: true };
      } else {
        return {
          success: false,
          error: result.error || "Erro ao atualizar perfil.",
        };
      }
    } catch (error) {
      console.error("Update Profile Error:", error);
      return { success: false, error: "Erro inesperado ao atualizar perfil." };
    }
  };

  const value = {
    user,
    userData,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};