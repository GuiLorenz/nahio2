import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import CepService from '../services/cepService';

const RegisterOlheiroScreen = ({ navigation }) => {
    const { register } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [formData, setFormData] = useState({
        formacaoAcademica: '',
        experiencia: '',
        nome: '',
        telefone: '',
        email: '',
        senha: '',
        confirmarSenha: '',
        cep: '',
        estado: '',
        cidade: '',
        rua: '',
        numero: '',
    });
    const [focusedField, setFocusedField] = useState(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    
    const updateFormData = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const formatCep = useCallback((value) => {
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length <= 5) return numericValue;
        return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
    }, []);

    const formatTelefone = useCallback((value) => {
        const numericValue = value.replace(/\D/g, '');
        if (numericValue.length <= 2) return `(${numericValue}`;
        if (numericValue.length <= 7) return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2)}`;
        
        if (numericValue.length > 10) {
            return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 7)}-${numericValue.slice(7, 11)}`;
        }
        return `(${numericValue.slice(0, 2)}) ${numericValue.slice(2, 6)}-${numericValue.slice(6, 10)}`;
    }, []);

    const handleCepChange = async (value) => {
        const formattedCep = formatCep(value);
        updateFormData('cep', formattedCep);
        const cepLimpo = formattedCep.replace(/\D/g, '');

        if (cepLimpo.length === 8) {
            Keyboard.dismiss();
            setLoadingCep(true);
            try {
                const result = await CepService.buscarCep(cepLimpo);
                if (result.success && !result.data.erro) {
                    updateFormData('estado', result.data.uf || '');
                    updateFormData('cidade', result.data.localidade || '');
                    updateFormData('rua', result.data.logradouro || '');
                } else {
                    Alert.alert('Erro', 'CEP não encontrado. Digite o endereço manualmente.');
                    updateFormData('estado', '');
                    updateFormData('cidade', '');
                    updateFormData('rua', '');
                }
            } catch (error) {
                Alert.alert('Erro', 'Falha ao consultar CEP.');
            } finally {
                setLoadingCep(false);
            }
        } else if (cepLimpo.length < 8) {
            updateFormData('estado', '');
            updateFormData('cidade', '');
            updateFormData('rua', '');
        }
    };

    const validateStep = (step) => {
        const { nome, telefone, email, senha, confirmarSenha, cep, estado, cidade, rua, numero, formacaoAcademica, experiencia } = formData;
        
        switch (step) {
            case 1:
                return formacaoAcademica.trim().length > 5;
            case 2:
                return experiencia.trim().length > 5;
            case 3:
                const isPasswordValid = senha.length >= 6 && senha === confirmarSenha;
                const isEmailValid = email.trim().includes('@');
                const isTelefoneValid = telefone.replace(/\D/g, '').length >= 10;
                
                if (!nome.trim() || !email.trim() || !telefone.trim() || !senha.trim() || !confirmarSenha.trim()) {
                    return false;
                }
                if (!isTelefoneValid) {
                     Alert.alert('Erro', 'O Telefone parece incompleto.');
                     return false;
                }
                if (!isEmailValid) {
                    Alert.alert('Erro', 'O E-mail é inválido.');
                    return false;
                }
                if (!isPasswordValid) {
                    Alert.alert('Erro', 'A senha deve ter no mínimo 6 caracteres e as senhas devem coincidir.');
                    return false;
                }
                return true;
            case 4:
                return cep.replace(/\D/g, '').length === 8 && estado.trim().length === 2 && cidade.trim() !== '' && rua.trim() !== '' && numero.trim() !== '';
            default:
                return false;
        }
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) {
            Alert.alert('Atenção', 'Por favor, preencha corretamente todos os campos do passo atual.');
            return;
        }
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            handleRegister();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleRegister = async () => {
        if (!acceptedTerms) {
            Alert.alert('Erro', 'Você deve aceitar os termos de uso e política de privacidade para prosseguir.');
            return;
        }
        setLoading(true);
        try {
            const userData = {
                nome: formData.nome.trim(),
                formacaoAcademica: formData.formacaoAcademica.trim(),
                experiencia: formData.experiencia.trim(),
                telefone: formData.telefone.replace(/\D/g, ''),
                endereco: {
                    cep: formData.cep.replace(/\D/g, ''),
                    estado: formData.estado.trim().toUpperCase(),
                    cidade: formData.cidade.trim(),
                    rua: formData.rua.trim(),
                    numero: formData.numero.trim(),
                },
            };
            
            // ✅ CORRIGIDO: Usando apenas 3 parâmetros (email, senha, userType, additionalData)
            const result = await register(formData.email.trim(), formData.senha, 'olheiro', userData);

            if (result.success) {
                Alert.alert('Sucesso 🎉', 'Seu cadastro foi concluído!');
            } else {
                Alert.alert('Erro', result.error || 'Erro ao criar conta. Tente novamente.');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Erro inesperado ao criar conta.');
        } finally {
            setLoading(false);
        }
    };

    const renderProgressBar = () => (
        <View style={styles.progressContainer}>
            <View style={styles.progressSteps}>
                {[1, 2, 3, 4].map((step, index, array) => (
                    <React.Fragment key={step}>
                        <View style={styles.stepContainer}>
                            <View style={[
                                styles.stepCircle,
                                step <= currentStep && styles.stepCircleActive,
                                step < currentStep && styles.stepCircleCompleted
                            ]}>
                                <Text style={[
                                    styles.stepNumber,
                                    step <= currentStep && styles.stepNumberActive,
                                    step < currentStep && { color: colors.textPrimary }
                                ]}>
                                    {step < currentStep ? '✓' : step}
                                </Text>
                            </View>
                        </View>
                        {index < array.length - 1 && (
                            <View style={[
                                styles.stepLine,
                                step < currentStep && styles.stepLineActive
                            ]} />
                        )}
                    </React.Fragment>
                ))}
            </View>
        </View>
    );

    const renderStep1 = () => (
        <ScrollView style={styles.stepContent} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIcon}>
                    <Text style={styles.stepIconText}>🎓</Text>
                </View>
                <Text style={styles.stepTitle}>Formação Acadêmica</Text>
                <Text style={styles.stepSubtitle}>Nos conte sobre seu nível educacional (cursos, graduações)</Text>
            </View>
            <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>Formação Acadêmica</Text>
                <TextInput
                    style={[
                        styles.input,
                        styles.textArea,
                        focusedField === 'formacaoAcademica' && styles.inputFocused
                    ]}
                    placeholder="Ex: Pós-graduado em Gestão Esportiva, Licenciatura em Educação Física..."
                    placeholderTextColor={colors.textMuted}
                    value={formData.formacaoAcademica}
                    onChangeText={(value) => updateFormData('formacaoAcademica', value)}
                    onFocus={() => setFocusedField('formacaoAcademica')}
                    onBlur={() => setFocusedField(null)}
                    multiline
                    numberOfLines={5}
                />
            </View>
        </ScrollView>
    );

    const renderStep2 = () => (
        <ScrollView style={styles.stepContent} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIcon}>
                    <Text style={styles.stepIconText}>🎯</Text>
                </View>
                <Text style={styles.stepTitle}>Experiência Profissional</Text>
                <Text style={styles.stepSubtitle}>Descreva sua experiência como olheiro ou no setor esportivo</Text>
            </View>
            <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>Experiência</Text>
                <TextInput
                    style={[
                        styles.input,
                        styles.textArea,
                        focusedField === 'experiencia' && styles.inputFocused
                    ]}
                    placeholder="Ex: 5 anos como olheiro no time X, Coordenador técnico no clube Y..."
                    placeholderTextColor={colors.textMuted}
                    value={formData.experiencia}
                    onChangeText={(value) => updateFormData('experiencia', value)}
                    onFocus={() => setFocusedField('experiencia')}
                    onBlur={() => setFocusedField(null)}
                    multiline
                    numberOfLines={5}
                />
            </View>
        </ScrollView>
    );

    const renderStep3 = () => (
        <ScrollView style={styles.stepContent} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIcon}>
                    <Text style={styles.stepIconText}>👤</Text>
                </View>
                <Text style={styles.stepTitle}>Dados de Login e Contato</Text>
                <Text style={styles.stepSubtitle}>Informações para contato e acesso à sua conta</Text>
            </View>
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Nome Completo</Text>
                    <TextInput
                        style={[styles.input, focusedField === 'nome' && styles.inputFocused]}
                        placeholder="Digite seu nome completo"
                        placeholderTextColor={colors.textMuted}
                        value={formData.nome}
                        onChangeText={(value) => updateFormData('nome', value)}
                        onFocus={() => setFocusedField('nome')}
                        onBlur={() => setFocusedField(null)}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Telefone</Text>
                    <TextInput
                        style={[styles.input, focusedField === 'telefone' && styles.inputFocused]}
                        placeholder="(11) 99999-9999"
                        placeholderTextColor={colors.textMuted}
                        value={formData.telefone}
                        onChangeText={(value) => updateFormData('telefone', formatTelefone(value))}
                        onFocus={() => setFocusedField('telefone')}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="phone-pad"
                        maxLength={15}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>E-mail</Text>
                    <TextInput
                        style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                        placeholder="seu@email.com"
                        placeholderTextColor={colors.textMuted}
                        value={formData.email}
                        onChangeText={(value) => updateFormData('email', value)}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Senha (Mínimo 6 caracteres)</Text>
                    <TextInput
                        style={[styles.input, focusedField === 'senha' && styles.inputFocused]}
                        placeholder="Digite sua senha"
                        placeholderTextColor={colors.textMuted}
                        value={formData.senha}
                        onChangeText={(value) => updateFormData('senha', value)}
                        onFocus={() => setFocusedField('senha')}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry
                        maxLength={20}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Confirmar Senha</Text>
                    <TextInput
                        style={[styles.input, focusedField === 'confirmarSenha' && styles.inputFocused]}
                        placeholder="Digite a senha novamente"
                        placeholderTextColor={colors.textMuted}
                        value={formData.confirmarSenha}
                        onChangeText={(value) => updateFormData('confirmarSenha', value)}
                        onFocus={() => setFocusedField('confirmarSenha')}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry
                        maxLength={20}
                    />
                </View>
            </View>
        </ScrollView>
    );

    const renderStep4 = () => (
        <ScrollView style={styles.stepContent} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
            <View style={styles.stepHeader}>
                <View style={styles.stepIcon}>
                    <Text style={styles.stepIconText}>📍</Text>
                </View>
                <Text style={styles.stepTitle}>Endereço</Text>
                <Text style={styles.stepSubtitle}>Sua localização principal de atuação</Text>
            </View>
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>CEP</Text>
                    <View style={styles.cepInputContainer}>
                        <TextInput
                            style={[styles.input, styles.cepInput, focusedField === 'cep' && styles.inputFocused]}
                            placeholder="00000-000"
                            placeholderTextColor={colors.textMuted}
                            value={formData.cep}
                            onChangeText={handleCepChange}
                            onFocus={() => setFocusedField('cep')}
                            onBlur={() => setFocusedField(null)}
                            keyboardType="numeric"
                            maxLength={9}
                        />
                        {loadingCep && (
                            <ActivityIndicator 
                                size="small" 
                                color={colors.primary} 
                                style={styles.cepLoader} 
                            />
                        )}
                    </View>
                </View>
                <View style={styles.row}>
                    <View style={[styles.inputContainer, styles.flex1, styles.marginRight]}>
                        <Text style={styles.inputLabel}>Estado (UF)</Text>
                        <TextInput
                            style={[styles.input, focusedField === 'estado' && styles.inputFocused]}
                            placeholder="SP"
                            placeholderTextColor={colors.textMuted}
                            value={formData.estado}
                            onChangeText={(value) => updateFormData('estado', value.toUpperCase())}
                            onFocus={() => setFocusedField('estado')}
                            onBlur={() => setFocusedField(null)}
                            maxLength={2}
                            editable={!loadingCep}
                        />
                    </View>
                    <View style={[styles.inputContainer, styles.flex2]}>
                        <Text style={styles.inputLabel}>Cidade</Text>
                        <TextInput
                            style={[styles.input, focusedField === 'cidade' && styles.inputFocused]}
                            placeholder="São Paulo"
                            placeholderTextColor={colors.textMuted}
                            value={formData.cidade}
                            onChangeText={(value) => updateFormData('cidade', value)}
                            onFocus={() => setFocusedField('cidade')}
                            onBlur={() => setFocusedField(null)}
                            editable={!loadingCep}
                        />
                    </View>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Rua/Logradouro</Text>
                    <TextInput
                        style={[styles.input, focusedField === 'rua' && styles.inputFocused]}
                        placeholder="Nome da rua"
                        placeholderTextColor={colors.textMuted}
                        value={formData.rua}
                        onChangeText={(value) => updateFormData('rua', value)}
                        onFocus={() => setFocusedField('rua')}
                        onBlur={() => setFocusedField(null)}
                        editable={!loadingCep}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Número</Text>
                    <TextInput
                        style={[styles.input, focusedField === 'numero' && styles.inputFocused]}
                        placeholder="123"
                        placeholderTextColor={colors.textMuted}
                        value={formData.numero}
                        onChangeText={(value) => updateFormData('numero', value)}
                        onFocus={() => setFocusedField('numero')}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="numeric"
                    />
                </View>
                <TouchableOpacity 
                    style={styles.termsContainer}
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                >
                    <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                        {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={styles.termsText}>
                        Li e aceito os{' '}
                        <Text style={styles.termsLink}>Termos de Uso</Text>
                        {' '}e{' '}
                        <Text style={styles.termsLink}>Política de Privacidade</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const isNextButtonDisabled = !validateStep(currentStep) || loading || loadingCep;
    
    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <KeyboardAvoidingView 
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <View style={styles.successIcon}>
                            <Text style={styles.successIconText}>⚽</Text>
                        </View>
                        <Text style={styles.headerTitle}>Registro de Olheiro</Text>
                        <Text style={styles.headerSubtitle}>Vamos completar seu perfil em 4 passos</Text>
                    </View>
                </View>

                {renderProgressBar()}

                <View style={styles.content}>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}
                </View>

                <View style={styles.buttonContainer}>
                    {currentStep > 1 && (
                        <TouchableOpacity 
                            style={[styles.backStepButton, isNextButtonDisabled && styles.nextStepButtonDisabled]}
                            onPress={handleBack}
                            disabled={loading}
                        >
                            <Text style={styles.backStepButtonText}>Voltar</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[
                            styles.nextStepButton,
                            isNextButtonDisabled && styles.nextStepButtonDisabled,
                            currentStep === 1 && { flex: 1, marginLeft: 0 }
                        ]}
                        onPress={handleNext}
                        disabled={isNextButtonDisabled}
                    >
                        <Text style={styles.nextStepButtonText}>
                            {currentStep < 4 ? 'Próximo' : (loading ? 'Registrando...' : 'Registrar')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: 20,
    },
    backButton: {
        padding: 10,
        zIndex: 10,
    },
    backButtonText: {
        color: colors.textPrimary,
        fontSize: 24,
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        marginLeft: 40, 
        marginRight: 40,
    },
    successIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    successIconText: {
        color: colors.textPrimary,
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    progressContainer: {
        marginBottom: 30,
    },
    progressSteps: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    stepContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.inputBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.inputBorder,
    },
    stepCircleActive: {
        borderColor: colors.primary,
    },
    stepCircleCompleted: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    stepNumber: {
        color: colors.textSecondary,
        fontWeight: 'bold',
    },
    stepNumberActive: {
        color: colors.primary,
    },
    stepLine: {
        flex: 1,
        height: 2,
        backgroundColor: colors.inputBorder,
        marginHorizontal: -5,
    },
    stepLineActive: {
        backgroundColor: colors.primary,
    },
    content: {
        flex: 1,
    },
    stepContent: {
        flex: 1,
    },
    stepHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    stepIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: colors.backgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    stepIconText: {
        fontSize: 30,
    },
    stepTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 5,
    },
    stepSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    formContainer: {
        flex: 1,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        color: colors.textSecondary,
        fontSize: 14,
        marginBottom: 8,
        marginLeft: 5,
        fontWeight: '600',
    },
    input: {
        backgroundColor: colors.inputBackground,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 20,
        color: colors.textPrimary,
        fontSize: 16,
    },
    inputFocused: {
        borderColor: colors.primary,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        paddingTop: 16,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    flex1: {
        flex: 1,
    },
    flex2: {
        flex: 2,
    },
    marginRight: {
        marginRight: 10,
    },
    cepInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cepInput: {
        flex: 1,
    },
    cepLoader: {
        position: 'absolute',
        right: 15,
    },
    termsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: colors.inputBorder,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    checkboxChecked: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    checkmark: {
        color: colors.textPrimary,
        fontSize: 14,
        fontWeight: 'bold',
    },
    termsText: {
        color: colors.textSecondary,
        fontSize: 14,
        flexShrink: 1,
    },
    termsLink: {
        color: colors.primary,
        fontWeight: 'bold',
        textDecorationLine: 'under',
        textDecorationLine: 'underline',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    backStepButton: {
        backgroundColor: colors.backgroundCard,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    backStepButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    nextStepButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        flex: 2,
        marginLeft: 10,
    },
    nextStepButtonDisabled: {
        opacity: 0.6,
    },
    nextStepButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default RegisterOlheiroScreen;