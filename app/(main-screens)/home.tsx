import { Colors, Fonts, FontSizes } from "@/constants/theme";
import { Candidate, getDiscoverCandidates, swipe } from "@/lib/discover";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SWIPE_THRESHOLD = 120;
const ROTATION_RANGE = 12;

type SwipeCardHandle = {
    swipe: (liked: boolean) => void;
};

export default function Home() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [index, setIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const topCardRef = useRef<SwipeCardHandle>(null);

    const loadCandidates = useCallback(() => {
        setLoading(true);
        setError(null);
        getDiscoverCandidates()
            .then((result) => {
                setCandidates(result);
                setIndex(0);
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : "Failed to load profiles.");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        loadCandidates();
    }, [loadCandidates]);

    const handleSwiped = useCallback((candidate: Candidate, liked: boolean) => {
        setIndex((current) => current + 1);
        swipe(candidate.id, liked)
            .then((result) => {
                if (result.matched) {
                    Alert.alert("It's a match!", `You and ${candidate.first_name} liked each other.`);
                }
            })
            .catch(() => {
                // Non-fatal — the card has already advanced, the swipe just wasn't recorded.
            });
    }, []);

    const visibleCandidates = candidates.slice(index, index + 2);

    return (
        <LinearGradient
            style={styles.gradient}
            colors={[Colors.gradientCream, Colors.gradientGreen, Colors.gradientBlue]}
        >
            <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
                <Text style={styles.title}>Date App</Text>

                <View style={styles.stack}>
                    {loading ? (
                        <ActivityIndicator color={Colors.black} size="large" />
                    ) : error ? (
                        <EmptyState message={error} actionLabel="Try again" onAction={loadCandidates} />
                    ) : visibleCandidates.length === 0 ? (
                        <EmptyState
                            message="No more profiles right now."
                            actionLabel="Refresh"
                            onAction={loadCandidates}
                        />
                    ) : (
                        [...visibleCandidates].reverse().map((candidate, reversedI) => {
                            const isTop = reversedI === visibleCandidates.length - 1;
                            if (isTop) {
                                return (
                                    <SwipeCard
                                        key={candidate.id}
                                        ref={topCardRef}
                                        candidate={candidate}
                                        onSwiped={(liked) => handleSwiped(candidate, liked)}
                                    />
                                );
                            }
                            return (
                                <View key={candidate.id} style={[styles.card, styles.cardBehind]}>
                                    <CardContent candidate={candidate} photoIndex={0} onTapSide={() => {}} />
                                </View>
                            );
                        })
                    )}
                </View>

                {!loading && !error && visibleCandidates.length > 0 && (
                    <View style={styles.actionRow}>
                        <Pressable
                            style={[styles.actionButton, styles.passButton]}
                            onPress={() => topCardRef.current?.swipe(false)}
                        >
                            <Ionicons name="close" size={32} color="#E0575B" />
                        </Pressable>
                        <Pressable
                            style={[styles.actionButton, styles.likeButton]}
                            onPress={() => topCardRef.current?.swipe(true)}
                        >
                            <Ionicons name="heart" size={30} color="#4CAF6D" />
                        </Pressable>
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

function EmptyState({
    message,
    actionLabel,
    onAction,
}: {
    message: string;
    actionLabel: string;
    onAction: () => void;
}) {
    return (
        <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{message}</Text>
            <Pressable style={styles.retryButton} onPress={onAction}>
                <Text style={styles.retryText}>{actionLabel}</Text>
            </Pressable>
        </View>
    );
}

const SwipeCard = forwardRef<SwipeCardHandle, { candidate: Candidate; onSwiped: (liked: boolean) => void }>(
    function SwipeCard({ candidate, onSwiped }, ref) {
        const { width } = useWindowDimensions();
        const translateX = useSharedValue(0);
        const translateY = useSharedValue(0);
        const [photoIndex, setPhotoIndex] = useState(0);

        const animateOff = useCallback(
            (liked: boolean) => {
                const targetX = liked ? width * 1.5 : -width * 1.5;
                translateX.value = withTiming(targetX, { duration: 220 }, (finished) => {
                    if (finished) {
                        runOnJS(onSwiped)(liked);
                    }
                });
            },
            [onSwiped, translateX, width]
        );

        useImperativeHandle(ref, () => ({
            swipe: animateOff,
        }));

        const panGesture = Gesture.Pan()
            .onUpdate((event) => {
                translateX.value = event.translationX;
                translateY.value = event.translationY;
            })
            .onEnd((event) => {
                if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                    const liked = event.translationX > 0;
                    const targetX = liked ? width * 1.5 : -width * 1.5;
                    translateX.value = withTiming(targetX, { duration: 200 }, (finished) => {
                        if (finished) {
                            runOnJS(onSwiped)(liked);
                        }
                    });
                } else {
                    translateX.value = withSpring(0);
                    translateY.value = withSpring(0);
                }
            });

        const cardStyle = useAnimatedStyle(() => {
            const rotate = interpolate(translateX.value, [-width, 0, width], [-ROTATION_RANGE, 0, ROTATION_RANGE]);
            return {
                transform: [
                    { translateX: translateX.value },
                    { translateY: translateY.value },
                    { rotate: `${rotate}deg` },
                ],
            };
        });

        const likeOpacity = useAnimatedStyle(() => ({
            opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], "clamp"),
        }));
        const passOpacity = useAnimatedStyle(() => ({
            opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], "clamp"),
        }));

        function handleTapSide(side: "left" | "right") {
            setPhotoIndex((current) => {
                const max = candidate.photos.length - 1;
                if (max < 0) return 0;
                if (side === "right") return Math.min(current + 1, max);
                return Math.max(current - 1, 0);
            });
        }

        return (
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.card, cardStyle]}>
                    <CardContent candidate={candidate} photoIndex={photoIndex} onTapSide={handleTapSide} />

                    <Animated.View style={[styles.badge, styles.likeBadge, likeOpacity]}>
                        <Text style={styles.badgeText}>LIKE</Text>
                    </Animated.View>
                    <Animated.View style={[styles.badge, styles.passBadge, passOpacity]}>
                        <Text style={styles.badgeText}>NOPE</Text>
                    </Animated.View>
                </Animated.View>
            </GestureDetector>
        );
    }
);

