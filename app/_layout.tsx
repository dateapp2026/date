import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "react-native-reanimated";

export default function RootLayout() {
  const [loaded] = useFonts({
    InterRegular: require("../assets/fonts/inter.regular.ttf"),
    InterLight: require("../assets/fonts/inter.24pt-light.ttf"),
    InstrumentSerifRegular: require("../assets/fonts/instrumentserif-regular.ttf"),
    InstrumentSerifItalic: require("../assets/fonts/instrumentserif-italic.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}