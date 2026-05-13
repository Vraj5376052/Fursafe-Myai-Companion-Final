import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles/style";

const { width } = Dimensions.get("window");

export default function OnboardingScreen({ goNext }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatRef = useRef(null);

  const slides = [
    {
      title: "Welcome to MyAI",
      text: "Your AI-powered health assistant",
      icon: "sparkles-outline",
    },
    {
      title: "Ask anything",
      text: "Explain, summarise, translate instantly",
      icon: "chatbubble-ellipses-outline",
    },
    {
      title: "Speak or Scan",
      text: "Use voice or camera for quick help",
      icon: "mic-outline",
    },
    {
      title: "Important Notice",
      text: "Not a professional health advisor. Always consult a doctor.",
      icon: "warning-outline",
    },
  ];

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      goNext(); 
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={{
        width,
        flex: 1, 
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
      }}
    >
      <Ionicons name={item.icon} size={80} color="#0dd9f7" />

      <Text
        style={[
          styles.title,
          { marginTop: 30, textAlign: "center", marginTop: 20 },
        ]}
      >
        {item.title}
      </Text>

      <Text
        style={[
          styles.subtitle,
          { textAlign: "center" },
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.phoneFrame}>

        {/* SKIP */}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 10,
          }}
          onPress={goNext}
        >
          <Text style={{ color: "#0dd9f7" }}>Skip</Text>
        </TouchableOpacity>

        {/* SLIDER */}
        <Animated.FlatList
          ref={flatRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ flexGrow: 1 }} 
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / width
            );
            setCurrentIndex(index);
          }}
        />

        {/* DOTS */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>

        {/* NEXT BUTTON */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
        >
          <Text style={styles.primaryText}>
            {currentIndex === slides.length - 1
              ? "Get Started"
              : "Next"}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}