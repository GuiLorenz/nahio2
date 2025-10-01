import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../styles/colors";
import { globalStyles } from "../styles/globalStyles";
import CepService from "../services/cepService";
import AuthService from "../services/authService";

const RegisterInstituicaoScreen = ({ navigation }) => {
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);

  const [nomeEscola, setNomeEscola] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");

  const [nomeResponsavel, setNomeResponsavel] = useState("");
  const [emailResponsavel, setEmailResponsavel] = useState("");
  const [senhaProvisoria, setSenhaProvisoria] = useState("");

  const formatCEP = useCallback((value) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 5) return numericValue;
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
  }, []);

  const formatCNPJ = useCallback((value) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 2) return numericValue;
    if (numericValue.length <= 5)
      return `${numericValue.slice(0, 2)}.${numericValue.slice(2)}`;
    if (numericValue.length <= 8)
      return `${numericValue.slice(0, 2)}.${numericValue.slice(
        2,
        5
      )}.${numericValue.slice(5)}`;
    if (numericValue.length <= 12)
      return `${numericValue.slice(0, 2)}.${numericValue.slice(
        2,
        5
      )}.${numericValue.slice(5, 8)}/${numericValue.slice(8)}`;

    return `${numericValue.slice(0, 2)}.${numericValue.slice(
      2,
      5
    )}.${numericValue.slice(5, 8)}/${numericValue.slice(
      8,
      12
    )}-${numericValue.slice(12, 14)}`;
  }, []);

  const formatTelefone = useCallback((value) => {
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length <= 2) return `(${numericValue}`;
    if (numericValue.length <= 7)
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;

    if (numericValue.length > 10) {
      return `(${numericValue.slice(0, 2)}) ${numericValue.slice(
        2,
        7
      )}-${numericValue.slice(7, 11)}`;
    }
    return `(${numericValue.slice(0, 2)}) ${numericValue.slice(
      2,
      6
    )}-${numericValue.slice(6, 10)}`;
  }, []);

  const handleCEPChange = async (cepValue) => {
    const formattedCep = formatCEP(cepValue);
    setCep(formattedCep);
    const cepLimpo = formattedCep.replace(/\D/g, "");

    if (cepLimpo.length === 8) {
      Keyboard.dismiss();
      setLoadingCEP(true);

      try {
        const resultado = await CepService.buscarCep(cepLimpo);
        if (resultado.success && !resultado.data.erro) {
          setLogradouro(resultado.data.logradouro || "");
          setBairro(resultado.data.bairro || "");
          setCidade(resultado.data.localidade || "");
          setEstado(resultado.data.uf || "");
        } else {
          Alert.alert("Erro", "CEP não encontrado ou inválido.");
          setLogradouro("");
          setBairro("");
          setCidade("");
          setEstado("");
        }
      } catch (error) {
        Alert.alert("Erro", "Falha ao consultar CEP. Tente novamente.");
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  const validateStep1 = () => {
    const fields = [
      { value: nomeEscola, msg: "Nome da escola" },
      {
        value: cnpj,
        msg: "CNPJ",
        check: (v) => v.replace(/\D/g, "").length === 14,
      },
      { value: telefone, msg: "Telefone" },
      { value: email, msg: "E-mail" },
      { value: senha, msg: "Senha" },
    ];

    for (const field of fields) {
      if (!field.value.trim()) {
        Alert.alert("Erro", `${field.msg} é obrigatório.`);
        return false;
      }
      if (field.check && !field.check(field.value)) {
        Alert.alert("Erro", `${field.msg} está incompleto ou inválido.`);
        return false;
      }
    }

    if (senha.length < 6) {
      Alert.alert("Erro", "A senha deve ter pelo menos 6 caracteres.");
      return false;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const fields = [
      {
        value: cep,
        msg: "CEP",
        check: (v) => v.replace(/\D/g, "").length === 8,
      },
      { value: logradouro, msg: "Logradouro" },
      { value: numero, msg: "Número" },
      { value: bairro, msg: "Bairro" },
      { value: cidade, msg: "Cidade" },
      { value: estado, msg: "Estado", check: (v) => v.length === 2 },
    ];

    for (const field of fields) {
      if (!field.value.trim()) {
        Alert.alert("Erro", `${field.msg} é obrigatório.`);
        return false;
      }
      if (field.check && !field.check(field.value)) {
        Alert.alert("Erro", `${field.msg} está incompleto ou inválido.`);
        return false;
      }
    }
    return true;
  };

  const validateStep3 = () => {
    const fields = [
      { value: nomeResponsavel, msg: "Nome do responsável" },
      { value: emailResponsavel, msg: "E-mail do responsável" },
      { value: senhaProvisoria, msg: "Senha provisória" },
    ];

    for (const field of fields) {
      if (!field.value.trim()) {
        Alert.alert("Erro", `${field.msg} é obrigatório.`);
        return false;
      }
    }

    if (senhaProvisoria.length < 6) {
      Alert.alert(
        "Erro",
        "A senha provisória deve ter pelo menos 6 caracteres."
      );
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRegister = async () => {
    if (!validateStep3()) return;

    setLoading(true);

    try {
      const instituicaoData = {
        nomeEscola: nomeEscola.trim(),
        cnpj: cnpj.replace(/\D/g, ""),
        telefone: telefone.replace(/\D/g, ""),
        endereco: {
          cep: cep.replace(/\D/g, ""),
          logradouro: logradouro.trim(),
          numero: numero.trim(),
          complemento: complemento.trim(),
          bairro: bairro.trim(),
          cidade: cidade.trim(),
          estado: estado.trim(),
        },
      };

      const result = await register(
        email.trim(),
        senha,
        "instituicao",
        instituicaoData
      );

      if (result.success) {
        const instituicaoId = result.user.uid;

        try {
          await AuthService.cadastrarResponsavel(
            instituicaoId,
            nomeResponsavel.trim(),
            emailResponsavel.trim(),
            senhaProvisoria
          );

          Alert.alert(
            "Sucesso! 🎉",
            "Instituição cadastrada com sucesso! O responsável receberá um e-mail.",
            [{ text: "OK", onPress: () => navigation.navigate("Login") }]
          );
        } catch (respError) {
          console.error("Erro ao cadastrar responsável:", respError);
          Alert.alert(
            "Aviso",
            "Instituição criada, mas houve erro ao cadastrar o responsável. Entre em contato com o suporte.",
            [{ text: "OK", onPress: () => navigation.navigate("Login") }]
          );
        }
      } else {
        Alert.alert("Erro", result.error || "Erro ao cadastrar instituição.");
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      Alert.alert("Erro", "Erro inesperado ao cadastrar.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dados da Instituição</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nome da Escola *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome completo da instituição"
          placeholderTextColor={colors.inputPlaceholder}
          value={nomeEscola}
          onChangeText={setNomeEscola}
          autoCapitalize="words"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>CNPJ *</Text>
        <TextInput
          style={styles.input}
          placeholder="00.000.000/0000-00"
          placeholderTextColor={colors.inputPlaceholder}
          value={cnpj}
          onChangeText={(text) => setCnpj(formatCNPJ(text))}
          keyboardType="numeric"
          maxLength={18}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Telefone *</Text>
        <TextInput
          style={styles.input}
          placeholder="(00) 00000-0000"
          placeholderTextColor={colors.inputPlaceholder}
          value={telefone}
          onChangeText={(text) => setTelefone(formatTelefone(text))}
          keyboardType="phone-pad"
          maxLength={15}
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>E-mail (Login Instituição) *</Text>
        <TextInput
          style={styles.input}
          placeholder="email@instituicao.com"
          placeholderTextColor={colors.inputPlaceholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Senha *</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor={colors.inputPlaceholder}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Confirmar Senha *</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirme sua senha"
          placeholderTextColor={colors.inputPlaceholder}
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Endereço</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>CEP *</Text>
        <View style={styles.cepContainer}>
          <TextInput
            style={[styles.input, styles.cepInput]}
            placeholder="00000-000"
            placeholderTextColor={colors.inputPlaceholder}
            value={cep}
            onChangeText={handleCEPChange}
            keyboardType="numeric"
            maxLength={9}
          />
          {loadingCEP && (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.cepLoader}
            />
          )}
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Logradouro *</Text>
        <TextInput
          style={styles.input}
          placeholder="Rua, Avenida, etc."
          placeholderTextColor={colors.inputPlaceholder}
          value={logradouro}
          onChangeText={setLogradouro}
          autoCapitalize="words"
          editable={!loadingCEP}
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.flex1]}>
          <Text style={styles.inputLabel}>Número *</Text>
          <TextInput
            style={styles.input}
            placeholder="123"
            placeholderTextColor={colors.inputPlaceholder}
            value={numero}
            onChangeText={setNumero}
            keyboardType="numeric"
            editable={!loadingCEP}
          />
        </View>
        <View style={[styles.inputContainer, styles.flex2, { marginLeft: 15 }]}>
          <Text style={styles.inputLabel}>Complemento</Text>
          <TextInput
            style={styles.input}
            placeholder="Apto, Sala, etc."
            placeholderTextColor={colors.inputPlaceholder}
            value={complemento}
            onChangeText={setComplemento}
            autoCapitalize="words"
            editable={!loadingCEP}
          />
        </View>
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Bairro *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do bairro"
          placeholderTextColor={colors.inputPlaceholder}
          value={bairro}
          onChangeText={setBairro}
          autoCapitalize="words"
          editable={!loadingCEP}
        />
      </View>
      <View style={styles.row}>
        <View style={[styles.inputContainer, styles.flex2]}>
          <Text style={styles.inputLabel}>Cidade *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nome da cidade"
            placeholderTextColor={colors.inputPlaceholder}
            value={cidade}
            onChangeText={setCidade}
            autoCapitalize="words"
            editable={!loadingCEP}
          />
        </View>
        <View style={[styles.inputContainer, styles.flex1, { marginLeft: 15 }]}>
          <Text style={styles.inputLabel}>Estado *</Text>
          <TextInput
            style={styles.input}
            placeholder="UF"
            placeholderTextColor={colors.inputPlaceholder}
            value={estado}
            onChangeText={setEstado}
            autoCapitalize="characters"
            maxLength={2}
            editable={!loadingCEP}
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Responsável (Gestor Principal)</Text>
      <Text style={styles.stepSubtitle}>
        Dados do primeiro responsável que poderá gerenciar os atletas da
        instituição.
      </Text>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nome do Responsável *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome completo"
          placeholderTextColor={colors.inputPlaceholder}
          value={nomeResponsavel}
          onChangeText={setNomeResponsavel}
          autoCapitalize="words"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>E-mail do Responsável *</Text>
        <TextInput
          style={styles.input}
          placeholder="email@responsavel.com"
          placeholderTextColor={colors.inputPlaceholder}
          value={emailResponsavel}
          onChangeText={setEmailResponsavel}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Senha Provisória *</Text>
        <TextInput
          style={styles.input}
          placeholder="Mínimo 6 caracteres"
          placeholderTextColor={colors.inputPlaceholder}
          value={senhaProvisoria}
          onChangeText={setSenhaProvisoria}
          secureTextEntry
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          ℹ️ O responsável receberá um e-mail para definir sua senha final e
          acessar o aplicativo.
        </Text>
      </View>
    </View>
  );

  const isNavigationDisabled = loading || (step === 2 && loadingCEP);

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cadastro de Instituição</Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={styles.progressBarContainer}>
          <View
            style={[styles.progressBarFill, { width: `${(step / 3) * 100}%` }]}
          />
        </View>
        <View style={styles.stepIndicatorContainer}>
          <Text style={styles.stepIndicatorText}>Passo {step} de 3</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity
              style={[
                styles.backButtonStep,
                isNavigationDisabled && styles.buttonDisabled,
              ]}
              onPress={handlePreviousStep}
              disabled={isNavigationDisabled}
            >
              <Text style={styles.backStepButtonText}>Voltar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              styles.nextButton,
              isNavigationDisabled && styles.buttonDisabled,
              step === 1 && { flex: 1, marginLeft: 0 },
            ]}
            onPress={step < 3 ? handleNextStep : handleRegister}
            disabled={isNavigationDisabled}
          >
            {loading ? (
              <ActivityIndicator color={colors.textPrimary} />
            ) : (
              <Text style={styles.buttonText}>
                {step < 3 ? "Próximo" : "Cadastrar"}
              </Text>
            )}
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
    width: 30,
    alignItems: "flex-start",
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: colors.inputBorder,
    borderRadius: 5,
    marginBottom: 10,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  stepIndicatorContainer: {
    alignItems: "flex-end",
    marginBottom: 30,
    paddingRight: 5,
  },
  stepIndicatorText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "500",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
    marginLeft: 5,
    fontWeight: "600",
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
  cepContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cepInput: {
    flex: 1,
  },
  cepLoader: {
    position: "absolute",
    right: 15,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flex1: {
    flex: 1,
  },
  flex2: {
    flex: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    paddingHorizontal: 5,
  },
  backButtonStep: {
    backgroundColor: colors.backgroundCard,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  backStepButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    flex: 2,
    marginLeft: 10,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoContainer: {
    backgroundColor: colors.inputBackground,
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});

export default RegisterInstituicaoScreen;
