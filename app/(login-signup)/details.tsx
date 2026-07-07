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

export default function Login() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [gender, setGender] = useState("");
    const [genderOpen, setGenderOpen] = useState(false);

    const [dateOfBirth, setDateOfBirth] = useState("");
    const [dateOfBirthError, setDateOfBirthError] = useState("");

    const [mobileNumber, setMobileNumber] = useState("");
    const [mobileNumberError, setMobileNumberError] = useState("");

    const [email, setEmail] = useState("");

    const [submitted, setSubmitted] = useState(false);
    const [formError, setFormError] = useState("");

    function handleCreateAccount(){
        setSubmitted(true);

        const missingFieldRequired =
            firstName.trim() === "" ||
            lastName.trim() === "" ||
            gender === "" ||
            dateOfBirth.trim() === "" ||
            mobileNumber.trim() === "" ||
            email.trim() === "";

        if(missingFieldRequired){
            setFormError("Please fill out all fields.");
            return;
        }

        if (!isValidDateOfBirth(dateOfBirth)) {
            setDateOfBirthError("Invalid date of birth");
            return;
        }

        if(!isValidMobileNumber(mobileNumber)){
            setMobileNumberError("Invalid mobile number");
            return;
        }

        setFormError("");
        router.push("/(main-screens)/home");
    }

    function formatDateOfBirth(text: string) {
        const numbersOnly = text.replace(/\D/g, "");

        const limited = numbersOnly.slice(0, 8);

        if (limited.length <= 2) {
            setDateOfBirth(limited);
        } else if (limited.length <= 4) {
            setDateOfBirth(`${limited.slice(0, 2)}/${limited.slice(2)}`);
        } else {
            setDateOfBirth(
            `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4)}`
            );
        }
    }

    function formatNumber(text: string){

        const numbersOnly = text.replace(/\D/g, "");
        const limited = numbersOnly.slice(0, 10);

        if (limited.length <= 3) {
            setMobileNumber(limited);
        } else if (limited.length <= 6) {
            setMobileNumber(`${limited.slice(0, 3)}-${limited.slice(3)}`);
        } else {
            setMobileNumber(
            `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`
            );
        }
    }

    function isValidDateOfBirth(dob: string) {
        const numbersOnly = dob.replace(/\D/g, "");

        if (numbersOnly.length !== 8){
            return false;
        }

        const month = Number(numbersOnly.slice(0, 2));
        const day = Number(numbersOnly.slice(2, 4));
        const year = Number(numbersOnly.slice(4, 8));

        const birthDate = new Date(year, month - 1, day);

        const dateIsReal =
            birthDate.getFullYear() === year &&
            birthDate.getMonth() === month - 1 &&
            birthDate.getDate() === day;

        if (!dateIsReal) {
            return false;
        }

        const today = new Date();

        let age = today.getFullYear() - birthDate.getFullYear();

        const birthdayHasNotHappenedYetThisYear =
        today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
            today.getDate() < birthDate.getDate());

        if (birthdayHasNotHappenedYetThisYear) {
            age--;
        }

        return age >= 18;
    }

    function isValidMobileNumber(num: string) {
        const numbersOnly = num.replace(/\D/g, "");

        if(numbersOnly.length !== 10){
            return false;
        }

        return true;
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
                        <Text style={styles.title}>A few more details...</Text>

                        <Text style={styles.label}>First name</Text>
                        <TextInput 
                            style={[
                                styles.input,
                                submitted && firstName.trim() === "" ? styles.inputError : null,
                            ]} 
                            value={firstName}
                            onChangeText={setFirstName}
                            returnKeyType="done"
                        />

                        <View style={styles.fieldGap} />

                        <Text style={styles.label}>Last name</Text>
                        <TextInput 
                            style={[
                                styles.input,
                                submitted && lastName.trim() === "" ? styles.inputError : null,
                            ]} 
                            value={lastName}
                            onChangeText={setLastName}
                            returnKeyType="done"
                        />

                        <View style={styles.fieldGap} />

                        <Text style={styles.label}>Gender</Text>
                        <Pressable
                            style={[
                                styles.dropdownButton,
                                submitted && gender === "" ? styles.inputError : null,
                            ]}
                            onPress={() => setGenderOpen(!genderOpen)}
                        >
                        <Text style={styles.dropdownText}>
                            {gender ? gender : "Select gender"}
                        </Text>
                        <Ionicons
                            name={genderOpen ? "chevron-up" : "chevron-down"}
                            size={22}
                            color={Colors.black}
                        />
                        </Pressable>
                        {genderOpen ? (
                        <View style={[styles.dropdownMenu]}>
                            <Pressable
                            style={styles.dropdownOption}
                            onPress={() => {
                                setGender("Male");
                                setGenderOpen(false);
                            }}
                            >
                            <Text style={styles.dropdownOptionText}>Male</Text>
                            </Pressable>

                            <Pressable
                            style={styles.dropdownOption}
                            onPress={() => {
                                setGender("Female");
                                setGenderOpen(false);
                            }}
                            >
                            <Text style={styles.dropdownOptionText}>Female</Text>
                            </Pressable>
                        </View>
                        ) : null}

                        <View style={styles.fieldGap} />

                        <Text style={styles.label}>Date of birth</Text>
                        <TextInput 
                            style={[
                                styles.input,
                                submitted && dateOfBirth.trim() === "" ? styles.inputError : null,
                                dateOfBirthError ? styles.inputError : null,
                            ]} 
                            value={dateOfBirth}
                            onChangeText={(text) => {
                                formatDateOfBirth(text);
                                setDateOfBirthError("");
                            }}
                            onBlur={() => {
                                if (dateOfBirth.trim() !== "" && !isValidDateOfBirth(dateOfBirth)) {
                                    setDateOfBirthError("Invalid date of birth");
                                }
                            }}
                            placeholder="MM/DD/YYYY" 
                            placeholderTextColor="#777"
                            keyboardType="number-pad"
                            maxLength={10}
                        />
                        {dateOfBirthError ? (<Text style={styles.errorText}>{dateOfBirthError}</Text>) : null}
                        
                        <View style={styles.fieldGap} />

                        <Text style={styles.label} >Mobile number</Text>
                        <TextInput 
                            style={[
                                styles.input,
                                submitted && mobileNumber.trim() === "" ? styles.inputError : null,
                                mobileNumberError ? styles.inputError : null,
                            ]} 
                            value={mobileNumber}
                            onChangeText={(text) => {
                                formatNumber(text);
                                setMobileNumberError("");
                            }}
                            onBlur={() => {
                                if (mobileNumber.trim() !== "" && !isValidMobileNumber(mobileNumber)) {
                                    setMobileNumberError("Invalid mobile number");
                                }
                            }}
                            placeholder="XXX-XXX-XXXX"
                            placeholderTextColor="#777"
                            keyboardType="phone-pad"
                            maxLength={12}
                        />
                        {mobileNumberError ? (<Text style={styles.errorText}>{mobileNumberError}</Text>) : null}


                        <View style={styles.fieldGap} />

                        <Text style={styles.label}>Email</Text>
                        <TextInput 
                            style={[
                                styles.input,
                                submitted && email.trim() === "" ? styles.inputError : null,
                            ]}
                            onChangeText={setEmail}
                            returnKeyType="done"
                        />

                        {formError ? <Text style={styles.formErrorText}>{formError}</Text> : null}

                        <Pressable style={styles.loginButton} onPress={handleCreateAccount}>
                            <Text style={styles.loginButtonText}>Create Account</Text>
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

dropdownButton: {
  height: 44,
  borderRadius: 22,
  backgroundColor: Colors.inputBubble,
  paddingHorizontal: 16,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},

dropdownText: {
  fontFamily: Fonts.interRegular,
  fontSize: FontSizes.body,
  color: Colors.black,
},

dropdownArrow: {
  fontSize: 20,
  color: Colors.black,
},

dropdownMenu: {
  backgroundColor: Colors.inputBubble,
  borderRadius: 16,
  marginTop: 6,
  overflow: "hidden",
},

dropdownOption: {
  paddingVertical: 12,
  paddingHorizontal: 16,
},

dropdownOptionText: {
  fontFamily: Fonts.interRegular,
  fontSize: FontSizes.body,
  color: Colors.black,
},

inputError: {
  borderWidth: 1,
  borderColor: "red",
},

formErrorText: {
  color: "red",
  fontSize: FontSizes.body,
  fontFamily: Fonts.interRegular,
  textAlign: "center",
  marginTop: 16,
},

errorText: {
  color: "red",
  fontSize: FontSizes.body,
  fontFamily: Fonts.interRegular,
  marginTop: 8,
},

});