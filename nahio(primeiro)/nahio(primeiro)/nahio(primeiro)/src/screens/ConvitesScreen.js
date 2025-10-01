import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../styles/colors";
import { globalStyles } from "../styles/globalStyles";
import ConviteService from "../services/conviteService";
import LoadingScreen from "../components/LoadingScreen";

const SelectListModal = ({
  visible,
  onClose,
  onSelect,
  data,
  title,
  keyExtractor,
  renderItemContent,
}) => {
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={selectModalStyles.item}
      onPress={() => onSelect(item)}
    >
      <Text style={selectModalStyles.itemText}>{renderItemContent(item)}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={selectModalStyles.container}>
        <View style={selectModalStyles.content}>
          <View style={selectModalStyles.header}>
            <Text style={selectModalStyles.title}>{title}</Text>
          </View>

          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ListEmptyComponent={
              <Text style={selectModalStyles.emptyText}>
                Nenhum item disponível.
              </Text>
            }
            style={selectModalStyles.list}
          />

          <TouchableOpacity
            onPress={onClose}
            style={selectModalStyles.closeButton}
          >
            <Text style={selectModalStyles.closeButtonText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const ConvitesScreen = ({ navigation }) => {
  const { userData } = useAuth();
  const [convites, setConvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedConvite, setSelectedConvite] = useState(null);
  const [novoConviteModal, setNovoConviteModal] = useState(false);

  const [olheiros, setOlheiros] = useState([]);
  const [atletas, setAtletas] = useState([]);

  const [selectOlheiroModal, setSelectOlheiroModal] = useState(false);
  const [selectAtletaModal, setSelectAtletaModal] = useState(false);

  const [selectedOlheiro, setSelectedOlheiro] = useState(null);
  const [selectedAtleta, setSelectedAtleta] = useState(null);
  const [mensagem, setMensagem] = useState("");

  const loadConvites = useCallback(async () => {
    setLoading(true);
    try {
      let result;
      const instituicaoId =
        userData.userType === "responsavel"
          ? userData.profile?.instituicaoId
          : userData.uid;

      if (userData.userType === "olheiro") {
        result = await ConviteService.buscarConvitesPorOlheiro(userData.uid);
      } else if (instituicaoId) {
        result = await ConviteService.buscarConvitesPorInstituicao(
          instituicaoId
        );
      } else {
        Alert.alert(
          "Erro",
          "ID da Instituição não encontrado para o responsável."
        );
        setConvites([]);
        return;
      }

      if (result.success) {
        const sortedConvites = (result.convites || []).sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
        );
        setConvites(sortedConvites);
      } else {
        Alert.alert("Erro", result.error || "Erro ao carregar convites");
      }
    } catch (error) {
      console.error("Erro ao carregar convites:", error);
      Alert.alert("Erro", "Erro inesperado ao carregar convites");
      setConvites([]);
    } finally {
      setLoading(false);
    }
  }, [userData.uid, userData.userType, userData.profile]);

  const loadOlheiros = useCallback(async () => {
    try {
      const result = await ConviteService.buscarOlheirosParaConvite();
      if (result.success) {
        setOlheiros(result.olheiros || []);
      }
    } catch (error) {
      console.error("Erro ao carregar olheiros:", error);
    }
  }, []);

  const loadAtletas = useCallback(async () => {
    try {
      const idToUse =
        userData.userType === "responsavel"
          ? userData.profile?.instituicaoId
          : userData.uid;

      if (!idToUse) return;

      const result = await ConviteService.buscarAtletasParaConvite(idToUse);
      if (result.success) {
        setAtletas(result.atletas || []);
      }
    } catch (error) {
      console.error("Erro ao carregar atletas:", error);
    }
  }, [userData.uid, userData.userType, userData.profile]);

  useEffect(() => {
    loadConvites();

    if (
      userData.userType === "instituicao" ||
      userData.userType === "responsavel"
    ) {
      loadOlheiros();
      loadAtletas();
    }
  }, [loadConvites, loadOlheiros, loadAtletas, userData.userType]);

  const openDrawer = () => {
    navigation.openDrawer();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "enviado":
        return colors.warning;
      case "aceito":
        return colors.success;
      case "recusado":
        return colors.error;
      default:
        return colors.textMuted;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "enviado":
        return "Enviado";
      case "aceito":
        return "Aceito";
      case "recusado":
        return "Recusado";
      default:
        return status;
    }
  };

  const handleConvitePress = (convite) => {
    setSelectedConvite(convite);
    setModalVisible(true);
  };

  const handleAceitarConvite = async (conviteId) => {
    try {
      const result = await ConviteService.aceitarConvite(conviteId);
      if (result.success) {
        Alert.alert(
          "Sucesso",
          "Convite aceito! O atleta foi adicionado à sua lista."
        );
        loadConvites();
        setModalVisible(false);
      } else {
        Alert.alert("Erro", result.error || "Erro ao aceitar convite");
      }
    } catch (error) {
      Alert.alert("Erro", "Erro inesperado ao aceitar convite");
    }
  };

  const handleRecusarConvite = (conviteId) => {
    Alert.alert(
      "Recusar Convite",
      "Tem certeza que deseja recusar este convite?",
      [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await ConviteService.recusarConvite(conviteId);
              if (result.success) {
                Alert.alert("Sucesso", "Convite recusado!");
                loadConvites();
                setModalVisible(false);
              } else {
                Alert.alert("Erro", result.error || "Erro ao recusar convite");
              }
            } catch (error) {
              Alert.alert("Erro", "Erro inesperado ao recusar convite");
            }
          },
        },
      ]
    );
  };

  const handleSelectOlheiro = (olheiro) => {
    setSelectedOlheiro(olheiro);
    setSelectOlheiroModal(false);
  };

  const handleSelectAtleta = (atleta) => {
    setSelectedAtleta(atleta);
    setSelectAtletaModal(false);
  };

  const resetNovoConviteForm = () => {
    setSelectedOlheiro(null);
    setSelectedAtleta(null);
    setMensagem("");
  };

  const handleCriarConvite = async () => {
    const instituicaoId =
      userData.userType === "responsavel"
        ? userData.profile?.instituicaoId
        : userData.uid;

    if (!instituicaoId || !selectedOlheiro || !selectedAtleta) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (
      userData.userType !== "instituicao" &&
      userData.userType !== "responsavel"
    ) {
      Alert.alert("Erro", "Você não tem permissão para enviar convites.");
      return;
    }

    try {
      const conviteData = {
        instituicaoId: instituicaoId,
        olheiroId: selectedOlheiro.uid,
        atletaId: selectedAtleta.id,
        mensagem: mensagem.trim(),
      };

      const result = await ConviteService.criarConvite(conviteData);

      if (result.success) {
        Alert.alert(
          "Sucesso",
          'Convite enviado com sucesso! Ele aparecerá como "Enviado" até ser respondido.'
        );
        setNovoConviteModal(false);
        resetNovoConviteForm();
        loadConvites();
      } else {
        Alert.alert("Erro", result.error || "Erro ao enviar convite");
      }
    } catch (error) {
      console.error("Erro ao criar convite:", error);
      Alert.alert("Erro", "Erro inesperado ao enviar convite");
    }
  };

  const renderConviteCard = ({ item }) => (
    <TouchableOpacity
      style={styles.conviteCard}
      onPress={() => handleConvitePress(item)}
    >
      <View style={styles.conviteHeader}>
        <Text style={styles.conviteTitulo} numberOfLines={1}>
          {userData.userType === "olheiro"
            ? item.instituicao?.nomeEscola || "Instituição Desconhecida"
            : item.olheiro?.nome || "Olheiro Desconhecido"}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.conviteInfo}>
        <Text style={styles.conviteAtleta}>
          Atleta: {item.atleta?.nome || "N/A"}
        </Text>
        {item.mensagem && (
          <Text style={styles.conviteMensagem} numberOfLines={2}>
            💬 {item.mensagem}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>✉️</Text>
      <Text style={styles.emptyTitle}>Nenhum convite</Text>
      <Text style={styles.emptySubtitle}>
        {userData.userType === "olheiro"
          ? "Convites de instituições para seus atletas aparecerão aqui."
          : "Envie convites para olheiros e promova seus atletas para novas oportunidades."}
      </Text>
      {(userData.userType === "instituicao" ||
        userData.userType === "responsavel") && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setNovoConviteModal(true);
            resetNovoConviteForm();
          }}
        >
          <Text style={styles.addButtonText}>Enviar Novo Convite</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && convites.length === 0) {
    return <LoadingScreen message="Carregando convites..." />;
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
            <View style={styles.menuLine} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Convites</Text>
          {(userData.userType === "instituicao" ||
            userData.userType === "responsavel") && (
            <TouchableOpacity
              style={styles.addHeaderButton}
              onPress={() => {
                setNovoConviteModal(true);
                resetNovoConviteForm();
              }}
            >
              <Text style={styles.addHeaderButtonText}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={convites}
          renderItem={renderConviteCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.convitesList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={!loading && renderEmptyState}
          onRefresh={loadConvites}
          refreshing={loading}
        />

        <Modal
          visible={modalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detalhes do Convite</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              {selectedConvite && (
                <ScrollView style={styles.modalBody}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>
                      {userData.userType === "olheiro"
                        ? "Instituição:"
                        : "Olheiro:"}
                    </Text>
                    <Text style={styles.detailValue}>
                      {userData.userType === "olheiro"
                        ? selectedConvite.instituicao?.nomeEscola || "N/A"
                        : selectedConvite.olheiro?.nome || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Atleta:</Text>
                    <Text style={styles.detailValue}>
                      {selectedConvite.atleta?.nome || "N/A"}
                    </Text>
                  </View>
                  {selectedConvite.mensagem && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Mensagem:</Text>
                      <Text style={styles.detailValue}>
                        {selectedConvite.mensagem}
                      </Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Status:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(
                            selectedConvite.status
                          ),
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusText(selectedConvite.status)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.actionsContainer}>
                    {selectedConvite.status === "enviado" &&
                      userData.userType === "olheiro" && (
                        <>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.confirmButton]}
                            onPress={() =>
                              handleAceitarConvite(selectedConvite.id)
                            }
                          >
                            <Text style={styles.actionButtonText}>Aceitar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() =>
                              handleRecusarConvite(selectedConvite.id)
                            }
                          >
                            <Text style={styles.actionButtonText}>Recusar</Text>
                          </TouchableOpacity>
                        </>
                      )}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        <Modal
          visible={novoConviteModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => {
            setNovoConviteModal(false);
            resetNovoConviteForm();
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Novo Convite</Text>
                <TouchableOpacity
                  onPress={() => {
                    setNovoConviteModal(false);
                    resetNovoConviteForm();
                  }}
                >
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Olheiro *</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setSelectOlheiroModal(true)}
                  >
                    <Text style={styles.selectButtonText}>
                      {selectedOlheiro
                        ? selectedOlheiro.nome
                        : "Selecionar olheiro"}
                    </Text>
                  </TouchableOpacity>
                  {olheiros.length === 0 && (
                    <Text style={styles.selectErrorText}>
                      Nenhum olheiro encontrado.
                    </Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Atleta *</Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setSelectAtletaModal(true)}
                  >
                    <Text style={styles.selectButtonText}>
                      {selectedAtleta
                        ? selectedAtleta.nome
                        : "Selecionar atleta"}
                    </Text>
                  </TouchableOpacity>
                  {atletas.length === 0 && (
                    <Text style={styles.selectErrorText}>
                      Nenhum atleta cadastrado.
                    </Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mensagem (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Mensagem para o olheiro..."
                    placeholderTextColor={colors.textMuted}
                    value={mensagem}
                    onChangeText={setMensagem}
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <TouchableOpacity
                  style={styles.createButton}
                  onPress={handleCriarConvite}
                  disabled={olheiros.length === 0 || atletas.length === 0}
                >
                  <Text style={styles.createButtonText}>
                    {olheiros.length === 0 || atletas.length === 0
                      ? "Olheiros/Atletas necessários"
                      : "Enviar Convite"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        <SelectListModal
          visible={selectOlheiroModal}
          onClose={() => setSelectOlheiroModal(false)}
          onSelect={handleSelectOlheiro}
          data={olheiros}
          title="Selecionar Olheiro"
          keyExtractor={(item) => item.uid}
          renderItemContent={(item) =>
            item.nome || `Olheiro #${item.uid.substring(0, 4)}`
          }
        />

        <SelectListModal
          visible={selectAtletaModal}
          onClose={() => setSelectAtletaModal(false)}
          onSelect={handleSelectAtleta}
          data={atletas}
          title="Selecionar Atleta"
          keyExtractor={(item) => item.id}
          renderItemContent={(item) =>
            `${item.nome} (${item.posicao || "N/A"})`
          }
        />
      </View>
    </SafeAreaView>
  );
};

const selectModalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  content: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "70%",
    elevation: 10,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
    paddingBottom: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  list: {
    maxHeight: 300,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  itemText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  emptyText: {
    textAlign: "center",
    padding: 20,
    color: colors.textMuted,
  },
  closeButton: {
    backgroundColor: colors.error,
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  closeButtonText: {
    color: colors.textPrimary,
    fontWeight: "bold",
  },
});

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
    borderBottomColor: colors.inputBorder,
  },
  menuButton: {
    width: 30,
    height: 30,
    justifyContent: "space-around",
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
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
  },
  addHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addHeaderButtonText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 28,
  },
  convitesList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  conviteCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 15,
    marginHorizontal: 10,
    marginVertical: 8,
    padding: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
  },
  conviteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  conviteTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 10,
  },
  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "bold",
  },
  conviteInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.inputBorder,
    paddingTop: 10,
  },
  conviteAtleta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  conviteMensagem: {
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
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
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.textMuted,
  },
  modalBody: {
    maxHeight: "80%",
  },
  detailItem: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "flex-start",
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.textSecondary,
    marginRight: 10,
    width: 110,
  },
  detailValue: {
    fontSize: 16,
    color: colors.textPrimary,
    flexShrink: 1,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.inputBorder,
    paddingTop: 20,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: colors.success,
  },
  cancelButton: {
    backgroundColor: colors.error,
  },
  actionButtonText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    color: colors.textSecondary,
    fontSize: 14,
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
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  selectButton: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 15,
    justifyContent: "center",
  },
  selectButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
  },
  selectErrorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    elevation: 2,
  },
  createButtonText: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ConvitesScreen;
