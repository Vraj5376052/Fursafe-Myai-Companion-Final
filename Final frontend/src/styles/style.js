import { StyleSheet } from "react-native";

export default StyleSheet.create({

  // GLOBAL
  container: {
    flex: 1,
    backgroundColor: "#04041c",
    paddingTop: 50,
    paddingHorizontal: 20,
  },

  phoneFrame: {
    flex: 1,
    borderRadius: 30,
    overflow: "hidden",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // DISCLAIMER
  disclaimer: {
    position: "absolute",
    bottom: 105,
    left: 20,
    right: 20,
    textAlign: "center",
    color: "#888",
    fontSize: 11,
  },

  // LANGUAGE DROPDOWN
  dropdown: {
    width: "80%",
    alignSelf: "center",
    backgroundColor: "#0a0a2a",
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
    zIndex: 10,
  },

  dropdownInput: {
    backgroundColor: "#04041c",
    color: "white",
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },

  dropdownItem: {
    paddingVertical: 8,
  },

  // HEADER
  header: {
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  headerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  // CHIPS
  chips: {
    marginTop: 5,
    marginBottom: -100,
    maxHeight: 150,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#0dd9f7",
    marginRight: 8,
    backgroundColor: "rgba(13,217,247,0.05)",
  },

  chipText: {
    color: "white",
    fontSize: 13,
    marginLeft: 4,
  },

  // CHAT
  msg: {
    padding: 14,
    borderRadius: 18,
    marginVertical: 6,
    maxWidth: "75%",
  },

  ai: {
    backgroundColor: "#0a0a2a",
    alignSelf: "flex-start",
  },

  user: {
    backgroundColor: "#0dd9f7",
    alignSelf: "flex-end",
  },

  text: {
    color: "white",
  },

  userText: {
    color: "#04041c",
  },

  // FLOATING INPUT
  floatingInput: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0a2a",
    borderRadius: 30,
    paddingHorizontal: 14,
    height: 56,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  input: {
    flex: 1,
    color: "white",
    marginHorizontal: 10,
  },

  // LOGIN / SIGNUP
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 160,
  },

  subtitle: {
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
  },

  form: {
    width: "100%",
    gap: 15,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0a2e",
    borderRadius: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#1a1a3e",
  },

  inputField: {
    flex: 1,
    color: "white",
    paddingVertical: 15,
  },

  primaryButton: {
    backgroundColor: "#0dd9f7",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginVertical: 20,
  },

  primaryText: {
    color: "#04041c",
    fontWeight: "600",
    fontSize: 16,
  },

  link: {
    color: "#0dd9f7",
    textAlign: "center",
  },

  grayText: {
    color: "#aaa",
    textAlign: "center",
  },

  graySmall: {
    color: "#888",
    fontSize: 12,
    marginHorizontal: 10,
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#333",
  },

  loginTop: {
    alignItems: "center",
    marginBottom: 20,
  },

  circleIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#0dd9f7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 40,
  },

  // HOME
  homeCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  homeCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#0dd9f7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 25,
  },

  homeImage: {
    width: 150,
    height: 140,
  },

  homeTitle: {
    fontSize: 26,
    color: "white",
    fontWeight: "600",
  },

  homeSubtitle: {
    color: "#888",
    marginTop: 10,
  },

  homeButton: {
    backgroundColor: "#0dd9f7",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 40,
  },

  homeButtonText: {
    color: "#04041c",
    fontSize: 18,
    fontWeight: "600",
  },

  // RECORD
  recordContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  recordTitle: {
    color: "white",
    fontSize: 18,
    marginBottom: 30,
  },

  recordCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#0dd9f7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0dd9f7",
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 20,
  },

  recordSubtitle: {
    color: "#aaa",
    marginTop: 20,
  },

  waveContainer: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 20,
  },

  stopBtn: {
    marginTop: 30,
    backgroundColor: "#0dd9f7",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 30,
  },

  stopText: {
    color: "#04041c",
    fontWeight: "600",
  },

  // CAMERA
  scanFrame: {
    position: "absolute",
    top: "25%",
    left: "10%",
    right: "10%",
    height: 220,
    borderWidth: 2,
    borderColor: "#0dd9f7",
    borderRadius: 16,
    shadowColor: "#0dd9f7",
    shadowOpacity: 0.6,
    shadowRadius: 15,
  },

  scannerHint: {
    position: "absolute",
    top: 80,
    alignSelf: "center",
    color: "#aaa",
    textAlign: "center",
    width: "80%",
    zIndex: 10,
  },

  cameraControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  captureBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#0dd9f7",
    borderWidth: 5,
    borderColor: "white",
    shadowColor: "#0dd9f7",
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },

  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  // USER SCREEN
  userContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 40,
  },

  userAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0dd9f7",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0dd9f7",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },

  userName: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
  },

  userEmail: {
    color: "#aaa",
    marginTop: 5,
  },

  userBtn: {
    marginTop: 20,
    width: "70%",
    padding: 14,
    borderRadius: 20,
    backgroundColor: "#0a0a2a",
    alignItems: "center",
  },

  userBtnText: {
    color: "white",
  },

  logoutBtn: {
    marginTop: 30,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: "#0dd9f7",
  },

  logoutText: {
    color: "#04041c",
    fontWeight: "600",
  },

  // ONBOARDING
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 20,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#444",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#0dd9f7",
    width: 10,
    height: 10,
  },
});
