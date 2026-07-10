import { SignupProvider } from "@/contexts/SignupContext";
import { Stack } from "expo-router";

export default function LoginSignupLayout() {
  return (
    <SignupProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SignupProvider>
  );
}
