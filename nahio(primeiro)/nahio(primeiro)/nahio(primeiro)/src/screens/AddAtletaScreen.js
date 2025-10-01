import React, { useState } from 'react';
import {
 View,
 Text,
 TextInput,
 TouchableOpacity,
 StyleSheet,
 ScrollView,
 Alert,
 ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import AtletaService from '../services/atletaService';

const AddAtletaScreen = ({ navigation }) => {
 const { userData } = useAuth();
 const [loading, setLoading] = useState(false);
 const [nome, setNome] = useState('');
 const [posicao, setPosicao] = useState('');
 const [idade, setIdade] = useState('');
 const [altura, setAltura] = useState('');
 const [peso, setPeso] = useState('');
 const [gols, setGols] = useState('');
 const [assistencias, setAssistencias] = useState('');
 const [jogos, setJogos] = useState('');

 const validateForm = () => {
   if (!nome.trim()) {
     Alert.alert('Erro', 'Nome do atleta é obrigatório');
     return false;
   }
   if (!posicao.trim()) {
     Alert.alert('Erro', 'Posição é obrigatória');
     return false;
   }
   if (!idade.trim() || isNaN(parseInt(idade))) {
     Alert.alert('Erro', 'Idade inválida');
     return false;
   }
   return true;
 };

 const handleAddAtleta = async () => {
   if (!validateForm()) return;
   setLoading(true);

   try {
     const atletaData = {
       nome: nome.trim(),
       posicao: posicao.trim(),
       idade: parseInt(idade),
       altura: altura.trim() ? parseFloat(altura) : null,
       peso: peso.trim() ? parseFloat(peso) : null,
       estatisticas: {
         gols: gols.trim() ? parseInt(gols) : 0,
         assistencias: assistencias.trim() ? parseInt(assistencias) : 0,
         jogos: jogos.trim() ? parseInt(jogos) : 0,
       },
       instituicaoId: userData.userType === 'instituicao' ? userData.uid : userData.profile.instituicaoId,
       responsavelId: userData.userType === 'responsavel' ? userData.uid : null,
       midias: { fotos: [], videos: [] },
     };

     const result = await AtletaService.criarAtleta(atletaData);
     if (result.success) {
       Alert.alert('Sucesso', 'Atleta adicionado com sucesso!');
       navigation.goBack();
     } else {
       Alert.alert('Erro', result.error || 'Erro ao adicionar atleta');
     }
   } catch (error) {
     Alert.alert('Erro', 'Erro inesperado ao adicionar atleta');
   } finally {
     setLoading(false);
   }
 };

 return (
   <SafeAreaView style={globalStyles.safeArea}>
     <View style={styles.container}>
       <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
           <Text style={styles.backButtonText}>←</Text>
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Adicionar Atleta</Text>
         <TouchableOpacity 
           style={styles.saveButton}
           onPress={handleAddAtleta}
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
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Informações Básicas</Text>
           <View style={styles.inputContainer}>
             <Text style={styles.inputLabel}>Nome Completo *</Text>
             <TextInput
               style={styles.input}
               placeholder="Nome do atleta"
               placeholderTextColor={colors.textMuted}
               value={nome}
               onChangeText={setNome}
               autoCapitalize="words"
             />
           </View>
           <View style={styles.inputContainer}>
             <Text style={styles.inputLabel}>Posição *</Text>
             <TextInput
               style={styles.input}
               placeholder="Ex: Atacante, Zagueiro"
               placeholderTextColor={colors.textMuted}
               value={posicao}
               onChangeText={setPosicao}
               autoCapitalize="words"
             />
           </View>
           <View style={styles.inputContainer}>
             <Text style={styles.inputLabel}>Idade *</Text>
             <TextInput
               style={styles.input}
               placeholder="Ex: 16"
               placeholderTextColor={colors.textMuted}
               value={idade}
               onChangeText={setIdade}
               keyboardType="numeric"
               maxLength={2}
             />
           </View>
           <View style={styles.row}>
             <View style={[styles.inputContainer, styles.flex1]}>
               <Text style={styles.inputLabel}>Altura (cm)</Text>
               <TextInput
                 style={styles.input}
                 placeholder="Ex: 175"
                 placeholderTextColor={colors.textMuted}
                 value={altura}
                 onChangeText={setAltura}
                 keyboardType="numeric"
               />
             </View>
             <View style={[styles.inputContainer, styles.flex1]}>
               <Text style={styles.inputLabel}>Peso (kg)</Text>
               <TextInput
                 style={styles.input}
                 placeholder="Ex: 65"
                 placeholderTextColor={colors.textMuted}
                 value={peso}
                 onChangeText={setPeso}
                 keyboardType="numeric"
               />
             </View>
           </View>
         </View>

         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Estatísticas (Opcional)</Text>
           <View style={styles.inputContainer}>
             <Text style={styles.inputLabel}>Gols</Text>
             <TextInput
               style={styles.input}
               placeholder="0"
               placeholderTextColor={colors.textMuted}
               value={gols}
               onChangeText={setGols}
               keyboardType="numeric"
             />
           </View>
           <View style={styles.inputContainer}>
             <Text style={styles.inputLabel}>Assistências</Text>
             <TextInput
               style={styles.input}
               placeholder="0"
               placeholderTextColor={colors.textMuted}
               value={assistencias}
               onChangeText={setAssistencias}
               keyboardType="numeric"
             />
           </View>
           <View style={styles.inputContainer}>
             <Text style={styles.inputLabel}>Jogos</Text>
             <TextInput
               style={styles.input}
               placeholder="0"
               placeholderTextColor={colors.textMuted}
               value={jogos}
               onChangeText={setJogos}
               keyboardType="numeric"
             />
           </View>
         </View>
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
   flexDirection: 'row',
   alignItems: 'center',
   paddingHorizontal: 20,
   paddingVertical: 20,
 },
 backButton: {
   padding: 10,
 },
 backButtonText: {
   fontSize: 24,
   color: colors.textPrimary,
 },
 headerTitle: {
   flex: 1,
   fontSize: 20,
   fontWeight: 'bold',
   color: colors.textPrimary,
   textAlign: 'center',
 },
 saveButton: {
   paddingHorizontal: 15,
   paddingVertical: 8,
 },
 saveButtonText: {
   color: colors.primary,
   fontSize: 16,
   fontWeight: 'bold',
 },
 scrollContainer: {
   flex: 1,
 },
 section: {
   paddingHorizontal: 20,
   marginBottom: 30,
 },
 sectionTitle: {
   fontSize: 18,
   fontWeight: 'bold',
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
 row: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   gap: 10,
 },
 flex1: {
   flex: 1,
 },
});

export default AddAtletaScreen;