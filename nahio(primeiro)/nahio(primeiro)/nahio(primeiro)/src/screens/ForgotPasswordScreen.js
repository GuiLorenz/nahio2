import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebaseConfig'; // Assumindo este path
import { colors } from '../styles/colors'; // Assumindo este path
import { globalStyles } from '../styles/globalStyles'; // Assumindo este path

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    // --- Lógica de Reset de Senha ---
    const handleResetPassword = async () => {
        if (!email.trim()) {
            Alert.alert('Erro', 'Por favor, digite seu e-mail.');
            return;
        }

        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email.trim());
            
            Alert.alert(
                'E-mail enviado! 📧',
                'Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ]
            );
        } catch (error) {
            let errorMessage = 'Erro ao enviar e-mail de recuperação. Tente novamente.';
            
            // Tratamento de erros comuns do Firebase
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'E-mail não encontrado. Verifique se o endereço está correto.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'E-mail inválido. Por favor, insira um e-mail válido.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
                    break;
                default:
                    console.error('Firebase Error:', error.message);
            }
            Alert.alert('Erro', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={globalStyles.safeArea}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>{'<'}</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Recuperar Senha</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.content}>
                    
                    {/* Logo (Mantido o design criativo) */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoWrapper}>
                            <View style={styles.ball}>
                                <View style={styles.ballInner}>
                                    <View style={[styles.hexagon, styles.hexagon1]} />
                                    <View style={[styles.hexagon, styles.hexagon2]} />
                                    <View style={[styles.hexagon, styles.hexagon3]} />
                                    <View style={[styles.hexagon, styles.hexagon4]} />
                                    <View style={[styles.hexagon, styles.hexagon5]} />
                                </View>
                            </View>
                            <View style={styles.flame} />
                        </View>
                    </View>
                    
                    {/* Título e descrição */}
                    <Text style={styles.title}>Esqueceu sua senha?</Text>
                    <Text style={styles.subtitle}>
                        Digite seu e-mail e enviaremos instruções para redefinir sua senha.
                    </Text>

                    {/* Formulário */}
                    <View style={styles.form}>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>E-mail</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Digite seu e-mail"
                                placeholderTextColor={colors.textMuted}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                // Corrigido para garantir que o input se encaixe no padrão
                                maxLength={100} 
                            />
                        </View>

                        <TouchableOpacity 
                            style={[styles.resetButton, loading && { opacity: 0.7 }]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.textPrimary} size="small" />
                            ) : (
                                <Text style={styles.resetButtonText}>Enviar E-mail</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Link para voltar ao login */}
                    <TouchableOpacity 
                        style={styles.backToLoginContainer}
                        onPress={() => navigation.goBack()}
                        disabled={loading} // Desabilita enquanto carrega
                    >
                        <Text style={styles.backToLoginText}>
                            Lembrou da senha? <Text style={styles.backToLoginLink}>Fazer login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

// --- Estilos ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10, // Ajuste para melhor alinhamento do botão
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButtonText: {
        color: colors.textPrimary,
        fontSize: 30, // Aumentado para melhor visibilidade da seta
        fontWeight: '300',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'center',
        paddingBottom: 50, // Adiciona padding para evitar que o teclado cubra o botão
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 50, // Aumentado o espaçamento
    },
    logoWrapper: {
        position: 'relative',
        width: 80,
        height: 80,
    },
    ball: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ballInner: {
        width: 65,
        height: 65,
        borderRadius: 32.5,
        position: 'relative',
    },
    hexagon: {
        position: 'absolute',
        width: 10,
        height: 10,
        backgroundColor: colors.background,
        borderRadius: 5,
    },
    hexagon1: { top: 10, left: 27.5 },
    hexagon2: { top: 27.5, left: 12 },
    hexagon3: { top: 27.5, right: 12 },
    hexagon4: { bottom: 27.5, left: 20 },
    hexagon5: { bottom: 10, right: 27.5 },
    flame: {
        position: 'absolute',
        right: -15,
        top: 15,
        width: 25,
        height: 50,
        backgroundColor: colors.primary,
        borderTopRightRadius: 12.5,
        borderBottomRightRadius: 12.5,
        opacity: 0.8,
        transform: [{ skewY: '-15deg' }],
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 40,
    },
    form: {
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 25,
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
        paddingVertical: 16,
        paddingHorizontal: 20,
        color: colors.textPrimary,
        fontSize: 16,
    },
    resetButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    resetButtonText: {
        color: colors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    backToLoginContainer: {
        alignItems: 'center',
    },
    backToLoginText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    backToLoginLink: {
        color: colors.primary,
        fontWeight: 'bold',
    },
});

export default ForgotPasswordScreen;