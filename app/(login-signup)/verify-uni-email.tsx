import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Verify() {
    const [code, setCode] = useState("");
    return (
        <LinearGradient style={styles.container} colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backArrow}>‹</Text>
            </Pressable>
            <View style={styles.content}>
                <Text style={styles.title}>Verify your university email</Text>

                <View style={styles.fieldGap} />

                <Text style={styles.label}>To verify your university email, enter the 6 digit code sent to you in the boxes below.</Text>

                <View style={styles.codeContainer}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                        <View
                            key={index}
                            style={[
                                styles.codeBox,
                                code.length === index ? styles.activeCodeBox : null,
                            ]}
                        >
                            <Text style={styles.codeText}>{code[index] || ""}</Text>
                        </View>
                    ))}

                    <TextInput
                        style={styles.hiddenInput}
                        value={code}
                        onChangeText={(text) => {
                            const digitsOnly = text.replace(/[^0-9]/g, "");
                            setCode(digitsOnly.slice(0, 6));
                        }}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        maxLength={6}
                        autoFocus
                        returnKeyType="done"
                        //onSubmitEditing={() => router.push("/(login-signup)/create-account")}
                    />
                </View>

                <View style={styles.loginRow}>
                    <Text style={styles.login}>Didn't get a code?  </Text>
                    <Pressable onPress={() => router.push("/(login-signup)/login")}> 
                        {/* CHANGE TO ROUTE TO ACTUAL LINK */}
                        <Text style={[styles.login, styles.loginLink]}>Resend code</Text>
                    </Pressable>
                </View>

                <Pressable
                    style={styles.loginButton}
                    onPress={() => router.push("/(login-signup)/create-account")}
                >
                    <Text style={styles.loginButtonText}>Verify</Text>
                </Pressable>
            </View>
        </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    width: "100%",
    paddingHorizontal: 28,
    marginTop: 150,
  },

  title: {
    fontSize: FontSizes.title,
    color: Colors.black,
    fontFamily: Fonts.instrumentSerifRegular,
    textAlign: "center",
    marginBottom: 8,
  },

  tagline: {
    fontSize: 24,
    color: Colors.black,
    fontFamily: Fonts.instrumentSerifRegular,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 8,
  },

  label: {
    fontSize: FontSizes.body,
    color: Colors.black,
    fontFamily: Fonts.interRegular,
    textAlign: "center",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.inputBubble,
    paddingHorizontal: 16,
    fontFamily: Fonts.interRegular,
    fontSize: FontSizes.body,
    color: Colors.black,
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  login: {
    fontSize: FontSizes.body,
    color: Colors.black,
    fontFamily: Fonts.interRegular,
    textAlign: "center",
    marginTop: 8,
  },

  loginLink: {
    textDecorationLine: "underline",
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

  codeContainer: {
  width: "100%",
  flexDirection: "row",
  justifyContent: "center",
  gap: 10,
  marginTop: 24,
  marginBottom: 20,
  position: "relative",
},

codeBox: {
  width: 46,
  height: 56,
  borderRadius: 12,
  backgroundColor: Colors.inputBubble,
  borderWidth: 1,
  borderColor: "rgba(0, 0, 0, 0.12)",
  justifyContent: "center",
  alignItems: "center",
},

activeCodeBox: {
  borderColor: Colors.black,
},

codeText: {
  fontSize: 24,
  color: Colors.black,
  fontFamily: Fonts.interRegular,
},

hiddenInput: {
  position: "absolute",
  width: "100%",
  height: 56,
  opacity: 0,
},

  fieldGap: {
    height: 14,
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



