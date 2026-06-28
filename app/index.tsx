import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  return (
    <LinearGradient style={styles.container} colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}>
      <View style={styles.content}>
        <Text style={styles.title}>Hey, Dater</Text>

        <Text style={styles.label}>Enter your school email below to get started</Text>

        <TextInput style={styles.input} placeholder=""></TextInput>

        <Text style={styles.login}>
          Or <Text style={styles.loginLink}>log in</Text>
        </Text>
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
    marginTop: 360,
  },

  title: {
    fontSize: FontSizes.title,
    color: Colors.black,
    fontFamily: Fonts.instrumentSerifRegular,
    textAlign: 'center',
    marginBottom: 24,
  },

  label: {
    fontSize: FontSizes.body,
    color: Colors.black,
    fontFamily: Fonts.interRegular,
    textAlign: 'center',
    marginBottom: 8
  },

  input: {
    width: "100%",
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.inputBubble,
    paddingHorizontal: 16,
    fontFamily: Fonts.interRegular,
    fontSize: FontSizes.body,
    color: Colors.black
  },

  login: {
    fontSize: FontSizes.body,
    color: Colors.black,
    fontFamily: Fonts.interRegular,
    textAlign: 'center',
    marginTop: 8
  },

  loginLink: {
    textDecorationLine: "underline",
  },

  buttonStyle: {
    height: 150
  }
});


