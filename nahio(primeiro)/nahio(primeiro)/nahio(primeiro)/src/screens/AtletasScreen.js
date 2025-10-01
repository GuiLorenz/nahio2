import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../styles/colors';
import { globalStyles } from '../styles/globalStyles';
import AtletaService from '../services/atletaService';
import LoadingScreen from '../components/LoadingScreen';

const AtletasScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [atletas, setAtletas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filteredAtletas, setFilteredAtletas] = useState([]);

  // Usar useCallback para a função de carregamento para otimização
  const loadAtletas = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      // Corrigido para verificar a disponibilidade de userData.profile
      const instituicaoId = userData.userType === 'responsavel' && userData.profile?.instituicaoId;

      if (userData.userType === 'instituicao' || instituicaoId) {
        const idToUse = userData.userType === 'instituicao' ? userData.uid : instituicaoId;
        
        if (!idToUse) {
           Alert.alert('Erro', 'ID da Instituição não encontrado para o responsável.');
           setAtletas([]);
           return;
        }
        result = await AtletaService.buscarAtletasPorInstituicao(idToUse);
      } else if (userData.userType === 'olheiro') {
        // Olheiro vê todos os atletas
        result = await AtletaService.buscarTodosAtletas();
      } else {
         // Tipo de usuário não reconhecido ou sem permissão para ver atletas
         setAtletas([]);
         return;
      }

      if (result.success) {
        // Opcional: ordenar atletas (ex: por nome)
        const sortedAtletas = result.atletas.sort((a, b) => a.nome.localeCompare(b.nome));
        setAtletas(sortedAtletas);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao carregar atletas');
      }
    } catch (error) {
      console.error("Erro no loadAtletas:", error);
      Alert.alert('Erro', 'Erro inesperado ao carregar atletas');
      setAtletas([]);
    } finally {
      setLoading(false);
    }
  }, [userData.uid, userData.userType, userData.profile]);

  // Usar useCallback para a função de filtro
  const filterAtletas = useCallback(() => {
    if (!searchText.trim()) {
      setFilteredAtletas(atletas);
    } else {
      const lowerCaseSearch = searchText.toLowerCase().trim();
      const filtered = atletas.filter(atleta =>
        atleta.nome.toLowerCase().includes(lowerCaseSearch) ||
        atleta.posicao.toLowerCase().includes(lowerCaseSearch)
      );
      setFilteredAtletas(filtered);
    }
  }, [searchText, atletas]);

  // Carrega atletas na montagem do componente
  useEffect(() => {
    loadAtletas();
  }, [loadAtletas]);

  // Filtra atletas quando a lista principal ou o texto de busca mudam
  useEffect(() => {
    filterAtletas();
  }, [searchText, atletas, filterAtletas]);

  const handleAtletaPress = (atleta) => {
    navigation.navigate('AtletaDetail', { atletaId: atleta.id, atletaNome: atleta.nome });
  };

  const handleAddAtleta = () => {
    navigation.navigate('AddAtleta');
  };

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const getFotoDestaque = (atleta) => {
    // Busca a foto marcada como favorita ou usa a primeira
    const foto = atleta.midias?.fotos?.find(f => f.isFavorite) || atleta.midias?.fotos?.[0];
    return foto?.url || null;
  };
  
  // Função auxiliar para calcular a idade a partir da data de nascimento
  const calcularIdade = (dataNascimento) => {
    if (!dataNascimento) return 'N/A';
    const dataNasc = new Date(dataNascimento); // Assumindo que o formato é compatível
    const hoje = new Date();
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const m = hoje.getMonth() - dataNasc.getMonth();
    
    // Ajusta a idade se ainda não fez aniversário neste ano
    if (m < 0 || (m === 0 && hoje.getDate() < dataNasc.getDate())) {
        idade--;
    }
    return `${idade} anos`;
  };

  const renderAtletaCard = ({ item }) => {
    const fotoUrl = getFotoDestaque(item);
    // Erro de lógica corrigido: a idade agora é calculada ou buscada
    const idadeDisplay = item.idade ? `${item.idade} anos` : calcularIdade(item.dataNascimento); 

    return (
      <TouchableOpacity 
        style={styles.atletaCard}
        onPress={() => handleAtletaPress(item)}
      >
        <View style={styles.atletaImageContainer}>
          {fotoUrl ? (
            <Image 
              source={{ uri: fotoUrl }} 
              style={styles.atletaImage} 
            />
          ) : (
            <View style={styles.atletaImagePlaceholder}>
              <Text style={styles.atletaImageText}>
                {item.nome.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {/* Badge de idade */}
          {item.dataNascimento && (
             <View style={styles.idadeBadge}>
               <Text style={styles.idadeBadgeText}>{idadeDisplay.split(' ')[0]}</Text>
             </View>
          )}
        </View>

        <View style={styles.atletaInfo}>
          <Text style={styles.atletaNome} numberOfLines={1}>
            {item.nome}
          </Text>
          <Text style={styles.atletaPosicao}>
            {item.posicao || 'Posição N/A'}
          </Text>

          {/* Estatísticas básicas */}
          <View style={styles.estatisticasContainer}>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaNumero}>
                {item.estatisticas?.gols || 0}
              </Text>
              <Text style={styles.estatisticaLabel}>Gols</Text>
            </View>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaNumero}>
                {item.estatisticas?.assistencias || 0}
              </Text>
              <Text style={styles.estatisticaLabel}>Assist.</Text>
            </View>
            <View style={styles.estatisticaItem}>
              <Text style={styles.estatisticaNumero}>
                {item.estatisticas?.jogos || 0}
              </Text>
              <Text style={styles.estatisticaLabel}>Jogos</Text>
            </View>
          </View>

          {/* Indicadores de mídia */}
          <View style={styles.midiaIndicadores}>
            {item.midias?.fotos?.length > 0 && (
              <View style={styles.midiaIndicador}>
                <Text style={styles.midiaIcon}>📷</Text>
                <Text style={styles.midiaCount}>{item.midias.fotos.length}</Text>
              </View>
            )}
            {item.midias?.videos?.length > 0 && (
              <View style={styles.midiaIndicador}>
                <Text style={styles.midiaIcon}>🎥</Text>
                {/* CORREÇÃO AQUI: o length estava sendo usado como style */}
                <Text style={styles.midiaCount}>{item.midias.videos.length}</Text> 
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⚽</Text>
      <Text style={styles.emptyTitle}>
        {searchText.trim() ? 'Nenhum atleta encontrado na busca' : 'Nenhum atleta cadastrado'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {userData.userType === 'olheiro' 
          ? 'Não há atletas disponíveis para visualização.'
          : 'Se você é instituição ou responsável, adicione o primeiro atleta!'
        }
      </Text>
      {userData.userType !== 'olheiro' && (
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddAtleta}
        >
          <Text style={styles.addButtonText}>Adicionar Atleta</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && atletas.length === 0) {
    return <LoadingScreen message="Carregando atletas..." />;
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {userData.userType === 'olheiro' ? 'Atletas' : 'Meus Atletas'}
          </Text>
          {userData.userType !== 'olheiro' && (
            <TouchableOpacity 
              style={styles.addHeaderButton}
              onPress={handleAddAtleta}
            >
              <Text style={styles.addHeaderButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Barra de pesquisa */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou posição..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
          />
          <View style={styles.searchButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </View>
        </View>

        {/* Lista de atletas */}
        <FlatList
          data={filteredAtletas}
          renderItem={renderAtletaCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.atletasList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading && renderEmptyState}
          onRefresh={loadAtletas}
          refreshing={loading}
        />
      </View>
    </SafeAreaView>
  );
};

// --- Estilos (mantidos e ligeiramente ajustados para melhor UX) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15, // Ajustado para ser mais conciso
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  menuButton: {
    width: 30,
    height: 30,
    justifyContent: 'space-around',
    paddingVertical: 5,
  },
  menuLine: {
    height: 2,
    backgroundColor: colors.textPrimary,
    borderRadius: 1,
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  addHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addHeaderButtonText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 28, // Ajuste para melhor centralização
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    color: colors.textPrimary,
    fontSize: 16,
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchIcon: {
    fontSize: 20,
    color: colors.textPrimary, // Adicionado para garantir a cor
  },
  atletasList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  atletaCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: 15,
    margin: 8, // Ajustado para um espaçamento mais uniforme
    overflow: 'hidden',
    elevation: 3, // Sombra Android
    shadowColor: '#000', // Sombra iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  atletaImageContainer: {
    position: 'relative',
    height: 120,
  },
  atletaImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  atletaImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  atletaImageText: {
    color: colors.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  idadeBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.error, // Usando uma cor de destaque diferente (ex: error ou um secundário)
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  idadeBadgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  atletaInfo: {
    padding: 10,
    alignItems: 'center', // Centraliza as informações
  },
  atletaNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  atletaPosicao: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  estatisticasContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%', // Usa a largura total do card
    borderTopWidth: 1,
    borderTopColor: colors.inputBorder,
    paddingTop: 10,
    marginBottom: 10,
  },
  estatisticaItem: {
    alignItems: 'center',
  },
  estatisticaNumero: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  estatisticaLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  midiaIndicadores: {
    flexDirection: 'row',
    justifyContent: 'center', // Centralizado para consistência
    paddingTop: 5,
  },
  midiaIndicador: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  midiaIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  midiaCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  addButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AtletasScreen;