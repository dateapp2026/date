import BottomMenuBar from "@/components/BottomMenuBar";
import { Tabs } from "expo-router";

export default function MainScreensLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomMenuBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "none",
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="likes" />
      <Tabs.Screen name="chats" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}