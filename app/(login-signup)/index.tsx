import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
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

export default function Index() {
    const [selectedUniversity, setSelectedUniversity] = useState("");
    const [showUniversityDropdown, setShowUniversityDropdown] = useState(false);
    const [email, setEmail] = useState("");
    
    function handleSelectUniversity(university: string) {
        setSelectedUniversity(university);
        setShowUniversityDropdown(false);
    }

    return (
        <LinearGradient style={styles.container} colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}>
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
                        <Text style={styles.title}>Hey, Dater</Text>

                        <Text style={styles.tagline}>Welcome to Date, the easiest way to find a date for Greek life events</Text>

                        <Text style={styles.label}>Select your university</Text>
                            <Pressable
                                style={styles.dropdownButton}
                                onPress={() => setShowUniversityDropdown(!showUniversityDropdown)}
                            >
                                <Text
                                    style={[
                                    styles.dropdownText,
                                    selectedUniversity === "" ? styles.placeholderText : null,
                                    ]}
                                >
                                    {selectedUniversity || "Choose your school"}
                                </Text>
                                <Ionicons
                                    name={showUniversityDropdown ? "chevron-up" : "chevron-down"}
                                    size={22}
                                    color={Colors.black}
                                />
                            </Pressable>
                            {showUniversityDropdown ? (
                                <View style={styles.dropdown}>
                                    <Pressable
                                    style={styles.dropdownOption}
                                    onPress={() => handleSelectUniversity("University of Florida")}
                                    >
                                        <Text style={styles.dropdownOptionText}>
                                            University of Florida
                                        </Text>
                                    </Pressable>
                                </View>
                            ) : null}

                            <View style={styles.fieldGap} />

                            {selectedUniversity ? (
                            <>
                                <Text style={styles.label}>Enter your university email below</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder=""
                                    value={email}
                                    onChangeText={setEmail}
                                    returnKeyType="done"
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    //onSubmitEditing={() => router.push("/(login-signup)/create-account")}
                                />

                                <View style={styles.loginRow}>
                                    <Text style={styles.login}>Or </Text>

                                    <Pressable onPress={() => router.push("/(login-signup)/login")}>
                                        <Text style={[styles.login, styles.loginLink]}>log in</Text>
                                    </Pressable>
                                </View>
                            </>
                        ) : null}

                        <View style={styles.fieldGap} />

                        {email.trim() ? (
                            <>
                                <View style={styles.fieldGap} />

                                <Pressable
                                    style={styles.loginButton}
                                    onPress={() => router.push("/(login-signup)/verify-uni-email")}
                                >
                                    <Text style={styles.loginButtonText}>Go to verification</Text>
                                </Pressable>
                            </>
                        ) : null}

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
  content: {
    width: "100%",
    paddingHorizontal: 28,
    marginTop: 300,
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

  emailLabel: {
    fontSize: FontSizes.body,
    color: Colors.black,
    fontFamily: Fonts.interRegular,
    textAlign: "center",
    marginTop: 20,
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
    justifyContent: "center",
  },

    dropdownText: {
        fontFamily: Fonts.interRegular,
        fontSize: FontSizes.body,
        color: Colors.black,
    },

  placeholderText: {
    color: Colors.black,
    opacity: 0.5,
  },

  dropdown: {
    width: "100%",
    backgroundColor: Colors.inputBubble,
    borderRadius: 18,
    marginTop: 6,
    overflow: "hidden",
  },

  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  dropdownOptionText: {
    fontSize: FontSizes.body,
    color: Colors.black,
    fontFamily: Fonts.interRegular,
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

arrowWrapper: {
  width: 24,
  height: 24,
  justifyContent: "center",
  alignItems: "center",
},

arrow: {
  fontSize: 24,
  color: Colors.black,
  fontFamily: Fonts.interRegular,
  lineHeight: 24,
  textAlign: "center",
},

arrowOpen: {
  transform: [{ rotate: "180deg" }],
},

dropdownButton: {
  height: 44,
  borderRadius: 22,
  backgroundColor: Colors.inputBubble,
  paddingHorizontal: 16,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
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