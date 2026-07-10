import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// expo-secure-store doesn't support web (iOS/Android/tvOS/Expo Go only), so this
// falls back to localStorage there and keeps the OS keychain/keystore on native.
export async function setToken(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getToken(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function clearToken(key: string): Promise<void> {
  if (Platform.OS === "web") {
    window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
