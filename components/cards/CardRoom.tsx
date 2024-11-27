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
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";

type CardRoomProps = {
    id: string;
    name?: string;
    section?: string;
    startTime?: string;
    endTime?: string;
    roomCode: string;
};

const CardRoom = ({
    id,
    name,
    section,
    startTime,
    endTime,
    roomCode,
}: CardRoomProps) => {
    const [qrValue, setQrValue] = useState("");
    const [QRVisible, setQRVisible] = useState(false);
    const openQRCodeModal = () => {
        setQrValue(roomCode); // Set QR value when a room is clicked
        setQRVisible(true); // Show the modal
    };

    // Close the QR code modal
    const closeQRCodeModal = () => {
        setQRVisible(false);
        setQrValue(""); // Clear the QR value when the modal is closed
    };

    const deleteRoom = async (roomId: string) => {
        try {
            // Delete the room from Firestore
            await deleteDoc(doc(FIREBASE_DB, "rooms", roomId));
            console.log("Room deleted from Firestore:", roomId);
        } catch (error) {
            console.error("Error deleting room:", error);
            Alert.alert(
                "Error",
                "Failed to delete the room. Please try again."
            );
        }
    };
    const handleCopyToClipboard = (text: string) => {
        Clipboard.setStringAsync(text);
        Alert.alert("Copied", "Room code copied to clipboard!");
    };

    return (
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
                    <View style={styles.cardButtons}>
                        <Text
                            style={styles.roomCode}
                        >{`Code: ${roomCode}`}</Text>
                        <TouchableOpacity onPress={() => openQRCodeModal()}>
                            <MaterialIcons
                                name="content-copy"
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={() => deleteRoom(id)}
                        style={styles.deleteButton}
                    >
                        <Text style={styles.deleteButtonText}>X</Text>
                    </TouchableOpacity>
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
                            {qrValue ? ( // Ensure QR code is only rendered when qrValue is available
                                <>
                                    <Text style={styles.roomCodeText}>
                                        Room Code: {qrValue}
                                    </Text>
                                    <QRCode value={qrValue} size={200} />
                                </>
                            ) : (
                                <Text style={styles.roomCodeText}>
                                    Loading...
                                </Text> // Display loading text if qrValue is empty
                            )}
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={closeQRCodeModal}
                            >
                                <Text style={styles.closeButtonText}>
                                    Close
                                </Text>
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
        position: "relative",
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
        width: "100%",
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
    qrContainer: {
        marginTop: 20,
        alignItems: "center",
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
    },
    closeButtonText: {
        color: "#fff",
        fontWeight: "bold",
    },
    deleteButton: {
        marginTop: 5,
        backgroundColor: "#FF4D4D",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
        position: "absolute",
        flex: 1,
        right: 130,
    },
    deleteButtonText: {
        color: "white",
        fontWeight: "bold",
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
