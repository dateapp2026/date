import { Colors, Fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Profile() {
    return (
    <LinearGradient
        style={styles.container}
        colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}
    >
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <View style={styles.content}>
                <Text style={styles.name}>Tyler S.</Text>

                <View style={styles.profileImageShadow}>
                    <Image
                        source={require("@/assets/images/frat_boy_photo.jpeg")}
                        style={styles.profileImage}
                    />
                </View>
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>PROFILE</Text>

                    <MenuRow 
                        icon="create-outline" 
                        label="Edit Profile" 
                        onPress={()=> router.push("/(main-screens)/profile-tabs/edit-profile")} 
                    />
                    <Divider />

                    <MenuRow 
                        icon="settings-outline" 
                        label="Settings" 
                        onPress={()=> router.push("/(main-screens)/profile-tabs/settings")}
                    />

                    <Text style={styles.sectionTitle}>SUPPORT</Text>

                    <MenuRow 
                        icon="shield-checkmark-outline" 
                        label="Safety" 
                        onPress={()=> router.push("/(main-screens)/profile-tabs/safety")}
                    />
                    <Divider />

                    <MenuRow 
                        icon="information-circle-outline" 
                        label="Help & community guidelines" 
                        onPress={()=> router.push("/(main-screens)/profile-tabs/help")}
                    />
                </View>
            </View>
        </SafeAreaView>
    </LinearGradient>
    );
}

function MenuRow(
    { icon, label, onPress }: 
    { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: ()=> void }) 
    {
    return (
        <Pressable style={styles.menuRow} onPress={onPress}>
            <Ionicons name={icon} size={28} color="#555555" />

            <Text style={styles.menuText}>{label}</Text>

            <Ionicons name="chevron-forward" size={28} color="#777777" />
        </Pressable>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    content: {
        flex: 1,
        alignItems: "center",
        paddingTop: 25,
        paddingHorizontal: 24,
    },

    name: {
        fontFamily: Fonts.instrumentSerifRegular,
        fontSize: 40,
        color: Colors.black,
        marginBottom: 22,
    },

profileImageShadow: {
    width: 185,
    height: 185,
    borderRadius: 92.5,
    marginBottom: 38,

    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,

    elevation: 8,
},

profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 92.5,
},

    card: {
        width: "100%",
        backgroundColor: Colors.white,
        borderRadius: 38,
        paddingHorizontal: 26,
        paddingTop: 30,
        paddingBottom: 34,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 5,
    },

    sectionTitle: {
        fontFamily: Fonts.interRegular,
        fontSize: 16,
        color: "#888888",
        marginBottom: 18,
        marginTop: 18,
    },

    supportTitle: {
        marginTop: 28,
    },

    menuRow: {
        flexDirection: "row",
        alignItems: "center",
        height: 50,
    },

    menuText: {
        flex: 1,
        fontFamily: Fonts.interRegular,
        fontSize: 16,
        color: Colors.black,
        marginLeft: 20,
        
    },

    divider: {
        height: 1,
        backgroundColor: "#BDBDBD",
        marginVertical: 8,
    },
});