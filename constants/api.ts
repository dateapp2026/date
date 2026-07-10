import { Platform } from "react-native";

// Android emulators can't reach the host machine via "localhost" — they need
// the special 10.0.2.2 alias. iOS simulator and web both use localhost fine.
const DEFAULT_API_URL = Platform.select({
  android: "http://10.0.2.2:8080",
  default: "http://localhost:8080",
});

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? DEFAULT_API_URL;