function CardContent({
    candidate,
    photoIndex,
    onTapSide,
}: {
    candidate: Candidate;
    photoIndex: number;
    onTapSide: (side: "left" | "right") => void;
}) {
    const photo = candidate.photos[photoIndex];

    return (
        <>
            {photo ? (
                <Image source={{ uri: photo.url }} style={styles.photo} />
            ) : (
                <View style={styles.photoPlaceholder}>
                    <Ionicons name="person" size={72} color="#B7C4B1" />
                </View>
            )}

            {candidate.photos.length > 1 && (
                <View style={styles.dotsRow}>
                    {candidate.photos.map((p, i) => (
                        <View key={p.id} style={[styles.dot, i === photoIndex && styles.dotActive]} />
                    ))}
                </View>
            )}

            <Pressable style={styles.tapZoneLeft} onPress={() => onTapSide("left")} />
            <Pressable style={styles.tapZoneRight} onPress={() => onTapSide("right")} />

            <LinearGradient
                colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.75)"]}
                style={styles.infoScrim}
            >
                <Text style={styles.name}>
                    {candidate.first_name}, {candidate.age}
                </Text>
                {candidate.bio && (
                    <Text style={styles.bio} numberOfLines={3}>
                        {candidate.bio}
                    </Text>
                )}
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },

    container: {
        flex: 1,
    },

    title: {
        fontSize: FontSizes.heading,
        color: Colors.black,
        fontFamily: Fonts.instrumentSerifRegular,
        textAlign: "center",
        marginTop: 12,
        marginBottom: 8,
    },

    stack: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },

    card: {
        position: "absolute",
        width: "100%",
        aspectRatio: 0.68,
        borderRadius: 28,
        overflow: "hidden",
        backgroundColor: "#DCE8D6",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 8,
    },

    cardBehind: {
        transform: [{ scale: 0.96 }, { translateY: 12 }],
        opacity: 0.85,
    },

    photo: {
        width: "100%",
        height: "100%",
    },

    photoPlaceholder: {
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#DCE8D6",
    },

    tapZoneLeft: {
        position: "absolute",
        top: 0,
        bottom: 90,
        left: 0,
        width: "40%",
    },

    tapZoneRight: {
        position: "absolute",
        top: 0,
        bottom: 90,
        right: 0,
        width: "40%",
    },

    dotsRow: {
        position: "absolute",
        top: 14,
        left: 14,
        right: 14,
        flexDirection: "row",
        gap: 6,
    },

    dot: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        backgroundColor: "rgba(255,255,255,0.4)",
    },

    dotActive: {
        backgroundColor: Colors.white,
    },

    infoScrim: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        paddingHorizontal: 22,
        paddingTop: 60,
        paddingBottom: 26,
    },

    name: {
        fontFamily: Fonts.instrumentSerifRegular,
        fontSize: 30,
        color: Colors.white,
    },

    bio: {
        fontFamily: Fonts.interRegular,
        fontSize: 15,
        color: Colors.white,
        marginTop: 6,
        lineHeight: 20,
    },

    badge: {
        position: "absolute",
        top: 40,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 3,
    },

    likeBadge: {
        left: 24,
        borderColor: "#4CAF6D",
        transform: [{ rotate: "-18deg" }],
    },

    passBadge: {
        right: 24,
        borderColor: "#E0575B",
        transform: [{ rotate: "18deg" }],
    },

    badgeText: {
        fontFamily: Fonts.interRegular,
        fontSize: 22,
        fontWeight: "700",
        color: Colors.white,
    },

    actionRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 28,
        paddingVertical: 20,
        paddingBottom: 130,
    },

    actionButton: {
        width: 62,
        height: 62,
        borderRadius: 31,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },

    passButton: {},

    likeButton: {},

    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 30,
    },

    emptyText: {
        fontFamily: Fonts.instrumentSerifItalic,
        fontSize: FontSizes.heading,
        color: Colors.black,
        textAlign: "center",
        marginBottom: 24,
    },

    retryButton: {
        backgroundColor: Colors.white,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },

    retryText: {
        fontFamily: Fonts.interRegular,
        fontSize: 16,
        color: Colors.black,
    },
});
