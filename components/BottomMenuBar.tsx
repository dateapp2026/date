import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";

const tabInfo = {
  home: {
    label: "Home",
    icon: "home-outline",
  },
  likes: {
    label: "Likes",
    icon: "heart-outline",
  },
  chats: {
    label: "Chats",
    icon: "chatbubbles-outline",
  },
  profile: {
    label: "Profile",
    icon: "person-circle-outline",
  },
} as const;

type TabName = keyof typeof tabInfo;

export default function BottomMenuBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const routeName = route.name as TabName;
        const info = tabInfo[routeName];

        if (!info) {
          return null;
        }

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable key={route.key} style={styles.tabItem} onPress={onPress}>
            <Ionicons
              name={info.icon}
              size={routeName === "profile" ? 32 : 30}
              color={isFocused ? Colors.black : "#3F5360"}
            />

            <Text style={[styles.tabText, isFocused && styles.activeTabText]}>
              {info.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 98,
    backgroundColor: "rgba(245, 252, 238, 1)",
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 12,
    paddingHorizontal: 12,
  },

  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flex: 1,
  },

  tabText: {
    fontSize: 16,
    color: "#3F5360",
    fontFamily: Fonts.interRegular,
  },

  activeTabText: {
    color: Colors.black,
  },
});