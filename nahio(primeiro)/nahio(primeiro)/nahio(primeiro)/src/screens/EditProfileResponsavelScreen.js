import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../styles/colors";
import { globalStyles } from "../styles/globalStyles";

const formatTelefone = (value) => {
  const numericValue = value.replace(/\D/g, "");

  if (numericValue.length <= 2) {
    return `(${numericValue}`;
  } else if (numericValue.length <= 7) {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
  } else if (numericValue.length <= 10) {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(
      2,
      6
    )}-${numericValue.slice(6, 10)}`;
  } else {
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(
      2,
      7
    )}-${numericValue.slice(7, 11)}`;
  }
};

const EditProfileResponsavelScreen = ({ navigation }) => {
  const { userData, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const loadUserData = useCallback(() => {
    if (userData?.profile) {
      const profile = userData.profile;
      setNome(profile.nome || "");
      setTelefone(profile.telefone?.replace(/\D/g, "") || "");
      setProfileImage(profile.profileImage || "");
    }
  }, [userData]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleTelefoneChange = (text) => {
    setTelefone(text.replace(/\D/g, ""));
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Erro", "Permissão para acessar galeria é necessária.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setUploadingImage(true);
        setProfileImage(result.assets[0].uri);
        setUploadingImage(false);
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Erro ao selecionar ou fazer upload da imagem.");
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    if (!nome.trim()) {
      Alert.alert("Erro", "Nome é obrigatório.");
      return false;
    }
    if (telefone.length > 0 && telefone.length < 10) {
      Alert.alert("Erro", "O Telefone deve conter pelo menos 10 dígitos.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);

    try {
      const updatedProfile = {
        nome: nome.trim(),
        telefone: telefone,
        profileImage,
      };

      const result = await updateProfile(updatedProfile);

      if (result.success) {
        Alert.alert("Sucesso", "Perfil atualizado com sucesso! 🎉");
        navigation.goBack();
      } else {
        Alert.alert(
          "Erro",
          result.error || "Erro ao atualizar perfil. Tente novamente."
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Erro inesperado ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = () => {
    navigation.openDrawer();
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil do Responsável</Text>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.saveButtonText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileImageSection}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.profileImageContainer}
              disabled={uploadingImage}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <Text style={styles.profileImageText}>
                    {nome.charAt(0).toUpperCase() || "👤"}
                  </Text>
                </View>
              )}
              {uploadingImage && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color={colors.textPrimary} size="large" />
                </View>
              )}
              <View style={styles.editImageIcon}>
                <Text style={styles.editImageIconText}>📷</Text>
              </View>
            </TouchableOpacity>
            <Text style={styles.profileImageLabel}>
              Toque para alterar foto
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dados Pessoais</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nome Completo *</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.textMuted}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Telefone</Text>
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor={colors.textMuted}
                value={formatTelefone(telefone)}
                onChangeText={handleTelefoneChange}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={userData?.email || ""}
                editable={false}
                placeholderTextColor={colors.textMuted}
              />
              <Text style={styles.inputHelp}>
                O e-mail não pode ser alterado
              </Text>
            </View>
          </View>
          <View style={{ height: 50 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuButton: {
    width: 30,
    height: 30,
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  menuLine: {
    height: 2,
    backgroundColor: colors.textPrimary,
    borderRadius: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImageText: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: "bold",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  editImageIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  editImageIconText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  profileImageLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 5,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    color: colors.textPrimary,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: colors.inputBackgroundDisabled,
    color: colors.textMuted,
  },
  inputHelp: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
    marginLeft: 5,
  },
});

export default EditProfileResponsavelScreen;
