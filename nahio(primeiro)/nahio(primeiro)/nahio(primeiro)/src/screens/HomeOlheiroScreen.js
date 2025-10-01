import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../styles/colors";
import { globalStyles } from "../styles/globalStyles";

const HomeOlheiroScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [recentAtletas, setRecentAtletas] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRecentAtletas = useCallback(() => {
    try {
      const mockAtletas = [
        {
          id: "1",
          nome: "João Silva",
          idade: 17,
          posicao: "Atacante",
          instituicao: "Arena Belletti Itapeva",
          profileImage: null,
          rating: 4.5,
        },
        {
          id: "2",
          nome: "Pedro Santos",
          idade: 16,
          posicao: "Meio-campo",
          instituicao: "Arena Belletti Itapeva",
          profileImage: null,
          rating: 4.2,
        },
        {
          id: "3",
          nome: "Lucas Oliveira",
          idade: 18,
          posicao: "Zagueiro",
          instituicao: "Arena Belletti Itapeva",
          profileImage: null,
          rating: 4.0,
        },
      ];
      setRecentAtletas(mockAtletas);
    } catch (error) {
      console.error("Erro ao carregar atletas:", error);
      setRecentAtletas([]);
    }
  }, []);

  const loadNotifications = useCallback(() => {
    try {
      const mockNotifications = [
        {
          id: "1",
          titulo: "Novo atleta disponível",
          mensagem: "João Silva foi adicionado pela Arena Belletti",
          tipo: "atleta",
          isRead: false,
          createdAt: new Date(),
        },
        {
          id: "2",
          titulo: "Agendamento confirmado",
          mensagem: "Sua visita foi confirmada para amanhã às 14h",
          tipo: "agendamento",
          isRead: false,
          createdAt: new Date(),
        },
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadRecentAtletas(), loadNotifications()]);
      setLoading(false);
    };
    loadData();
  }, [loadRecentAtletas, loadNotifications]);

  const renderAtletaCard = ({ item }) => (
    <TouchableOpacity
      style={styles.atletaCard}
      onPress={() => navigation.navigate("AtletaDetail", { atletaId: item.id })}
    >
      <View style={styles.atletaImageContainer}>
        {item.profileImage ? (
          <Image
            source={{ uri: item.profileImage }}
            style={styles.atletaImage}
          />
        ) : (
          <View style={styles.atletaImagePlaceholder}>
            <Text style={styles.atletaImageText}>
              {item.nome.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.atletaInfo}>
        <Text style={styles.atletaNome} numberOfLines={1}>
          {item.nome}
        </Text>
        <Text style={styles.atletaDetalhes}>
          {item.idade} anos • {item.posicao}
        </Text>
        <Text style={styles.atletaInstituicao} numberOfLines={1}>
          {item.instituicao}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingText}>⭐ {item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity style={styles.notificationItem}>
      <View
        style={[
          styles.notificationDot,
          !item.isRead && styles.notificationDotUnread,
        ]}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.titulo}</Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.mensagem}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={styles.menuButton}
          >
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.greeting} numberOfLines={1}>
              Olá, {userData?.profile?.nome || "Olheiro"}!
            </Text>
            <Text style={styles.subtitle}>Descubra novos talentos</Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate("Notificacoes")}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {notifications.filter((n) => !n.isRead).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statNumber}>127</Text>
              <Text style={styles.statLabel}>Atletas</Text>
              <Text style={styles.statSubLabel}>Visualizados</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Visitas</Text>
              <Text style={styles.statSubLabel}>Agendadas</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Convites</Text>
              <Text style={styles.statSubLabel}>Recebidos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Favoritos</Text>
              <Text style={styles.statSubLabel}>Salvos</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Atletas Recentes</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Atletas")}>
              <Text style={styles.sectionLink}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : recentAtletas.length > 0 ? (
            <FlatList
              data={recentAtletas}
              renderItem={renderAtletaCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.atletasList}
            />
          ) : (
            <Text style={styles.emptyText}>Nenhum atleta disponível.</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 20 }]}>
            Ações Rápidas
          </Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate("Atletas")}
            >
              <Text style={styles.quickActionIcon}>🔍</Text>
              <Text style={styles.quickActionTitle}>Buscar Atletas</Text>
              <Text style={styles.quickActionSubtitle}>
                Encontre novos talentos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => navigation.navigate("Agendamentos")}
            >
              <Text style={styles.quickActionIcon}>📅</Text>
              <Text style={styles.quickActionTitle}>Agendar Visita</Text>
              <Text style={styles.quickActionSubtitle}>
                Visite uma instituição
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notificações</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Notificacoes")}
            >
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={notifications.slice(0, 3)}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
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
  headerContent: {
    flex: 1,
    marginLeft: 20,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  notificationButton: {
    position: "relative",
    padding: 5,
    marginLeft: 10,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  statsContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
    marginBottom: 30,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  statSubLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyText: {
    color: colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 20,
    fontSize: 14,
  },
  atletasList: {
    paddingHorizontal: 20,
  },
  atletaCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 15,
    padding: 15,
    marginRight: 15,
    width: 140,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  atletaImageContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  atletaImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  atletaImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  atletaImageText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
  },
  atletaInfo: {
    alignItems: "center",
  },
  atletaNome: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  atletaDetalhes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  atletaInstituicao: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 8,
    textAlign: "center",
  },
  ratingContainer: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  quickActionsContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    justifyContent: "space-between",
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: colors.border,
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
    marginTop: 6,
    marginRight: 12,
  },
  notificationDotUnread: {
    backgroundColor: colors.error,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default HomeOlheiroScreen;
