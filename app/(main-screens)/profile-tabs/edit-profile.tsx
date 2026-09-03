import { Colors, Fonts } from "@/constants/theme";
import { deletePhoto, listPhotos, uploadPhoto } from "@/lib/photos";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const startingPhoto = require("@/assets/images/frat_boy_photo.jpeg");

type PhotoSlot = { id: string | null; uri: string; uploading: boolean } | null;

export default function EditProfile() {
    const [mainPhoto, setMainPhoto] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"edit" | "view">("edit");

    const [photos, setPhotos] = useState<PhotoSlot[]>([
        null,
        null,
        null,
        null,
    ]);

    const [message, setMessage] = useState(
        "Whats up Im Tyler and im looking for a date for formal next Thursday. I love country music and taking out the boat and drinking beer with th..."
    );

    useEffect(() => {
        listPhotos()
            .then((serverPhotos) => {
                setPhotos((currentPhotos) => {
                    const updatedPhotos = [...currentPhotos];
                    for (const photo of serverPhotos) {
                        if (photo.position >= 0 && photo.position < updatedPhotos.length) {
                            updatedPhotos[photo.position] = { id: photo.id, uri: photo.url, uploading: false };
                        }
                    }
                    return updatedPhotos;
                });
            })
            .catch(() => {
                // Not logged in yet, or the photos API is unavailable — the grid just starts empty.
            });
    }, []);

    async function pickMainPhoto() {
        const imageUri = await pickImage();

        if (imageUri) {
            setMainPhoto(imageUri);
        }
    }

    async function pickPhoto(index: number) {
        const asset = await pickImageAsset();

        if (!asset) {
            return;
        }

        setPhotos((currentPhotos) => {
            const updatedPhotos = [...currentPhotos];
            updatedPhotos[index] = { id: null, uri: asset.uri, uploading: true };
            return updatedPhotos;
        });

        try {
            const photo = await uploadPhoto(asset.uri, asset.mimeType, index);
            setPhotos((currentPhotos) => {
                const updatedPhotos = [...currentPhotos];
                updatedPhotos[index] = { id: photo.id, uri: photo.url, uploading: false };
                return updatedPhotos;
            });
        } catch (error) {
            setPhotos((currentPhotos) => {
                const updatedPhotos = [...currentPhotos];
                updatedPhotos[index] = null;
                return updatedPhotos;
            });
            Alert.alert("Upload failed", error instanceof Error ? error.message : "Please try again.");
        }
    }

    function removePhoto(index: number) {
        const photo = photos[index];

        setPhotos((currentPhotos) => {
            const updatedPhotos = [...currentPhotos];
            updatedPhotos[index] = null;
            return updatedPhotos;
        });

        if (photo?.id) {
            deletePhoto(photo.id).catch(() => {
                Alert.alert("Error", "Failed to delete photo. Please try again.");
            });
        }
    }

    function handleDone() {
        const hasPhoto = photos.some((photo) => photo !== null);

        if (!hasPhoto) {
            Alert.alert("Add photos", "Please upload at least one profile photo.");
            return;
        }

        router.push("/(main-screens)/profile");
    }

    return (
        <View style={styles.screen}>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <View style={styles.fixedHeader}>
                    <View style={styles.topRow}>
                        <Pressable onPress={() => router.back()}>
                            <Text style={styles.topButton}>Cancel</Text>
                        </Pressable>

                        <Text style={styles.name}>Tyler S.</Text>

                        <Pressable onPress={handleDone}>
                            <Text style={styles.topButton}>Done</Text>
                        </Pressable>
                    </View>

                    <View style={styles.tabRow}>
                        <Pressable
                            style={styles.tabButton}
                            onPress={() => setActiveTab("edit")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "edit" && styles.activeTabText,
                                ]}
                            >
                                Edit
                            </Text>

                            {activeTab === "edit" && <View style={styles.activeTabLine} />}
                        </Pressable>

                        <Text style={styles.tabDivider}></Text>

                        <Pressable
                            style={styles.tabButton}
                            onPress={() => setActiveTab("view")}
                        >
                            <Text
                                style={[
                                    styles.tabText,
                                    activeTab === "view" && styles.activeTabText,
                                ]}
                            >
                                View
                            </Text>

                            {activeTab === "view" && <View style={styles.activeTabLine} />}
                        </Pressable>
                    </View>
                </View>

                {activeTab === "edit" ? (
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.mainPhotoWrapper}>
                            <Image
                                source={mainPhoto ? { uri: mainPhoto } : startingPhoto}
                                style={styles.mainPhoto}
                            />

                            <Pressable
                                style={styles.editPhotoButton}
                                onPress={pickMainPhoto}
                            >
                                <Ionicons name="pencil" size={22} color="#3B5363" />
                            </Pressable>
                        </View>

                        <Text style={styles.sectionTitle}>My Photos</Text>

                        <View style={styles.photoGrid}>
                            {photos.map((photo, index) => (
                                <View key={index} style={styles.photoSlotWrapper}>
                                    <Pressable
                                        style={styles.photoSlot}
                                        onPress={() => pickPhoto(index)}
                                        disabled={photo?.uploading}
                                    >
                                        {photo ? (
                                            <>
                                                <Image source={{ uri: photo.uri }} style={styles.photo} />
                                                {photo.uploading && (
                                                    <View style={styles.uploadingOverlay}>
                                                        <ActivityIndicator color={Colors.white} />
                                                    </View>
                                                )}
                                            </>
                                        ) : (
                                            <View style={styles.emptyPhotoSlot}>
                                                <Ionicons name="add" size={42} color="#8A8A8A" />
                                                <Text style={styles.addPhotoText}>Add photo</Text>
                                            </View>
                                        )}
                                    </Pressable>

                                    {photo && !photo.uploading && (
                                        <Pressable
                                            style={styles.removePhotoButton}
                                            onPress={() => removePhoto(index)}
                                        >
                                            <Ionicons name="close" size={30} color="#3B5363" />
                                        </Pressable>
                                    )}
                                </View>
                            ))}
                        </View>

                        <Text style={styles.hintText}>Tap to edit, drag to reorder</Text>

                        <Text style={styles.sectionTitle}>My Message</Text>

                        <View style={styles.messageBubble}>
                            <TextInput
                                style={styles.messageInput}
                                value={message}
                                onChangeText={setMessage}
                                multiline
                                maxLength={180}
                                placeholder="Write a short message about yourself..."
                                placeholderTextColor="#888888"
                            />

                            <Pressable style={styles.editMessageButton}>
                                <Ionicons name="pencil" size={22} color="#3B5363" />
                            </Pressable>
                        </View>

                        <Text style={styles.sectionTitle}>My Info</Text>
                        <View style={styles.infoLine} />

                        <View style={styles.bottomSpacer} />
                    </ScrollView>
                ) : (
                    <View style={styles.viewPlaceholder}>
                        <Text style={styles.viewPlaceholderText}>Profile preview coming later</Text>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

async function pickImageAsset() {
    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.9,
    });

    if (result.canceled) {
        return null;
    }

    return result.assets[0];
}

