import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, ScrollView, StatusBar, StyleSheet, Text } from "react-native";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export default function Home() {
  return (
    <SafeAreaProvider>
        <LinearGradient style={styles.gradient} colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}>
            <SafeAreaView style={styles.container} edges={['top']}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>

                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backArrow}>‹</Text>
                    </Pressable>
                    
                    <Text style={styles.paragraph}> Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                        eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
                        minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                        aliquip ex ea commodo consequat. Duis aute irure dolor in
                        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                        culpa qui officia deserunt mollit anim id est laborum. 
                    </Text>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },

  gradient: {
    flex: 1
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    padding: 12,
  },

  paragraph: {
    fontSize: FontSizes.heading,
    color: Colors.black,
    fontFamily: Fonts.instrumentSerifItalic,
    marginTop: 80,
    textAlign: "center",
    lineHeight: 40,
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