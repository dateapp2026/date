import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View
} from "react-native";

export default function Verify() {
    const [code, setCode] = useState("");
    const [codeError, setCodeError] = useState("");
    const [codeStatus, setCodeStatus] = useState<"default" | "error" | "success">("default");

    const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const inputRef = useRef<TextInput>(null);

    useEffect(() => {
        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
        };
    }, []);

    function handleContinue() {
        if(code !== "000000"){
            setCodeStatus("error");
            setCodeError("Wrong code, please try again.");
            return;
        }

        setCodeStatus("success");
        setCodeError("");

        successTimeoutRef.current = setTimeout(() => {
            router.push("/(main-screens)/home");
        }, 500);
    }

    return (
        <LinearGradient style={styles.container} colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <Pressable style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backArrow}>‹</Text>
                    </Pressable>

                    <View style={styles.content}>
                        <Text style={styles.title}>Verify your mobile number</Text>

                        <View style={styles.fieldGap} />

                        <Text style={styles.label}>To verify your mobile number, enter the 6 digit code sent to you in the boxes below.</Text>

                        <Pressable
                            style={styles.codeContainer}
                            onPress={() => inputRef.current?.focus()}
                        >
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.codeBox,
                                        code.length === index && codeStatus === "default" ? styles.activeCodeBox : null,
                                        codeStatus === "error" ? styles.errorCodeBox : null,
                                        codeStatus === "success" ? styles.successCodeBox : null,
                                    ]}
                                >
                                    <Text style={styles.codeText}>{code[index] || ""}</Text>
                                </View>
                            ))}

                            <TextInput
                                style={styles.hiddenInput}
                                ref={inputRef}
                                value={code}
                                onChangeText={(text) => {
                                    const digitsOnly = text.replace(/[^0-9]/g, "");
                                    setCode(digitsOnly.slice(0, 6));
                                    setCodeError("");
                                    setCodeStatus("default");
                                }}
                                autoComplete="one-time-code"
                                keyboardType="number-pad"
                                textContentType="oneTimeCode"
                                maxLength={6}
                                autoFocus
                            />
                        </Pressable>
                        {codeError ? <Text style={styles.errorText}>{codeError}</Text> : null}

                        <View style={styles.loginRow}>
                            <Text style={styles.login}>Didn't get a code?  </Text>
                            <Pressable onPress={() => router.push("/(login-signup)/login")}> 
                                {/* CHANGE TO ROUTE TO ACTUAL LINK */}
                                <Text style={[styles.login, styles.loginLink]}>Resend code</Text>
                            </Pressable>
                        </View>

                        <Pressable
                            style={styles.loginButton}
                            onPress={handleContinue}
                        >
                            <Text style={styles.loginButtonText}>Verify</Text>
                        </Pressable>
                    </View>
                </View>
            </TouchableWithoutFeedback>
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
    errorText: {
    color: "red",
    fontSize: FontSizes.body,
    fontFamily: Fonts.interRegular,
    marginTop: 2,
    marginBottom: 8,
    textAlign: "center"
  },

errorCodeBox: {
  borderColor: "red",
  borderWidth: 2,
},

successCodeBox: {
  borderColor: "green",
  borderWidth: 2,
},
});



