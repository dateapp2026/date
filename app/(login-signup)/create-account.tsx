import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { useSignup } from "@/contexts/SignupContext";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const usernameRegex = /^[a-zA-Z0-9_]+$/;

export default function Login() {
    const { setCredentials } = useSignup();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmedPassword, setConfirmedPassword] = useState("");

    const [usernameError, setUsernameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmedError, setConfirmedError] = useState("");

    function handleContinue() {
        if (username.trim() === "") {
            setUsernameError("Please enter a username.");
            return;
        }

        if (!usernameRegex.test(username.trim())) {
            setUsernameError("Username can only contain letters, numbers, and underscores — no spaces.");
            return;
        }

        const passwordValidationError = validatePassword(password);
        if (passwordValidationError) {
            setPasswordError(passwordValidationError);
            return;
        }

        if (confirmedPassword === "") {
            setConfirmedError("Please confirm your password.");
            return;
        }

        if (password !== confirmedPassword){
            setConfirmedError("Passwords do not match");
            return;
        }

        setCredentials(username.trim(), password);
        router.push("/(login-signup)/details");
    }

    function validatePassword(password: string) {
        if (password.length < 8 ||
            !/[0-9]/.test(password) ||
            !/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]`~;]/.test(password) ||
            !/[A-Z]/.test(password) ||
            !/[a-z]/.test(password)
            )    
        {
            return "Password must be at least 8 characters long and include a number, a symbol, an upper case and a lower case letter.";
        }

        return "";
    }

    return (
        <LinearGradient
        style={styles.container}
        colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}
        >
            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                <Pressable style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backArrow}>‹</Text>
                </Pressable>
                <Text style={styles.title}>Create Your Account</Text>

                <Text style={styles.label}>Create your username</Text>
                <TextInput 
                    style={styles.input}
                    value={username} 
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="default"
                    textContentType="username"
                    onChangeText={(text) => {
                        setUsername(text);
                        setUsernameError("");
                    }}
                />
                {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

                <View style={styles.fieldGap} />

                <Text style={styles.label}>Create your password</Text>
                <TextInput 
                    style={styles.input} 
                    value={password} 
                    onChangeText={(text)=>{
                        setPassword(text); 
                        setPasswordError(validatePassword(text));
                    }}
                    secureTextEntry 
                />
                {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

                <View style={styles.fieldGap} />

                <Text style={styles.label}>Confirm password</Text>
                <TextInput 
                    style={styles.input} 
                    value={confirmedPassword} 
                    onChangeText={(text)=>{
                        setConfirmedPassword(text); 
                        setConfirmedError("");
                    }}
                    secureTextEntry 
                />
                {confirmedError ? <Text style={styles.errorText}>{confirmedError}</Text> : null}

                <Pressable style={styles.loginButton} onPress={handleContinue}>
                    <Text style={styles.loginButtonText}>Next</Text>
                </Pressable>

                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </LinearGradient>
  );
}

const styles = StyleSheet.create({
container: {
  flex: 1,
},

keyboardView: {
  flex: 1,
},

scrollContent: {
  flexGrow: 1,
  paddingHorizontal: 32,
  justifyContent: "center",
  paddingTop: 80,
  paddingBottom: 40,
},

  title: {
    fontSize: FontSizes.title,
    textAlign: "left",
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

  errorText: {
    color: "red",
    fontSize: FontSizes.body,
    fontFamily: Fonts.interRegular,
    marginTop: 8
  }
});