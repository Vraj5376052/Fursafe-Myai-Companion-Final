import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/style";
import { updateProfile } from "../services/apiService";

export default function UserScreen({
  goBack,
  token,
  onLogout,
  autoSpeak,
  setAutoSpeak,
  targetLang,
  setTargetLang,
}) {
  const [openLang, setOpenLang] = useState(false);
  const [search, setSearch] = useState("");
  const [pendingLang, setPendingLang] = useState(targetLang);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(token?.user?.name || "");
  const [email, setEmail] = useState(token?.user?.email || "");
  const [password, setPassword] = useState("");

  // Sync name/email from token in case state initialized before token was ready
  useEffect(() => {
    if (token?.user?.name) setName(token.user.name);
    if (token?.user?.email) setEmail(token.user.email);
  }, []);

  const languages = [
    "English", "Vietnamese", "Chinese", "Japanese", "Korean",
    "French", "German", "Spanish", "Italian",
  ];

  const handleSave = async () => {
    try {
      const res = await updateProfile(
        { name, new_password: password || undefined },
        token?.token
      );
      setName(res.name);
      setEmail(res.email);
      if (token) token.user = res;
      setPassword("");
      setEditing(false);
      Alert.alert("Success", "Profile updated");
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  // Pushes pendingLang into global targetLang in App.js
  // That flows into every addMessage() call → backend target_language → system prompt language rule
  const handleSaveLang = () => {
    setTargetLang(pendingLang);
    setOpenLang(false);
    Alert.alert("Saved", `Preferred language set to ${pendingLang}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.phoneFrame}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#0dd9f7" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* SCROLLABLE CONTENT — prevents overflow when lang dropdown is open */}
        <ScrollView contentContainerStyle={[styles.userContainer, { paddingBottom: 40 }]}>

          {/* AVATAR */}
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={40} color="#04041c" />
          </View>

          {/* NAME + EMAIL */}
          <View style={{ marginTop: 20, alignItems: "flex-start", width: "80%" }}>
            <Text style={{ color: "#aaa", fontSize: 13, marginBottom: 2 }}>
              Name:{" "}
              <Text style={[styles.userName, { fontSize: 16 }]}>
                {token === "guest" ? "Guest User" : (name || token?.user?.name || "—")}
              </Text>
            </Text>
            <Text style={{ color: "#aaa", fontSize: 13, marginTop: 6 }}>
              Email:{" "}
              <Text style={[styles.userEmail, { color: "#ccc" }]}>
                {token === "guest" ? "No account" : (email || token?.user?.email || "—")}
              </Text>
            </Text>
          </View>

          {/* EDIT PROFILE BUTTON */}
          {token !== "guest" && (
            <TouchableOpacity
              style={styles.userBtn}
              onPress={() => setEditing(!editing)}
            >
              <Text style={styles.userBtnText}>
                {editing ? "Cancel" : "Edit Profile"}
              </Text>
            </TouchableOpacity>
          )}

          {/* EDIT FORM */}
          {editing && (
            <View style={{ marginTop: 20, width: "80%" }}>
              <TextInput
                placeholder="Full name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
                style={{ backgroundColor: "#0a0a2a", color: "white", padding: 12, borderRadius: 12, marginBottom: 10, fontSize: 15 }}
              />
              <TextInput
                placeholder="Email (cannot change)"
                placeholderTextColor="#888"
                value={email}
                editable={false}
                style={{ backgroundColor: "#0a0a2a", color: "#888", padding: 12, borderRadius: 12, marginBottom: 10, fontSize: 15, opacity: 0.6 }}
              />
              <TextInput
                placeholder="New password (optional)"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ backgroundColor: "#0a0a2a", color: "white", padding: 12, borderRadius: 12, marginBottom: 10, fontSize: 15 }}
              />
              <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                <Text style={styles.primaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* AUTO SPEAK — Ionicons, no emojis */}
          <TouchableOpacity
            style={styles.userBtn}
            onPress={() => setAutoSpeak(!autoSpeak)}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons
                name={autoSpeak ? "volume-high" : "volume-mute"}
                size={18}
                color="#0dd9f7"
              />
              <Text style={styles.userBtnText}>
                Auto Voice: {autoSpeak ? "ON" : "OFF"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* LANGUAGE BUTTON — shows current saved language */}
          <TouchableOpacity
            style={styles.userBtn}
            onPress={() => {
              setPendingLang(targetLang); // reset picker to current saved value on open
              setOpenLang(!openLang);
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="globe-outline" size={18} color="#0dd9f7" />
              <Text style={styles.userBtnText}>
                Language: {targetLang}
              </Text>
            </View>
          </TouchableOpacity>

          {/* LANGUAGE PICKER DROPDOWN */}
          {openLang && (
            <View style={[styles.dropdown, { width: "80%" }]}>
              <TextInput
                placeholder="Search language..."
                placeholderTextColor="#aaa"
                value={search}
                onChangeText={setSearch}
                style={styles.dropdownInput}
              />

              {languages
                .filter((l) => l.toLowerCase().includes(search.toLowerCase()))
                .map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.dropdownItem,
                      pendingLang === lang && { backgroundColor: "rgba(13,217,247,0.1)" },
                    ]}
                    onPress={() => setPendingLang(lang)}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons
                        name={pendingLang === lang ? "checkmark-circle" : "ellipse-outline"}
                        size={16}
                        color={pendingLang === lang ? "#0dd9f7" : "#555"}
                      />
                      <Text style={{ color: pendingLang === lang ? "#0dd9f7" : "white" }}>
                        {lang}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}

              {/* SAVE LANGUAGE — commits pendingLang to global state */}
              <TouchableOpacity
                onPress={handleSaveLang}
                style={{
                  marginTop: 12,
                  backgroundColor: "#0dd9f7",
                  borderRadius: 10,
                  padding: 10,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#04041c", fontWeight: "600" }}>
                  Save Language
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
    </View>
  );
}