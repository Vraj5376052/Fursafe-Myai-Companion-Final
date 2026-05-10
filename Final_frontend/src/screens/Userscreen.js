import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/style";
import { updateProfile } from "../services/apiService";

export default function UserScreen({ goBack, token, onLogout, autoSpeak, setAutoSpeak }) {

  const [openLang, setOpenLang] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedLang, setSelectedLang] = useState("English");

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(token?.user?.name || "");
  const [email, setEmail] = useState(token?.user?.email || "");
  const [password, setPassword] = useState("");

  const languages = [
    "English", "Vietnamese", "Chinese", "Japanese", "Korean",
    "French", "German", "Spanish", "Italian"
  ];

  const handleSave = async () => {
    try {
      const res = await updateProfile(
        {
          name,
          new_password: password || undefined,
        },
        token?.token
      );

      setName(res.name);
      setEmail(res.email);

      if (token) token.user = res;

      setPassword("");
      setEditing(false);

      alert("Profile updated");

    } catch (err) {
      alert(err.message);
    }
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

        {/* CONTENT */}
        <View style={styles.userContainer}>

          {/* AVATAR */}
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={40} color="#04041c" />
          </View>

          {/* USER INFO */}
          <Text style={styles.userName}>
            {token === "guest" ? "Guest User" : (name || token?.user?.name)}
          </Text>

          <Text style={styles.userEmail}>
            {token === "guest" ? "No account" : (email || token?.user?.email)}
          </Text>

          {/* EDIT BUTTON */}
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
                placeholder="New name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
                style={[styles.input, { backgroundColor: "#0a0a2a", padding: 12, borderRadius: 12, marginBottom: 10 }]}
              />

              <TextInput
                placeholder="Email (cannot change)"
                placeholderTextColor="#888"
                value={email}
                editable={false}
                style={[styles.input, { backgroundColor: "#0a0a2a", padding: 12, borderRadius: 12, marginBottom: 10, opacity: 0.5 }]}
              />

              <TextInput
                placeholder="New password (optional)"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { backgroundColor: "#0a0a2a", padding: 12, borderRadius: 12, marginBottom: 10 }]}
              />

              <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
                <Text style={styles.primaryText}>Save</Text>
              </TouchableOpacity>

            </View>
          )}

          {/* AUTO SPEAK TOGGLE */}
          <TouchableOpacity
            style={styles.userBtn}
            onPress={() => setAutoSpeak(!autoSpeak)}
          >
            <Text style={styles.userBtnText}>
              Auto Voice Playback: {autoSpeak ? "ON 🔊" : "OFF 🔇"}
            </Text>
          </TouchableOpacity>

          {/* LANGUAGE */}
          <TouchableOpacity
            style={styles.userBtn}
            onPress={() => setOpenLang(!openLang)}
          >
            <Text style={styles.userBtnText}>
              Language: {selectedLang}
            </Text>
          </TouchableOpacity>

          {openLang && (
            <View style={styles.dropdown}>
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
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedLang(lang);
                      setOpenLang(false);
                    }}
                  >
                    <Text style={{ color: "white" }}>{lang}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          )}

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

        </View>

      </View>
    </View>
  );
}
