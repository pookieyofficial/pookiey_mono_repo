import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Pressable,
    Alert,
    Dimensions,
} from "react-native";
import Swiper from "react-native-deck-swiper";
import { BlurView } from "expo-blur";
import { Heart, Star, Plus } from "react-native-feather";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./ThemedText";
import { Colors } from "../constants/Colors";
import { useUserInteraction } from "../hooks/userInteraction";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export type CardItem = any;
export type SwipeAction = "left" | "right" | "up";

export interface SwipeDeckProps {
    data: CardItem[];
    onSwiped?: (item: CardItem, action: SwipeAction) => void;
    onMatch?: (match: any) => void;
    onCardPress?: (item: CardItem) => void;
}

export const SwipeDeck: React.FC<SwipeDeckProps> = ({
    data,
    onSwiped,
    onCardPress,
}) => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { likeUser, dislikeUser, superlikeUser } = useUserInteraction();
    const swiperRef = React.useRef<any>(null);
    const [cardIndex, setCardIndex] = React.useState(0);

    const calculateAge = (dateOfBirth: Date) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        return today.getFullYear() - birthDate.getFullYear();
    };

    const handleInteraction = async (item: CardItem, action: SwipeAction) => {
        try {
            const userId = item?.user_id;
            if (!userId) return;

            let response: any;
            if (action === "right") response = await likeUser(userId);
            else if (action === "left") response = await dislikeUser(userId);
            else if (action === "up") response = await superlikeUser(userId);

            if (response?.success) {
                if (response.isMatch && response.match) {
                    router.replace({
                        pathname: "/matchingScreen",
                        params: {
                            match: JSON.stringify(response.match),
                            user1: JSON.stringify(response.user1 as any),
                            user2: JSON.stringify(response.user2 as any),
                            userName:
                                response.user2?.profile?.firstName ||
                                response.user2?.displayName,
                            userAvatar:
                                response.user2?.photoURL ||
                                response.user2?.profile?.photos?.[0]?.url,
                        },
                    });
                }
            }
            if (!response?.success) {
                if (response?.showPriceModal) {
                    router.push("/(home)/pricePlans");
                    return;
                }
            }
        } catch (err) {
            Alert.alert("Error", "Something went wrong");
            return;
        }
    };

    const renderCard = (item: CardItem) => {
        if (!item) return null;
        const age = calculateAge(item?.profile?.dateOfBirth);

        return (
            <View style={styles.card}>
                <Image
                    source={
                        item?.profile?.photos?.[0]?.url
                            ? { uri: item.profile.photos[0].url }
                            : require("@/assets/images/loginPageImage.png")
                    }
                    style={styles.image}
                    resizeMode="cover"
                />

                <BlurView intensity={80} tint="dark" style={styles.gradient} />

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onCardPress?.(item)}
                >
                    <View style={styles.footer}>
                        <ThemedText type="bold" style={styles.name}>
                            {item?.profile?.firstName} {item?.profile?.lastName}, {age}
                        </ThemedText>

                        {item?.profile?.occupation && (
                            <ThemedText type="default" style={styles.job}>
                                {item.profile.occupation}
                            </ThemedText>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const hasCards = Array.isArray(data) && data.length > 0;

    if (!hasCards) {
        return (
            <View style={[styles.container, styles.emptyStateWrapper]}>
                <View style={styles.emptyCard}>
                    <View style={styles.emptyBadge}>
                        <Heart
                            width={32}
                            height={32}
                            color={Colors.primaryBackgroundColor}
                            fill={`${Colors.primaryBackgroundColor}15`}
                        />
                    </View>
                    <ThemedText type="title" style={styles.emptyTitle}>
                        No nearby matches... yet
                    </ThemedText>
                    <ThemedText type="default" style={styles.emptySubtitle}>
                        We couldn't find anyone around you right now. Come back again in some time.
                    </ThemedText>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Swiper
                ref={swiperRef}
                cards={data}
                renderCard={(item: CardItem) => renderCard(item)}
                keyExtractor={(card: CardItem) =>
                    String(card?.user_id ?? card?.id ?? card?._id ?? '')
                }
                cardIndex={cardIndex}
                onSwiped={(index) => {
                    setCardIndex(index + 1);
                }}
                onSwipedLeft={(index) => {
                    const card = data?.[index];
                    if (card) {
                        handleInteraction(card, 'left');
                        onSwiped?.(card, 'left');
                    }
                }}
                onSwipedRight={(index) => {
                    const card = data?.[index];
                    if (card) {
                        handleInteraction(card, 'right');
                        onSwiped?.(card, 'right');
                    }
                }}
                onSwipedTop={(index) => {
                    const card = data?.[index];
                    if (card) {
                        handleInteraction(card, 'up');
                        onSwiped?.(card, 'up');
                    }
                }}
                stackSize={3}
                useViewOverflow={false}
                animateCardOpacity
                backgroundColor="transparent"
                marginBottom={insets.bottom + 120}
            />
            {/* Bottom buttons */}
            <View style={[styles.bottomSection, { bottom: Math.max(insets.bottom + 16, 12) }]}>
                <ActionRow
                    onLeft={() => swiperRef.current?.swipeLeft()}
                    onRight={() => swiperRef.current?.swipeRight()}
                    onUp={() => swiperRef.current?.swipeTop()}
                />
            </View>
        </View>
    );
};

const ActionRow: React.FC<{
    onLeft: () => void;
    onRight: () => void;
    onUp: () => void;
}> = ({ onLeft, onRight, onUp }) => {
    const accent = Colors.primaryBackgroundColor || "#E53E3E";

    return (
        <View style={styles.actions}>
            <Pressable onPress={onLeft} style={[styles.actionBtn, styles.shadowSm]}>
                <Plus
                    style={{ transform: [{ rotate: "45deg" }] }}
                    strokeWidth={4}
                    width={25}
                    height={25}
                    color="orange"
                />
            </Pressable>

            <Pressable
                onPress={onRight}
                style={[styles.actionBtnLg, styles.shadowLg, { backgroundColor: accent }]}
            >
                <Heart fill={"white"} width={40} height={40} color="white" />
            </Pressable>

            <Pressable onPress={onUp} style={[styles.actionBtn, styles.shadowSm]}>
                <Star
                    fill={Colors.primaryBackgroundColor}
                    strokeWidth={4}
                    width={25}
                    height={25}
                    color={Colors.primaryBackgroundColor}
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, position: "relative" },
    card: {
        width: SCREEN_WIDTH * 0.85,
        height: SCREEN_HEIGHT * 0.55,
        borderRadius: 18,
        overflow: "hidden",
        alignSelf: "center",
        backgroundColor: "white",
    },
    image: { width: "100%", height: "100%" },
    gradient: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 80,
    },
    footer: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
    },
    name: { color: Colors.textColor, fontSize: 22 },
    job: { color: Colors.textColor, marginTop: 4 },

    bottomSection: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 120,
        alignItems: "center",
        justifyContent: "center",
    },
    actions: {
        width: "100%",
        maxWidth: 300,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    actionBtn: {
        width: 60,
        height: 60,
        borderRadius: 32,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center",
    },
    actionBtnLg: {
        width: 90,
        height: 90,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    shadowSm: {
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 10,
    },
    shadowLg: {
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 8 },
        elevation: 10,
    },
    endContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    endText: {
        color: Colors.titleColor,
        fontSize: 20,
        fontFamily: "HellixBold",
        textAlign: "center",
    },
    endSubText: {
        marginTop: 8,
        color: Colors.text.secondary,
        textAlign: "center",
        lineHeight: 20,
    },
    emptyStateWrapper: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    emptyCard: {
        width: SCREEN_WIDTH * 0.85,
        paddingVertical: 36,
        paddingHorizontal: 24,
        borderRadius: 24,
        backgroundColor: Colors.primary.white,
        borderWidth: 1,
        borderColor: Colors.text.light,
        shadowColor: Colors.primaryBackgroundColor,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 6,
        alignItems: "center",
        gap: 12,
    },
    emptyBadge: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.secondaryBackgroundColor,
        alignItems: "center",
        justifyContent: "center",
    },
    emptyTitle: {
        color: Colors.titleColor,
        textAlign: "center",
    },
    emptySubtitle: {
        color: Colors.text.secondary,
        textAlign: "center",
        lineHeight: 20,
    },
});

export default SwipeDeck;