async function pickImage() {
    const asset = await pickImageAsset();
    return asset?.uri ?? null;
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: Colors.white,
    },

    safeArea: {
        flex: 1,
        backgroundColor: Colors.white,
    },

    fixedHeader: {
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
        zIndex: 20,
    },

    header: {
        height: 230,
        paddingHorizontal: 30,
    },

    topRow: {
        height: 64,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 30,
    },

    topButton: {
        fontFamily: Fonts.interRegular,
        fontSize: 20,
        fontWeight: "700",
        color: Colors.gradientBlue,
    },

    name: {
        fontFamily: Fonts.interRegular,
        fontSize: 28,
        fontWeight: "700",
        color: Colors.black,
    },

    tabRow: {
        height: 62,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },

    tabButton: {
        width: 120,
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
    },

    tabText: {
        fontFamily: Fonts.interRegular,
        fontSize: 22,
        fontWeight: "700",
        color: "#D2D2D2",
    },

    activeTabText: {
        color: Colors.gradientBlue,
    },

    activeTabLine: {
        position: "absolute",
        bottom: 0,
        width: 96,
        height: 4,
        backgroundColor: "#7893B1",
    },

    tabDivider: {
        fontFamily: Fonts.interRegular,
        fontSize: 30,
        color: "#E0E0E0",
        marginHorizontal: 20,
    },

    mainPhotoWrapper: {
        alignSelf: "center",
        width: 132,
        height: 132,
        borderRadius: 66,
        backgroundColor: Colors.white,
        padding: 6,
        marginBottom: 34,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },

    mainPhoto: {
        width: "100%",
        height: "100%",
        borderRadius: 60,
    },

    editPhotoButton: {
        position: "absolute",
        right: -4,
        bottom: 4,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#EEF7EA",
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.22,
        shadowRadius: 4,
        elevation: 5,
    },

    scroll: {
        flex: 1,
        backgroundColor: Colors.white,
    },

    scrollContent: {
        paddingHorizontal: 30,
        paddingTop: 34,
    },

    sectionTitle: {
        fontFamily: Fonts.interRegular,
        fontSize: 24,
        color: "#8A8A8A",
        marginBottom: 12,
    },

    photoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    photoSlotWrapper: {
        width: "47%",
        aspectRatio: 0.82,
        marginBottom: 28,
    },

    photoSlot: {
        width: "100%",
        height: "100%",
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#EEF7EA",
    },

    photo: {
        width: "100%",
        height: "100%",
    },

    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        alignItems: "center",
        justifyContent: "center",
    },

    emptyPhotoSlot: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#D6D6D6",
        borderRadius: 14,
        borderStyle: "dashed",
    },

    addPhotoText: {
        fontFamily: Fonts.interRegular,
        fontSize: 15,
        color: "#8A8A8A",
        marginTop: 6,
    },

    removePhotoButton: {
        position: "absolute",
        top: -16,
        right: -14,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#EEF7EA",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 5,
    },

    hintText: {
        fontFamily: Fonts.interRegular,
        fontSize: 22,
        color: "#8A8A8A",
        marginTop: -8,
        marginBottom: 34,
    },

    messageBubble: {
        minHeight: 110,
        borderRadius: 55,
        backgroundColor: Colors.white,
        paddingHorizontal: 38,
        paddingVertical: 20,
        marginBottom: 36,

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.18,
        shadowRadius: 5,
        elevation: 4,
    },

    messageInput: {
        fontFamily: Fonts.instrumentSerifRegular,
        fontSize: 19,
        color: Colors.black,
        lineHeight: 25,
        padding: 0,
        minHeight: 70,
    },

    editMessageButton: {
        position: "absolute",
        right: 4,
        top: -10,
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#EEF7EA",
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.22,
        shadowRadius: 4,
        elevation: 5,
    },

    infoLine: {
        height: 1,
        backgroundColor: "#AFAFAF",
        marginTop: 4,
    },

    bottomSpacer: {
        height: 120,
    },

    viewPlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,
    },

    viewPlaceholderText: {
        fontFamily: Fonts.interRegular,
        fontSize: 20,
        color: "#888888",
    },
});