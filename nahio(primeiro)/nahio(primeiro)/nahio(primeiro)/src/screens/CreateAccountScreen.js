import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../styles/colors";
import { globalStyles } from "../styles/globalStyles";

const CreateAccountScreen = ({ navigation }) => {
  const [selectedType, setSelectedType] = useState(null);

  const handleContinue = () => {
    if (!selectedType) {
      return;
    }

    switch (selectedType) {
      case "olheiro":
        navigation.navigate("RegisterOlheiro");
        break;
      case "instituicao":
        navigation.navigate("RegisterInstituicao");
        break;
      default:
        break;
    }
  };

  const handleLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Escolha seu perfil</Text>
          <Text style={styles.subtitle}>
            Selecione o tipo de conta que melhor se adequa às suas necessidades
          </Text>
          {!selectedType && (
            <Text style={styles.helperText}>
              Selecione uma opção para continuar.
            </Text>
          )}
        </View>

        {/* Opções de perfil */}
        <View style={styles.optionsContainer}>
          {/* Opção Olheiro */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === "olheiro" && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedType("olheiro")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconCircle,
                selectedType === "olheiro" && styles.iconCircleSelected,
              ]}
            >
              <Text style={styles.iconEmoji}>👤</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Olheiro</Text>
              <Text style={styles.optionDescription}>
                Descubra novos talentos
              </Text>
            </View>
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radio,
                  selectedType === "olheiro" && styles.radioSelected,
                ]}
              >
                {selectedType === "olheiro" && <View style={styles.radioDot} />}
              </View>
            </View>
          </TouchableOpacity>

          {/* Opção Instituição */}
          <TouchableOpacity
            style={[
              styles.optionCard,
              selectedType === "instituicao" && styles.optionCardSelected,
            ]}
            onPress={() => setSelectedType("instituicao")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconCircle,
                selectedType === "instituicao" && styles.iconCircleSelected,
              ]}
            >
              <Text style={styles.iconEmoji}>🏫</Text>
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Instituição</Text>
              <Text style={styles.optionDescription}>
                Gerencie sua instituição
              </Text>
            </View>
            <View style={styles.radioContainer}>
              <View
                style={[
                  styles.radio,
                  selectedType === "instituicao" && styles.radioSelected,
                ]}
              >
                {selectedType === "instituicao" && (
                  <View style={styles.radioDot} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedType && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedType}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>

          {/* Link para login */}
          <TouchableOpacity
            style={styles.loginContainer}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.loginText}>
              Já tem conta? <Text style={styles.loginLink}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  helperText: {
    marginTop: 16,
    fontSize: 14,
    color: "#5B7FFF",
    fontWeight: "600",
    textAlign: "center",
  },
  optionsContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 40,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.backgroundCard,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.inputBackground,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconCircleSelected: {
    backgroundColor: colors.primary,
  },
  iconEmoji: {
    fontSize: 28,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  radioContainer: {
    marginLeft: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  radioSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    marginTop: "auto",
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.5,
  },
  continueButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  loginContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  loginLink: {
    color: colors.primary,
    fontWeight: "bold",
  },
});

export default CreateAccountScreen;
