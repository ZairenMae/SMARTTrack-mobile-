import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

type CardUserProps = {
    name?: string;
    studentID?: string;
    timeIn?: Date;
    timeOut?: Date;
};

const CardUser = ({ name, studentID, timeIn, timeOut }: CardUserProps) => {
    const formattedTimeIn = timeIn ? timeIn.toLocaleTimeString() : "";
    const formattedTimeOut = timeOut ? timeOut.toLocaleTimeString() : "";

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
                        <Text style={styles.title}>Student: {name}</Text>
                        <Text style={styles.subtitle}>{studentID}</Text>
                        <Text style={styles.subtitle}>{formattedTimeIn}</Text>
                        <Text style={styles.subtitle}>{formattedTimeOut}</Text>
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
        height: 70,
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

export default CardUser;
