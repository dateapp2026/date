import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
    return (
    <LinearGradient
        style={styles.gradient}
        colors={[
        Colors.gradientCream,
        Colors.gradientGreen,
        Colors.gradientBlue,
        ]}
    >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <Text style={styles.title}>Date App</Text>

                <Text style={styles.paragraph}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat. Duis aute irure dolor in
                reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                culpa qui officia deserunt mollit anim id est laborum.
                </Text>
                
            </ScrollView>
        </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    padding: 12,
    paddingBottom: 130,
  },

  title: {
    fontSize: FontSizes.heading,
    color: Colors.black,
    fontFamily: Fonts.instrumentSerifRegular,
    textAlign: "center",
    marginTop: 24,
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
    zIndex: 10,
  },

  backArrow: {
    fontSize: 36,
    color: Colors.black,
    lineHeight: 42,
  },
});