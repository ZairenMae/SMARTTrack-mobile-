import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";

type CardRoomProps = {
    name?: string;
    section?: string;
    startTime?: string;
    endTime?: string;
    roomCode?: string;
};

const CardRoom = ({ name, section, startTime, endTime, roomCode }: CardRoomProps) => {
    const [showCode, setShowCode] = useState(false);

    const toggleCodeVisibility = () => {
        setShowCode((prev) => !prev);
    };

    return (
        <TouchableOpacity onPress={toggleCodeVisibility} style={styles.cardContainer}>
            <View style={styles.card}>
                <View style={styles.bannerContainer}>
                    <View style={styles.banner}>
                        <Image
                            // source={{ uri: imageUri }} // Uncomment and use a valid image URI here
                            style={styles.bannerImage}
                            resizeMode="cover"
                        />
                    </View>
                    <View style={styles.details}>
                        <Text style={styles.title}>{name}</Text>
                        <Text style={styles.subtitle}>{section}</Text>
                        <Text style={styles.subtitle}>{`Start: ${startTime}`}</Text>
                        <Text style={styles.subtitle}>{`End: ${endTime}`}</Text>
                        {showCode && (
                            <Text style={styles.roomCode}>{`Code: ${roomCode}`}</Text>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
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
    roomCode: {
        marginTop: 5,
        fontWeight: "bold",
        fontSize: 16,
        color: "#333",
    },
});

export default CardRoom;
