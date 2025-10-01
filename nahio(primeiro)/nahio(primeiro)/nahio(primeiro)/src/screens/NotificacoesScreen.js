import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { globalStyles } from "../styles/globalStyles";
import { colors } from "../styles/colors";

const mockNotifications = [
  {
    id: "1",
    type: "convite",
    title: "Novo Convite de Avaliação",
    subtitle: "Você recebeu um convite da Academia Esportiva X.",
    date: "2 horas atrás",
    read: false,
  },
  {
    id: "2",
    type: "agendamento",
    title: "Agendamento Confirmado",
    subtitle: "Seu agendamento para o dia 20/11 foi confirmado.",
    date: "Ontem",
    read: false,
  },
  {
    id: "3",
    type: "sistema",
    title: "Atualização de Perfil",
    subtitle: "Seu perfil foi atualizado com sucesso.",
    date: "1 semana atrás",
    read: true,
  },
  {
    id: "4",
    type: "convite",
    title: "Convite Rejeitado",
    subtitle: "A Escola de Futebol Y rejeitou seu convite.",
    date: "2 semanas atrás",
    read: true,
  },
];

const getIcon = (type) => {
  switch (type) {
    case "convite":
      return "✉️";
    case "agendamento":
      return "📅";
    case "sistema":
      return "⚙️";
    default:
      return "💬";
  }
};

const NotificacoesScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [refreshing, setRefreshing] = useState(false);

  const handleNotificationPress = (id, type) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    if (type === "convite") {
      navigation.navigate("Convites");
    } else if (type === "agendamento") {
      navigation.navigate("Agendamentos");
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.read ? styles.readItem : styles.unreadItem,
      ]}
      onPress={() => handleNotificationPress(item.id, item.type)}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getIcon(item.type)}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle} numberOfLines={2}>
          {item.subtitle}
        </Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[globalStyles.safeArea, styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyText}>
              Nenhuma notificação por enquanto.
            </Text>
          </View>
        )}
      />
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
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: "300",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: colors.backgroundCard,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  readItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.inputBorder,
    opacity: 0.7,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  icon: {
    fontSize: 18,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  date: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 5,
    alignSelf: "flex-end",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default NotificacoesScreen;
