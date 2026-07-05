import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";

export default function Home() {
  return (
    <LinearGradient style={styles.container} colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}>

        <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backArrow}>‹</Text>
        </Pressable>
    
    <Text style={styles.heading}>Da home screen</Text>
    </LinearGradient>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  heading: {
    fontSize: FontSizes.heading,
    color: Colors.black,
    fontFamily: Fonts.instrumentSerifItalic,
    marginTop: 80,
    textAlign: "center"

  },


  backButton: {
    position: "absolute",
    top: 60,
    left: 1,
    width: 64,
    height: 36,
    justifyContent: "center",
    alignItems: "center",   
  },
  
  backArrow:{
    fontSize: 36,
    color: Colors.black,
    lineHeight: 42
  },

});