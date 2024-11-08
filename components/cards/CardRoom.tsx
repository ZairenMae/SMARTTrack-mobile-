import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

type CardRoomProps = {
    name?: string;
    section?: string;
    time?: string;
};

const CardRoom = ({ name, section, time }: CardRoomProps) => {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                <View style={styles.bannerContainer}>
                    <View style={styles.banner}>
                        <Image
                            //source={{ uri: imageUri }}
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.title}>{name}</Text>
                        <Text style={styles.subtitle}>{section}</Text>
                        <Text style={styles.subtitle}>{time}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        width: "100%",
    },
    card: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#666666",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
        position: "relative",
        padding: 10,
    },
    bannerContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    banner: {
        backgroundColor: "#000",
        borderRadius: 5,
        height: 100,
        aspectRatio: 1,
        overflow: "hidden",
        margin: 8,
    },
    bannerImage: {
        width: "100%",
        height: "100%",
    },
    details: {
        flexDirection: "column",
        alignItems: "flex-start",
    },
    title: {
        fontWeight: "bold",
        fontSize: 24,
    },
    subtitle: {
        fontSize: 16,
        color: "#aaa",
    },
});

export default CardRoom;
