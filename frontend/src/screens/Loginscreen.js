import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/style";
import { login } from "../services/apiService";

export default function LoginScreen({ onLogin, goSignup, goTerms }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Enter email & password");
      return;
    }
    if (!acceptedTerms) {
      setError("You must accept the Terms and Conditions to continue");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await login(email, password);
      if (res.access_token) {
        onLogin(res);
      } else {
        setError("Invalid login");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <View style={styles.phoneFrame}>

          <View style={styles.loginTop}>
            <View style={styles.circleIcon}>
              <Ionicons name="person" size={30} color="#04041c" />
            </View>
            <Text style={styles.title}>MyAI Companion</Text>
            <Text style={styles.subtitle}>Your intelligent health assistant</Text>
          </View>

          <View style={styles.form}>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#888"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.inputField}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#888"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.inputField}
              />
            </View>

            {/* TERMS LINK */}
            <TouchableOpacity onPress={goTerms} style={{ marginTop: 6 }}>
              <Text style={styles.link}>Read Terms &amp; Conditions</Text>
            </TouchableOpacity>

            {/* TERMS CHECKBOX */}
            <TouchableOpacity
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
            >
              <Ionicons
                name={acceptedTerms ? "checkbox" : "square-outline"}
                size={22}
                color={acceptedTerms ? "#4CAF50" : "#888"}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "#ccc", flex: 1 }}>
                I agree to the Terms and Conditions
              </Text>
            </TouchableOpacity>

            {error ? (
              <Text style={{ color: "#ff4444", marginTop: 5, textAlign: "center" }}>
                {error}
              </Text>
            ) : null}

          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#04041c" />
            ) : (
              <Text style={styles.primaryText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onLogin({ access_token: null, user: null })}>
            <Text style={styles.grayText}>Continue as Guest</Text>
          </TouchableOpacity>

          <Text style={[styles.grayText, { marginTop: 15 }]}>
            Don't have an account?{" "}
            <Text style={styles.link} onPress={goSignup}>Sign up</Text>
          </Text>

        </View>
      </View>
    </ScrollView>
  );
}