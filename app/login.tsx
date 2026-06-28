// app/login.tsx
import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Login() {
  return (
    <LinearGradient
      style={styles.container}
      colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}
    >
    <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backArrow}>‹</Text>
    </Pressable>
      <Text style={styles.title}>Welcome Back</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput style={styles.input} />

        <View style={styles.fieldGap} />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} secureTextEntry />

        <Text style={styles.forgot}>Forgot password?</Text>

        <Pressable style={styles.loginButton} onPress={() => router.push("/home")}>
            <Text style={styles.loginButtonText}>Log in</Text>
        </Pressable>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: "center",
  },

  title: {
    fontSize: FontSizes.title,
    textAlign: "center",
    marginBottom: 32,
    fontFamily: Fonts.instrumentSerifRegular,
  },

  label: {
    fontSize: FontSizes.body,
    color: Colors.black,
    fontFamily: Fonts.interRegular,
    marginBottom: 8,
  },

  input: {
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.inputBubble,
    paddingHorizontal: 16,
    fontFamily: Fonts.interRegular,
    fontSize: FontSizes.body,
    color: Colors.black,
  },

  fieldGap: {
    height: 14,
  },

  forgot: {
    textAlign: "center",
    textDecorationLine: "underline",
    marginTop: 8,
    fontSize: FontSizes.body,
    color: Colors.black,
    fontFamily: Fonts.interRegular,
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
  
  loginButton: {
    backgroundColor: Colors.black,
    height: 44,
    paddingHorizontal: 32,
    borderRadius: 22,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },

  loginButtonText: {
    color: "white",
    fontFamily: Fonts.instrumentSerifRegular,
    fontSize: 24,
  },

});