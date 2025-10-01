import React, { useState, useEffect } from 'react';
import {
 View,
 Text,
 TouchableOpacity,
 StyleSheet,
 ScrollView,
 Image,
 Alert,
 Dimensions,
 Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import AtletaService from '../services/atletaService';
import LoadingScreen from '../components/LoadingScreen';
const { width: screenWidth } = Dimensions.get('window');
const AtletaDetailScreen = ({ route, navigation }) => {
  const { atletaId } = route.params || {};
 const { userData } = useAuth();
 const [atleta, setAtleta] = useState(null);
 const [loading, setLoading] = useState(true);
 const [uploading, setUploading] = useState(false);
 const [selectedMedia, setSelectedMedia] = useState(null);
 const [mediaModalVisible, setMediaModalVisible] = useState(false);
 useEffect(() => {
   loadAtleta();
 }, []);
 const loadAtleta = async () => {
   setLoading(true);
   try {
     const result = await AtletaService.buscarAtletaPorId(atletaId);
     if (result.success) {
       setAtleta(result.atleta);
     } else {
       Alert.alert('Erro', 'Atleta não encontrado');
       navigation.goBack();
     }
   } catch (error) {
     Alert.alert('Erro', 'Erro ao carregar dados do atleta');
     navigation.goBack();
   } finally {
     setLoading(false);
   }
 };
 const canManageMedia = () => {
   // Instituição pode gerenciar seus atletas
   if (userData.userType === 'instituicao' && atleta.instituicaoId === 
userData.uid) {
     return true;
   }
   // Responsável pode gerenciar atletas da sua instituição
   if (userData.userType === 'responsavel' && atleta.instituicaoId === 
userData.profile.instituicaoId) {
     return true;
   }
   return false;
 };
 const pickImage = async () => {
   try {
     const { status } = await 
ImagePicker.requestMediaLibraryPermissionsAsync();
     if (status !== 'granted') {
       Alert.alert('Erro', 'Permissão para acessar galeria é necessária');
       return;
     }
     const result = await ImagePicker.launchImageLibraryAsync({
       mediaTypes: ImagePicker.MediaTypeOptions.Images,
       allowsEditing: true,
       aspect: [1, 1],
       quality: 0.8,
     });
     if (!result.canceled) {
       uploadImage(result.assets[0].uri);
     }
   } catch (error) {
     Alert.alert('Erro', 'Erro ao selecionar imagem');
   }
 };
 const pickVideo = async () => {
   try {
     const { status } = await 
ImagePicker.requestMediaLibraryPermissionsAsync();
     if (status !== 'granted') {
       Alert.alert('Erro', 'Permissão para acessar galeria é necessária');
       return;
     }
     const result = await ImagePicker.launchImageLibraryAsync({
       mediaTypes: ImagePicker.MediaTypeOptions.Videos,
       allowsEditing: true,
       quality: 0.8,
     });
     if (!result.canceled) {
       uploadVideo(result.assets[0].uri);
     }
   } catch (error) {
     Alert.alert('Erro', 'Erro ao selecionar vídeo');
   }
 };
 const uploadImage = async (imageUri) => {
   setUploading(true);
   try {
     const result = await AtletaService.uploadFoto(atletaId, imageUri, 
userData.uid);
     if (result.success) {
       Alert.alert('Sucesso', 'Foto adicionada com sucesso!');
       loadAtleta(); // Recarregar dados
     } else {
       Alert.alert('Erro', result.error || 'Erro ao fazer upload da foto');
     }
   } catch (error) {
     Alert.alert('Erro', 'Erro inesperado ao fazer upload');
   } finally {
     setUploading(false);
   }
 };
 const uploadVideo = async (videoUri) => {
   setUploading(true);
   try {
     const result = await AtletaService.uploadVideo(atletaId, videoUri, 
userData.uid);
     if (result.success) {
       Alert.alert('Sucesso', 'Vídeo adicionado com sucesso!');
       loadAtleta(); // Recarregar dados
     } else {
       Alert.alert('Erro', result.error || 'Erro ao fazer upload do vídeo');
     }
   } catch (error) {
     Alert.alert('Erro', 'Erro inesperado ao fazer upload');
   } finally {
     setUploading(false);
   }
 };
 const toggleFavoritoFoto = async (fotoIndex) => {
   try {
     const result = await AtletaService.toggleFavoritoFoto(atletaId, 
fotoIndex);
     if (result.success) {
       loadAtleta(); // Recarregar dados
     } else {
       Alert.alert('Erro', result.error || 'Erro ao favoritar foto');
     }
   } catch (error) {
     Alert.alert('Erro', 'Erro inesperado');
   }
 };
 const toggleFavoritoVideo = async (videoIndex) => {
   try {
     const result = await AtletaService.toggleFavoritoVideo(atletaId, 
videoIndex);
     if (result.success) {
       loadAtleta(); // Recarregar dados
     } else {
       Alert.alert('Erro', result.error || 'Erro ao favoritar vídeo');
     }
   } catch (error) {
     Alert.alert('Erro', 'Erro inesperado');
   }
 };
 const deleteFoto = async (fotoIndex) => {
   Alert.alert(
     'Confirmar',
     'Tem certeza que deseja deletar esta foto?',
     [
       { text: 'Cancelar', style: 'cancel' },
       {
         text: 'Deletar',
         style: 'destructive',
         onPress: async () => {
           try {
             const result = await AtletaService.deletarFoto(atletaId, 
fotoIndex);
             if (result.success) {
               loadAtleta(); // Recarregar dados
             } else {
               Alert.alert('Erro', result.error || 'Erro ao deletar foto');
             }
           } catch (error) {
             Alert.alert('Erro', 'Erro inesperado');
           }
         }
       }
     ]
   );
 };
 const deleteVideo = async (videoIndex) => {
   Alert.alert(
     'Confirmar',
     'Tem certeza que deseja deletar este vídeo?',
     [
       { text: 'Cancelar', style: 'cancel' },
       { text: 'Deletar', style: 'destructive', onPress: async () => {
           try {
             const result = await AtletaService.deletarVideo(atletaId, 
videoIndex);
             if (result.success) {
               loadAtleta(); // Recarregar dados
             } else {
               Alert.alert('Erro', result.error || 'Erro ao deletar vídeo');
             }
           } catch (error) {
             Alert.alert('Erro', 'Erro inesperado');
           }
         }
       }
     ]
   );
 };
 const openMediaModal = (media, type) => {
   setSelectedMedia({ ...media, type });
   setMediaModalVisible(true);
 };
 const getFotoDestaque = () => {
   const fotoFavorita = atleta?.midias?.fotos?.find(foto => foto.isFavorite);
   return fotoFavorita?.url || null;
 };
 const getVideoDestaque = () => {
   const videoFavorito = atleta?.midias?.videos?.find(video => 
video.isFavorite);
   return videoFavorito?.url || null;
 };
 if (loading) {
   return <LoadingScreen message="Carregando atleta..." />;
 }
 if (!atleta) {
   return (
     <View style={globalStyles.centerContainer}>
       <Text style={globalStyles.bodyText}>Atleta não encontrado</Text>
     </View>
   );
 }
 return (
   <SafeAreaView style={globalStyles.safeArea}>
     <ScrollView style={styles.container} showsVerticalScrollIndicator=
{false}>
       {/* Header */}
       <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style=
{styles.backButton}>
           <Text style={styles.backButtonText}>←</Text>
         </TouchableOpacity>
         <Text style={styles.headerTitle}>Perfil do Atleta</Text>
         <View style={styles.headerSpacer} />
       </View>
       {/* Foto de destaque */}
       <View style={styles.profileSection}>
         <View style={styles.profileImageContainer}>
           {getFotoDestaque() ? (
             <Image source={{ uri: getFotoDestaque() }} style=
{styles.profileImage} />
           ) : (
             <View style={styles.profileImagePlaceholder}>
               <Text style={styles.profileImageText}>
                 {atleta.nome.charAt(0).toUpperCase()}
               </Text>
             </View>
           )}
         </View>
         <Text style={styles.atletaNome}>{atleta.nome}</Text>
         <Text style={styles.atletaPosicao}>{atleta.posicao}</Text>
         <View style={styles.atletaDetalhes}>
           <View style={styles.detalheItem}>
             <Text style={styles.detalheLabel}>Idade</Text>
             <Text style={styles.detalheValor}>{atleta.idade} anos</Text>
           </View>
           <View style={styles.detalheItem}>
             <Text style={styles.detalheLabel}>Altura</Text>
             <Text style={styles.detalheValor}>{atleta.altura || 'N/A'} 
cm</Text>
           </View>
           <View style={styles.detalheItem}>
             <Text style={styles.detalheLabel}>Peso</Text>
             <Text style={styles.detalheValor}>{atleta.peso || 'N/A'} 
kg</Text>
           </View>
         </View>
       </View>
       {/* Estatísticas */}
       <View style={styles.section}>
         <Text style={styles.sectionTitle}>Estatísticas</Text>
         <View style={styles.estatisticasContainer}>
           <View style={styles.estatisticaCard}>
             <Text style={styles.estatisticaNumero}>{atleta.estatisticas?.gols 
|| 0}</Text>
             <Text style={styles.estatisticaLabel}>Gols</Text>
           </View>
           <View style={styles.estatisticaCard}>
             <Text style={styles.estatisticaNumero}>
{atleta.estatisticas?.assistencias || 0}</Text>
             <Text style={styles.estatisticaLabel}>Assistências</Text>
           </View>
           <View style={styles.estatisticaCard}>
             <Text style={styles.estatisticaNumero}>
{atleta.estatisticas?.jogos || 0}</Text>
             <Text style={styles.estatisticaLabel}>Jogos</Text>
           </View>
         </View>
       </View>
       {/* Fotos */}
       <View style={styles.section}>
         <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>Fotos</Text>
           {canManageMedia() && (
             <TouchableOpacity onPress={pickImage} style={styles.addButton}>
               <Text style={styles.addButtonText}>+ Foto</Text>
             </TouchableOpacity>
           )}
         </View>
         {atleta.midias?.fotos?.length > 0 ? (
           <ScrollView horizontal showsHorizontalScrollIndicator={false} 
style={styles.mediaScroll}>
             {atleta.midias.fotos.map((foto, index) => (
               <View key={index} style={styles.mediaItem}>
                 <TouchableOpacity onPress={() => openMediaModal(foto, 
'foto')}>
                   <Image source={{ uri: foto.url }} style={styles.mediaImage} 
/>
                 </TouchableOpacity>
                 {canManageMedia() && (
                   <View style={styles.mediaActions}>
                     <TouchableOpacity 
                       onPress={() => toggleFavoritoFoto(index)}
                       style={[styles.actionButton, foto.isFavorite && 
styles.actionButtonActive]}
                     >
                       <Text style={styles.actionButtonText}>
⭐
</Text>
                     </TouchableOpacity>
                     <TouchableOpacity 
                       onPress={() => deleteFoto(index)}
                       style={styles.deleteButton}
                     >
                       <Text style={styles.deleteButtonText}>
🗑
</Text>
                     </TouchableOpacity>
                   </View>
                 )}
                 {foto.isFavorite && (
                   <View style={styles.favoriteBadge}>
                     <Text style={styles.favoriteBadgeText}>Destaque</Text>
                   </View>
                 )}
               </View>
             ))}
           </ScrollView>
         ) : (
           <View style={styles.emptyMedia}>
             <Text style={styles.emptyMediaText}>Nenhuma foto 
adicionada</Text>
           </View>
         )}
       </View>
       {/* Vídeos */}
       <View style={styles.section}>
         <View style={styles.sectionHeader}>
           <Text style={styles.sectionTitle}>Vídeos</Text>
           {canManageMedia() && (
             <TouchableOpacity onPress={pickVideo} style={styles.addButton}>
               <Text style={styles.addButtonText}>+ Vídeo</Text>
             </TouchableOpacity>
           )}
         </View>
         {atleta.midias?.videos?.length > 0 ? (
           <ScrollView horizontal showsHorizontalScrollIndicator={false} 
style={styles.mediaScroll}>
             {atleta.midias.videos.map((video, index) => (
               <View key={index} style={styles.mediaItem}>
                 <TouchableOpacity onPress={() => openMediaModal(video, 
'video')}>
                   <Video
                     source={{ uri: video.url }}
                     style={styles.mediaVideo}
                     useNativeControls={false}
                     resizeMode="cover"
                     shouldPlay={false}
                   />
                   <View style={styles.videoOverlay}>
                     <Text style={styles.playIcon}>▶ </Text>
                   </View>
                 </TouchableOpacity>
                 {canManageMedia() && (
                   <View style={styles.mediaActions}>
                     <TouchableOpacity 
                       onPress={() => toggleFavoritoVideo(index)}
                       style={[styles.actionButton, video.isFavorite && 
styles.actionButtonActive]}
                     >
                       <Text style={styles.actionButtonText}>
⭐
</Text>
                     </TouchableOpacity>
                     <TouchableOpacity 
                       onPress={() => deleteVideo(index)}
                       style={styles.deleteButton}
                     >
                       <Text style={styles.deleteButtonText}>
🗑
</Text>
                     </TouchableOpacity>
                   </View>
                 )}
                 {video.isFavorite && (
                   <View style={styles.favoriteBadge}>
                     <Text style={styles.favoriteBadgeText}>Destaque</Text>
                   </View>
                 )}
               </View>
             ))}
           </ScrollView>
         ) : (
           <View style={styles.emptyMedia}>
             <Text style={styles.emptyMediaText}>Nenhum vídeo 
adicionado</Text>
           </View>
         )}
       </View>
       {/* Vídeo de destaque */}
       {getVideoDestaque() && (
         <View style={styles.section}>
           <Text style={styles.sectionTitle}>Vídeo em Destaque</Text>
           <Video
             source={{ uri: getVideoDestaque() }}
             style={styles.featuredVideo}
             useNativeControls
             resizeMode="contain"
             shouldPlay={false}
           />
         </View>
       )}
     </ScrollView>
     {/* Modal de mídia */}
     <Modal
       visible={mediaModalVisible}
       transparent={true}
       animationType="fade"
       onRequestClose={() => setMediaModalVisible(false)}
     >
       <View style={styles.modalContainer}>
         <TouchableOpacity 
           style={styles.modalOverlay}
           onPress={() => setMediaModalVisible(false)}
         />
         <View style={styles.modalContent}>
           {selectedMedia?.type === 'foto' ? (
             <Image 
               source={{ uri: selectedMedia.url }} 
               style={styles.modalImage}
               resizeMode="contain"
             />
           ) : (
             <Video
               source={{ uri: selectedMedia?.url }}
               style={styles.modalVideo}
               useNativeControls
               resizeMode="contain"
               shouldPlay={true}
             />
           )}
           <TouchableOpacity 
             style={styles.closeButton}
             onPress={() => setMediaModalVisible(false)}
           >
             <Text style={styles.closeButtonText}>X</Text>
           </TouchableOpacity>
         </View>
       </View>
     </Modal>
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
 headerSpacer: {
   width: 44, // Para alinhar o título ao centro, considerando o backButton
 },
 profileSection: {
   alignItems: 'center',
   paddingVertical: 20,
   paddingHorizontal: 20,
   borderBottomWidth: 1,
   borderBottomColor: colors.inputBorder,
   marginBottom: 20,
 },
 profileImageContainer: {
   marginBottom: 15,
 },
 profileImage: {
   width: 150,
   height: 150,
   borderRadius: 75,
   borderWidth: 3,
   borderColor: colors.primary,
 },
 profileImagePlaceholder: {
   width: 150,
   height: 150,
   borderRadius: 75,
   backgroundColor: colors.primary,
   justifyContent: 'center',
   alignItems: 'center',
 },
 profileImageText: {
   color: colors.textPrimary,
   fontSize: 60,
   fontWeight: 'bold',
 },
 atletaNome: {
   fontSize: 24,
   fontWeight: 'bold',
   color: colors.textPrimary,
   marginBottom: 5,
 },
 atletaPosicao: {
   fontSize: 18,
   color: colors.textSecondary,
   marginBottom: 15,
 },
 atletaDetalhes: {
   flexDirection: 'row',
   justifyContent: 'space-around',
   width: '100%',
 },
 detalheItem: {
   alignItems: 'center',
 },
 detalheLabel: {
   fontSize: 14,
   color: colors.textMuted,
 },
 detalheValor: {
   fontSize: 16,
   fontWeight: 'bold',
   color: colors.textPrimary,
 },
 section: {
   paddingHorizontal: 20,
   marginBottom: 30,
 },
 sectionHeader: {
   flexDirection: 'row',
   justifyContent: 'space-between',
   alignItems: 'center',
   marginBottom: 20,
 },
 sectionTitle: {
   fontSize: 18,
   fontWeight: 'bold',
   color: colors.textPrimary,
 },
 estatisticasContainer: {
   flexDirection: 'row',
   justifyContent: 'space-around',
   marginBottom: 20,
 },
 estatisticaCard: {
   backgroundColor: colors.backgroundCard,
   borderRadius: 10,
   padding: 15,
   alignItems: 'center',
   flex: 1,
   marginHorizontal: 5,
 },
 estatisticaNumero: {
   fontSize: 22,
   fontWeight: 'bold',
   color: colors.primary,
 },
 estatisticaLabel: {
   fontSize: 14,
   color: colors.textSecondary,
   marginTop: 5,
 },
 addButton: {
   backgroundColor: colors.primary,
   paddingVertical: 8,
   paddingHorizontal: 15,
   borderRadius: 20,
 },
 addButtonText: {
   color: colors.textPrimary,
   fontSize: 14,
   fontWeight: 'bold',
 },
 mediaScroll: {
   marginBottom: 10,
 },
 mediaItem: {
   width: screenWidth * 0.4,
   height: screenWidth * 0.4,
   marginRight: 15,
   borderRadius: 10,
   overflow: 'hidden',
   backgroundColor: colors.inputBackground,
   justifyContent: 'center',
   alignItems: 'center',
   position: 'relative',
 },
 mediaImage: {
   width: '100%',
   height: '100%',
   resizeMode: 'cover',
 },
 mediaVideo: {
   width: '100%',
   height: '100%',
 },
 videoOverlay: {
   position: 'absolute',
   top: 0,
   left: 0,
   right: 0,
   bottom: 0,
   justifyContent: 'center',
   alignItems: 'center',
   backgroundColor: 'rgba(0,0,0,0.3)',
 },
 playIcon: {
   fontSize: 30,
   color: 'white',
 },
 mediaActions: {
   position: 'absolute',
   top: 5,
   right: 5,
   flexDirection: 'row',
   backgroundColor: 'rgba(0,0,0,0.5)',
   borderRadius: 15,
   padding: 3,
 },
 actionButton: {
   padding: 5,
 },
 actionButtonActive: {
   backgroundColor: colors.primary,
   borderRadius: 10,
 },
 actionButtonText: {
   fontSize: 16,
 },
 deleteButton: {
   padding: 5,
   marginLeft: 5,
 },
 deleteButtonText: {
   fontSize: 16,
 },
 favoriteBadge: {
   position: 'absolute',
   bottom: 5,
   left: 5,
   backgroundColor: colors.primary,
   borderRadius: 5,
   paddingHorizontal: 8,
   paddingVertical: 3,
 },
 favoriteBadgeText: {
   color: colors.textPrimary,
   fontSize: 10,
   fontWeight: 'bold',
 },
 emptyMedia: {
   backgroundColor: colors.inputBackground,
   borderRadius: 10,
   padding: 20,
   alignItems: 'center',
   justifyContent: 'center',
 },
 emptyMediaText: {
   color: colors.textMuted,
   fontSize: 16,
 },
 featuredVideo: {
   width: '100%',
   height: 200,
   borderRadius: 10,
   backgroundColor: colors.inputBackground,
 },
 modalContainer: {
   flex: 1,
   backgroundColor: 'rgba(0,0,0,0.9)',
justifyContent: 'center',
alignItems: 'center',
},
modalOverlay: {
position: 'absolute',
top: 0,
left: 0,
right: 0,
bottom: 0,
},
modalContent: {
width: '90%',
height: '80%',
backgroundColor: 'black',
borderRadius: 10,
justifyContent: 'center',
alignItems: 'center',
},
modalImage: {
width: '100%',
height: '100%',
},
modalVideo: {
width: '100%',
height: '100%',
},
closeButton: {
position: 'absolute',
top: 20,
right: 20,
backgroundColor: 'rgba(255,255,255,0.3)',
borderRadius: 20,
width: 40,
height: 40,
justifyContent: 'center',
alignItems: 'center',
},
closeButtonText: {
color: 'white',
fontSize: 20,
fontWeight: 'bold',
},
});
export default AtletaDetailScreen;