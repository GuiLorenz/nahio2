import { StyleSheet } from "react-native";
import { colors } from "./colors";

export const globalStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },

  // Textos
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: 15,
  },

  // Botões
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: colors.buttonSecondary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  textButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  textButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    opacity: 0.6,
  },

  // Inputs (Estilo Figma)
  inputContainer: {
    marginVertical: 10,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    color: colors.textPrimary,
    fontSize: 16,
  },
  inputFocused: {
    borderColor: colors.inputBorderFocus,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 16,
  },
  inputHelper: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  inputErrorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },

  // Cards (Estilo Figma)
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 15,
  },

  // Progress Bar
  progressContainer: {
    width: "100%",
    height: 6,
    backgroundColor: colors.inputBackground,
    borderRadius: 3,
    marginVertical: 20,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 15,
  },
  dividerThick: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textPrimary,
  },

  // Badges
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgePrimary: {
    backgroundColor: colors.primary,
  },
  badgeSuccess: {
    backgroundColor: colors.success,
  },
  badgeWarning: {
    backgroundColor: colors.warning,
  },
  badgeError: {
    backgroundColor: colors.error,
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: "600",
  },

  // Spacing Utilities
  marginTop5: { marginTop: 5 },
  marginTop10: { marginTop: 10 },
  marginTop15: { marginTop: 15 },
  marginTop20: { marginTop: 20 },
  marginTop30: { marginTop: 30 },

  marginBottom5: { marginBottom: 5 },
  marginBottom10: { marginBottom: 10 },
  marginBottom15: { marginBottom: 15 },
  marginBottom20: { marginBottom: 20 },
  marginBottom30: { marginBottom: 30 },

  marginHorizontal10: { marginHorizontal: 10 },
  marginHorizontal20: { marginHorizontal: 20 },

  paddingHorizontal10: { paddingHorizontal: 10 },
  paddingHorizontal20: { paddingHorizontal: 20 },
  paddingHorizontal30: { paddingHorizontal: 30 },

  paddingVertical10: { paddingVertical: 10 },
  paddingVertical20: { paddingVertical: 20 },
  paddingVertical30: { paddingVertical: 30 },

  // Flex Utilities
  row: {
    flexDirection: "row",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flexCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  flex1: {
    flex: 1,
  },

  // Text Alignment
  textCenter: {
    textAlign: "center",
  },
  textLeft: {
    textAlign: "left",
  },
  textRight: {
    textAlign: "right",
  },

  // Shadow Styles
  shadow: {
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowLight: {
    shadowColor: colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
});
