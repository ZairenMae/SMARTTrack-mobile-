import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    BackHandler,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Modal from "../modal/Modal";

interface CardReportProps {
    className?: string;
    bannerSrc?: string;
    title?: string;
    progressHeader?: string;
    progressValue?: number;
    link: string;
}

const CardReport: React.FC<CardReportProps> = ({
    bannerSrc = "https://example.com/assets/images/banner/banner-adventure_large.webp",
    title = "Zairen",
    progressHeader = "Title",
    progressValue = 1,
    link = "Home", // example link to a screen
}) => {
    const navigation = useNavigation();
    const [modalVisible, setModalVisible] = useState(false);

    const handlePress = () => {
        console.log("Pressed!");
        setModalVisible(true);
    };

    const buttons = [
        {
            text: "Test",
            action: () => {
                console.log("Deleted!");
                setModalVisible(false);
            },
            color: "red",
        },
        {
            text: "Cancel",
            action: () => setModalVisible(false),
            color: "gray",
        },
    ];

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.card} onPress={handlePress}>
                <View style={styles.titleContainer}>
                    <Text style={styles.cardTitle}>{title}</Text>
                </View>
                <View style={styles.bannerContainer}>
                    <Image
                        source={{ uri: bannerSrc }}
                        style={styles.bannerImage}
                        resizeMode="cover"
                    />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.progressHeader}>{progressHeader}</Text>
                    <Text style={styles.progressValue}>{progressValue}</Text>
                </View>
            </TouchableOpacity>
            <Modal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onPress={handlePress}
                title={"test"}
                message={"test"}
                buttons={buttons}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    titleContainer: {
        width: "100%",
        alignItems: "center",
        paddingTop: 20,
    },
    cardTitle: {
        alignItems: "center",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    card: {
        height: 270,
        width: 220,
        borderWidth: 1,
        borderColor: "#666666",
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        overflow: "hidden",
        transform: [{ scale: 1 }],
    },
    bannerContainer: {
        height: "40%",
        width: "100%",
        position: "relative",
    },
    bannerImage: {
        height: "100%",
        width: "100%",
    },
    infoContainer: {
        padding: 10,
        alignItems: "center",
        backgroundColor: "rgb(138, 37, 44)",
    },
    progressHeader: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
    },
    progressValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "rgb(245, 199, 34)",
    },
});

export default CardReport;
