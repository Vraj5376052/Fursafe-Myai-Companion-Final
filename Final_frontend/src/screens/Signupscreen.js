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
import { register } from "../services/apiService";

export default function SignupScreen({
  goLogin,
  onSignup,
  goTerms,
  termsAccepted,
  setTermsAccepted,
  formValues,
  setFormValues,
}) {
  // Lifted to App.js so values survive navigation to Terms and back
  const name     = formValues?.name     ?? "";
  const email    = formValues?.email    ?? "";
  const password = formValues?.password ?? "";
  const confirm  = formValues?.confirm  ?? "";
  const setName     = (v) => setFormValues((f) => ({ ...f, name: v }));
  const setEmail    = (v) => setFormValues((f) => ({ ...f, email: v }));
  const setPassword = (v) => setFormValues((f) => ({ ...f, password: v }));
  const setConfirm  = (v) => setFormValues((f) => ({ ...f, confirm: v }));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) {
      setError("Please fill all fields");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (!termsAccepted) {
      setError("You must accept the Terms and Conditions to register");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await register(name, email, password, termsAccepted);
      if (res.access_token) {
        onSignup(res);
      } else {
        setError("Signup failed - please try again");
      }
    } catch (err) {
      setError(err.message || "Server error - please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <View style={styles.phoneFrame}>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <View style={styles.form}>

            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#888"
                value={name}
                onChangeText={setName}
                style={styles.inputField}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Email"
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
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#888"
                value={password}
                onChangeText={setPassword}
                style={styles.inputField}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#888" style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry
                placeholderTextColor="#888"
                value={confirm}
                onChangeText={setConfirm}
                style={styles.inputField}
              />
            </View>

            {/* TERMS LINK */}
            <TouchableOpacity onPress={goTerms} style={{ marginTop: 6 }}>
              <Text style={styles.link}>Read Terms &amp; Conditions</Text>
            </TouchableOpacity>

            {/* TERMS CHECKBOX */}
            <TouchableOpacity
              onPress={() => setTermsAccepted(!termsAccepted)}
              style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
            >
              <Ionicons
                name={termsAccepted ? "checkbox" : "square-outline"}
                size={22}
                color={termsAccepted ? "#4CAF50" : "#888"}
                style={{ marginRight: 8 }}
              />
              <Text style={{ color: "#ccc", flex: 1 }}>
                I agree to the Terms and Conditions
              </Text>
            </TouchableOpacity>

          </View>

          {error ? (
            <Text style={{ color: "#ff4444", textAlign: "center", marginTop: 10 }}>
              {error}
            </Text>
          ) : null}

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#04041c" />
            ) : (
              <Text style={styles.primaryText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.grayText}>
            Already have an account?{" "}
            <Text style={styles.link} onPress={goLogin}>Login</Text>
          </Text>

        </View>
      </View>
    </ScrollView>
  );
}