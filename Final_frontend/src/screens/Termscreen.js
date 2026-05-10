import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/style";

export default function TermsScreen({ goBack }) {
  return (
    <View style={styles.container}>
      <View style={styles.phoneFrame}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#0dd9f7" />
          </TouchableOpacity>
          <Text style={styles.headerText}>Terms &amp; Services</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* CONTENT */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>MyAI Companion</Text>
          <Text style={styles.subtitle}>
            Please read these terms carefully before using the app.
          </Text>

          <Text style={styles.sectionTitle}>1. Health Disclaimer</Text>
          <Text style={styles.text}>
            MyAI Companion is not a professional health advisor, doctor, nurse,
            pharmacist, or emergency service. The information provided by this
            app is for general support and understanding only.
          </Text>
          <Text style={styles.text}>
            Always contact your local doctor, pharmacist, or healthcare provider
            for accurate medical advice, diagnosis, or treatment.
          </Text>

          <Text style={styles.sectionTitle}>2. Emergency Situations</Text>
          <Text style={styles.text}>
            Do not use this app during a medical emergency. If you feel unsafe,
            seriously unwell, or need urgent help, contact emergency services
            immediately.
          </Text>

          <Text style={styles.sectionTitle}>3. AI-Generated Information</Text>
          <Text style={styles.text}>
            Responses from MyAI Companion may be incomplete, inaccurate, or not
            suitable for your personal situation. You should not rely only on the
            app to make health decisions.
          </Text>

          <Text style={styles.sectionTitle}>4. User Responsibility</Text>
          <Text style={styles.text}>
            You are responsible for checking any information with a qualified
            healthcare professional before taking action.
          </Text>

          <Text style={styles.sectionTitle}>5. Privacy</Text>
          <Text style={styles.text}>
            The app may process text, images, audio recordings, or chat messages
            to provide support features such as OCR, transcription, translation,
            and AI responses.
          </Text>
          <Text style={styles.text}>
            Do not upload sensitive information unless you are comfortable using
            it in the app.
          </Text>

          <Text style={styles.sectionTitle}>6. Acceptance</Text>
          <Text style={styles.text}>
            By continuing to use MyAI Companion, you agree that the app is only a
            support tool and not a replacement for professional medical care.
          </Text>
        </ScrollView>

        {/* ACCEPT BUTTON */}
        <TouchableOpacity
          style={[styles.homeButton, { marginHorizontal: 20, marginBottom: 25 }]}
          onPress={goBack}
        >
          <Text style={styles.homeButtonText}>I Understand &amp; Continue</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}