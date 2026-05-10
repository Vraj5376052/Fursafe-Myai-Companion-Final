import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import {
  CameraView,
  useCameraPermissions,
} from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/style";
import { imageToText } from "../services/apiService";

export default function CameraScreen({ goBack, token }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [captured, setCaptured] = useState(null);

  //  TAKE PHOTO
  const takePicture = async () => {
    try {
      if (!cameraRef.current) return;

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
      });

      if (!photo?.uri) return;

      setCaptured(photo.uri); 

      setLoading(true);

      try {
        const res = await imageToText(photo.uri, token);
        const text = res.text || res.ParsedText || "";
        if (text.trim()) {
          goBack(text);
        } else {
          Alert.alert("No text found", "Could not read any text from this image.");
          goBack();
        }
      } catch (err) {
        console.error("OCR error:", err);
        Alert.alert("Scan failed", err.message || "Could not scan the image. Please try again.");
        goBack();
      }
    } catch (err) {
      console.log("Camera error:", err);
    } finally {
      setLoading(false);
    }
  };

  // PICK IMAGE
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.7,
      });

      if (!result || result.canceled || !result.assets?.length) return;

      setCaptured(result.assets[0].uri); 

      setLoading(true);

      try {
        const res = await imageToText(result.assets[0].uri, token);
        const text = res.text || res.ParsedText || "";
        if (text.trim()) {
          goBack(text);
        } else {
          Alert.alert("No text found", "Could not read any text from this image.");
          goBack();
        }
      } catch (err) {
        console.error("OCR error:", err);
        Alert.alert("Scan failed", err.message || "Could not scan the image. Please try again.");
        goBack();
      }
    } catch (err) {
      console.log("Upload error:", err);
    } finally {
      setLoading(false);
    }
  };

  // PERMISSION
  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "white", marginBottom: 10 }}>
          Camera permission needed
        </Text>

        <TouchableOpacity onPress={requestPermission}>
          <Text style={{ color: "#0dd9f7" }}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.phoneFrame}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0dd9f7" />
          </TouchableOpacity>
        </View>

        {/* CAMERA / PREVIEW */}
        {captured ? (
          <Image source={{ uri: captured }} style={{ flex: 1 }} />
        ) : (
          <CameraView ref={cameraRef} style={{ flex: 1 }} />
        )}

        {/* SCAN FRAME */}
        <View style={styles.scanFrame} />

        {/* LOADING */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0dd9f7" />
            <Text style={{ color: "white", marginTop: 10 }}>
              Scanning...
            </Text>
          </View>
        )}

        {/* CONTROLS */}
        <View style={styles.cameraControls}>

          {/* UPLOAD */}
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="image-outline" size={32} color="#0dd9f7" />
          </TouchableOpacity>

          {/* CAPTURE */}
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={takePicture}
          />

          <View style={{ width: 32 }} />

        </View>

      </View>
    </View>
  );
}