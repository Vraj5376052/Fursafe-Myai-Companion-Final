import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import styles from "../styles/style";
import { transcribeAudio } from "../services/apiService";

export default function RecordScreen({ goBack, token }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef(null);

  // Waveform bars — each has its own animated value
  const bars = useRef(
    [...Array(20)].map(() => new Animated.Value(10))
  ).current;

  // Start waveform animation only while recording
  const animLoops = useRef([]);

  const startWaveform = () => {
    animLoops.current = bars.map((anim) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: Math.random() * 40 + 10,
            duration: 200 + Math.random() * 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 10,
            duration: 200 + Math.random() * 200,
            useNativeDriver: false,
          }),
        ])
      );
      loop.start();
      return loop;
    });
  };

  const stopWaveform = () => {
    animLoops.current.forEach((loop) => loop.stop());
    bars.forEach((anim) => anim.setValue(10));
  };

  // Auto-start recording when screen opens
  useEffect(() => {
    startRecording();
    return () => {
      // Clean up if user navigates away mid-recording
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission denied", "Microphone access is required.");
        goBack();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: "audio/webm",
          bitsPerSecond: 128000,
        },
      });

      recordingRef.current = recording;
      setIsRecording(true);
      startWaveform();
    } catch (err) {
      console.error("START RECORD ERROR:", err);
      Alert.alert("Error", "Could not start recording. Please try again.");
      goBack();
    }
  };

  const stopAndTranscribe = async () => {
    if (!recordingRef.current || isProcessing) return;

    try {
      stopWaveform();
      setIsRecording(false);
      setIsProcessing(true);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

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

  return (
    <View style={styles.container}>
      <View style={styles.phoneFrame}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (recordingRef.current) {
              recordingRef.current.stopAndUnloadAsync().catch(() => {});
            }
            goBack();
          }}>
            <Ionicons name="arrow-back" size={24} color="#0dd9f7" />
          </TouchableOpacity>
        </View>

        <View style={styles.recordContainer}>

          {/* MIC ICON */}
          <Ionicons
            name="mic"
            size={70}
            color={isRecording ? "#0dd9f7" : "#555"}
          />

          <Text style={{ color: "white", marginTop: 20 }}>
            {isProcessing
              ? "Transcribing..."
              : isRecording
              ? "I'm listening..."
              : "Starting..."}
          </Text>

          {/* WAVEFORM */}
          <View style={styles.waveContainer}>
            {bars.map((anim, i) => (
              <Animated.View
                key={i}
                style={{
                  width: 3,
                  height: anim,
                  backgroundColor: "#0dd9f7",
                  marginHorizontal: 2,
                  borderRadius: 2,
                }}
              />
            ))}
          </View>

          {/* STOP BUTTON */}
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
