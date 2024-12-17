import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Alert,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { deleteDoc, doc } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import * as Clipboard from "expo-clipboard";

type CardRoomProps = {
    id: string;
    name?: string;
    section?: string;
    startTime?: number;
    endTime?: number;
    roomCode: string;
    userType: string; // Added userType
};

const CardRoom = ({
    id,
    name,
    section,
    startTime,
    endTime,
    roomCode,
    userType,
}: CardRoomProps) => {
    const [qrValue, setQrValue] = useState("");
    const [QRVisible, setQRVisible] = useState(false);

    const openQRCodeModal = () => {
        setQrValue(roomCode);
        setQRVisible(true);
    };

    const closeQRCodeModal = () => {
        setQRVisible(false);
        setQrValue("");
    };

    const deleteRoom = async (roomId: string) => {
        try {
            await deleteDoc(doc(FIREBASE_DB, "rooms", roomId));
            console.log("Room deleted from Firestore:", roomId);
        } catch (error) {
            console.error("Error deleting room:", error);
            Alert.alert("Error", "Failed to delete the room. Please try again.");
        }
    };

    const handleCopyToClipboard = (text: string) => {
        Clipboard.setStringAsync(text);
        Alert.alert("Copied", "Room code copied to clipboard!");
    };

    const formatTime = (time?: number) => {
        if (!time) return "N/A";
        return new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const formattedStartTime = formatTime(startTime);
    const formattedEndTime = formatTime(endTime);

    return (
        <View style={styles.card}>
            <View style={styles.bannerContainer}>
                <View style={styles.banner}>
                    <Image style={styles.bannerImage} resizeMode="cover" />
                </View>
                <View style={styles.details}>
                    <View style={styles.header}>
                            <Text
                                style={styles.title}
                                numberOfLines={1}
                                ellipsizeMode="tail"
                            >
                                {name || "Untitled"}
                            </Text>
                            {userType === "teacher" && ( 
                                <TouchableOpacity
                                    onPress={() => deleteRoom(id)}
                                    style={styles.deleteButton}
                                >
                                    <Text style={styles.deleteButtonText}>X</Text>
                                </TouchableOpacity>
                            )}
                    </View>
                    <Text style={styles.subtitle}>
                        {section || "No Section"}
                    </Text>
                    <Text
                        style={styles.subtitle}
                    >{`Start: ${formattedStartTime}`}</Text>
                    <Text
                        style={styles.subtitle}
                    >{`End: ${formattedEndTime}`}</Text>
                </View>
            </View>

            {/* QR Code Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={QRVisible}
                onRequestClose={closeQRCodeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContentQR}>
                        {qrValue ? (
                            <>
                                <Text style={styles.roomCodeText}>
                                    Room Code: {qrValue}
                                </Text>
                                <QRCode value={qrValue} size={200} />
                            </>
                        ) : (
                            <Text style={styles.roomCodeText}>Loading...</Text>
                        )}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={closeQRCodeModal}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => handleCopyToClipboard(qrValue)}
                        >
                            <Text style={styles.closeButtonText}>Copy</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
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
        alignItems: "center",
        justifyContent: "space-between",
        position: "relative",
        width: "100%",
        padding: 10,
        overflow: "hidden",
        flexWrap: "wrap",
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
        width: "55%",
        flexDirection: "column",
        alignItems: "flex-start",
        flexWrap: "wrap",
    },
    header: {
        width: "100%",
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    title: {
        fontWeight: "bold",
        fontSize: 20,
        textAlign: "left",
        flexShrink: 0, // Prevent shrinking
        flexWrap: "wrap",
        width: "80%",
    },
    deleteButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        backgroundColor: "#FF4D4D",
    },
    deleteButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    subtitle: {
        fontSize: 14,
        color: "#aaa",
    },
    roomCode: {
        marginTop: 5,
        fontWeight: "bold",
        fontSize: 16,
        color: "#333",
    },
    
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContentQR: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
        width: 300,
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        width: "50%",
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },
    roomCodeText: {
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
    },
    cardButtons: {
        flex: 1,
        width: "100%",
        alignItems: "center",
        flexDirection: "row",
    },
});

export default CardRoom;
