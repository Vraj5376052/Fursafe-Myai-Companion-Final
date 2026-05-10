import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioRecorder, AudioModule, RecordingPresets } from "expo-audio";
import styles from "../styles/style";
import { transcribeAudio } from "../services/apiService";

export default function RecordScreen({ goBack, token }) {
  const [isRecording, setIsRecording]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Track recording state in a ref so cleanup never touches the native object
  const recordingStarted = useRef(false);
  const didStop = useRef(false);

  // Waveform bars
  const bars = useRef([...Array(20)].map(() => new Animated.Value(10))).current;
  const animLoops = useRef([]);

  const startWaveform = () => {
    animLoops.current = bars.map((anim) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: Math.random() * 40 + 10, duration: 200 + Math.random() * 200, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 10, duration: 200 + Math.random() * 200, useNativeDriver: false }),
        ])
      );
      loop.start();
      return loop;
    });
  };

  const stopWaveform = () => {
    animLoops.current.forEach((l) => l.stop());
    bars.forEach((a) => a.setValue(10));
  };

  useEffect(() => {
    startRecording();
    return () => {
      // Only stop if we started and haven't stopped yet — avoid touching native obj after unmount
      if (recordingStarted.current && !didStop.current) {
        didStop.current = true;
        try { audioRecorder.stop(); } catch (_) {}
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await AudioModule.requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission denied", "Microphone access is required.");
        goBack();
        return;
      }

      await AudioModule.setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await audioRecorder.prepareToRecordAsync(RecordingPresets.HIGH_QUALITY);
      audioRecorder.record();

      recordingStarted.current = true;
      setIsRecording(true);
      startWaveform();
    } catch (err) {
      console.error("START RECORD ERROR:", err);
      Alert.alert("Error", "Could not start recording. Please try again.");
      goBack();
    }
  };

  const stopAndTranscribe = async () => {
    if (!recordingStarted.current || didStop.current || isProcessing) return;

    try {
      didStop.current = true;
      stopWaveform();
      setIsRecording(false);
      setIsProcessing(true);

      await audioRecorder.stop();
      const uri = audioRecorder.uri;

      await AudioModule.setAudioModeAsync({ allowsRecording: false });

      if (!uri) {
        Alert.alert("Error", "No audio recorded.");
        goBack();
        return;
      }

      const result = await transcribeAudio(uri, token);
      const text = result?.text?.trim();

      if (!text) {
        Alert.alert("No speech detected", "Please try again and speak clearly.");
        goBack();
        return;
      }

      goBack(text);
    } catch (err) {
      console.error("TRANSCRIBE ERROR:", err);
      Alert.alert("Transcription failed", err.message || "Please try again.");
      goBack();
    }
  };

  const handleBack = () => {
    if (recordingStarted.current && !didStop.current) {
      didStop.current = true;
      try { audioRecorder.stop(); } catch (_) {}
    }
    goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.phoneFrame}>

        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color="#0dd9f7" />
          </TouchableOpacity>
        </View>

        <View style={styles.recordContainer}>
          <Ionicons name="mic" size={70} color={isRecording ? "#0dd9f7" : "#555"} />

          <Text style={{ color: "white", marginTop: 20 }}>
            {isProcessing ? "Transcribing..." : isRecording ? "I'm listening..." : "Starting..."}
          </Text>

          <View style={styles.waveContainer}>
            {bars.map((anim, i) => (
              <Animated.View
                key={i}
                style={{ width: 3, height: anim, backgroundColor: "#0dd9f7", marginHorizontal: 2, borderRadius: 2 }}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={stopAndTranscribe}
            style={{ marginTop: 30 }}
            disabled={isProcessing || !isRecording}
          >
            <Text style={{ color: isProcessing ? "#555" : "#0dd9f7" }}>
              {isProcessing ? "Processing..." : "Stop"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}
