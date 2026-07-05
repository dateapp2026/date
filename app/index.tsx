import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  return (
    <LinearGradient style={styles.container} colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}>
      <View style={styles.content}>
        <Text style={styles.title}>Hey, Dater</Text>

        <Text style={styles.tagline}>Welcome to Date, the easiest way to find a date for Greek life events</Text>

        <Text style={styles.label}>Enter your school email below to get started</Text>

        <TextInput
          style={styles.input}
          placeholder=""
          returnKeyType="done"
          onSubmitEditing={() => router.push("/create-account")}
        />

        <View style={styles.loginRow}>
          <Text style={styles.login}>Or </Text>

          <Pressable onPress={() => router.push("/login")}>
            <Text style={[styles.login, styles.loginLink]}>log in</Text>
          </Pressable>
        </View>
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
    marginTop: 340,
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
});

// import { Colors, Fonts, FontSizes } from "@/constants/theme";
// import { LinearGradient } from "expo-linear-gradient";
// import { router } from "expo-router";
// import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// export default function Index() {
//   return (
//     <LinearGradient style={styles.container} colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}>
//       <View style={styles.content}>
//         <Text style={styles.title}>Hey, Dater</Text>
//         <View style={styles.fieldGap} />

//         <Text style={styles.tagline}>Welcome to Date, the easiest way to find a date for Greek life events</Text>

//         <Text style={styles.label}>Enter your school email below to get started</Text>

//         <TextInput
//           style={styles.input}
//           placeholder=""
//           returnKeyType="done"
//           onSubmitEditing={() => router.push("/create-account")}
//         />

//         <View style={styles.loginRow}>
//           <Text style={styles.login}>Or </Text>

//           <Pressable onPress={() => router.push("/login")}>
//             <Text style={[styles.login, styles.loginLink]}>log in</Text>
//           </Pressable>
//         </View>
//       </View>
//     </LinearGradient>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },

//   content: {
//     width: "100%",
//     paddingHorizontal: 28,
//     marginTop: 360,
//   },

//   title: {
//     fontSize: FontSizes.title,
//     color: Colors.black,
//     fontFamily: Fonts.instrumentSerifRegular,
//     textAlign: 'center',
//     marginBottom: 24,
//   },

//   tagline: {
//     fontSize: FontSizes.heading,
//     color: Colors.black,
//     fontFamily: Fonts.instrumentSerifRegular,
//     textAlign: 'center',
//     marginBottom: 24,

//   },

//   label: {
//     fontSize: FontSizes.body,
//     color: Colors.black,
//     fontFamily: Fonts.interRegular,
//     textAlign: 'center',
//     marginBottom: 8
//   },

//   input: {
//     width: "100%",
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: Colors.inputBubble,
//     paddingHorizontal: 16,
//     fontFamily: Fonts.interRegular,
//     fontSize: FontSizes.body,
//     color: Colors.black
//   },

//   loginRow: {
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//   },

//   login: {
//     fontSize: FontSizes.body,
//     color: Colors.black,
//     fontFamily: Fonts.interRegular,
//     textAlign: 'center',
//     marginTop: 8
//   },

//   loginLink: {
//     textDecorationLine: "underline",
//   },

//   fieldGap: {
//     height: 14,
//   },
// });


