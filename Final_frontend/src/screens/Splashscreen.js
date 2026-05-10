import { useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styles from "../styles/style";

export default function SplashScreen({ goNext }) {
  useEffect(() => {
    setTimeout(() => {
      goNext();
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
          <View style={styles.phoneFrame}>
    
            {/* CENTER CONTENT */}
            <View style={styles.homeCenter}>
    
              <View style={styles.homeCircle}>
                <Image
                  source={require("../assets/myai_logo.png")}
                  style={styles.homeImage}
                  resizeMode="contain"
                />
              </View>
    
              <Text style={styles.homeTitle}>MyAI Companion</Text>
              <Text style={styles.homeSubtitle}>
                Your intelligent health assistant
              </Text>
    
            </View>    
          </View>
        </View>
  );
}