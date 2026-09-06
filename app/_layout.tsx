import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}