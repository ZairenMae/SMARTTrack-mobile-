import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BarCodeScanner } from "expo-barcode-scanner";
import * as Clipboard from "expo-clipboard";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    setDoc,
    query,
    where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FIREBASE_DB, FIREBASE_AUTH } from "@/FirebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Room {
    id: string;
    name: string;
    code: string;
    section: string;
    startTime: number;
    endTime: number;
    days: string[];
    students: Student[];
}

interface Student {
    id: string;
    firstName: string;
    lastName: string;
}

const StudentRoom = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [joinedRoom, setJoinedRoom] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
            if (currentUser) {
                setUser({
                    uid: currentUser.uid,
                    name: currentUser.displayName || "Unknown User",
                    email: currentUser.email || "No Email",
                });

                fetchJoinedRooms(currentUser.uid);
            } else {
                setUser(null);
                setJoinedRoom(null);
            }
        });

        return () => unsubscribe(); // Clean up listener on unmount
    }, []);

    useEffect(() => {
        // Request camera permissions on mount
        const requestCameraPermission = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === "granted");
        };

        requestCameraPermission();
    }, []);

    const fetchJoinedRooms = async (userId: string) => {
        try {
            const roomsQuery = query(
                collection(FIREBASE_DB, "rooms"),
                where("students", "array-contains", userId)
            );

            const querySnapshot = await getDocs(roomsQuery);

            if (!querySnapshot.empty) {
                const rooms = await Promise.all(
                    querySnapshot.docs.map(async (roomDoc) => {
                        const roomData = roomDoc.data();
                        const studentIds = roomData.students || [];

                        // Fetch student details
                        const studentDetailsPromises = studentIds.map(
                            async (studentId: string) => {
                                const studentDocRef = doc(
                                    FIREBASE_DB,
                                    "users",
                                    studentId
                                );
                                const studentSnapshot = await getDoc(
                                    studentDocRef
                                );

                                return studentSnapshot.exists()
                                    ? {
                                          id: studentId,
                                          ...studentSnapshot.data(),
                                      }
                                    : null;
                            }
                        );

                        const studentDetails = (
                            await Promise.all(studentDetailsPromises)
                        ).filter(Boolean);

                        // Ensure the returned room data matches the Room interface
                        return {
                            id: roomDoc.id,
                            name: roomData.name || "",
                            code: roomData.code || "",
                            section: roomData.section || "",
                            startTime: roomData.startTime || 0,
                            endTime: roomData.endTime || 0,
                            days: roomData.days || [],
                            students: studentDetails,
                        };
                    })
                );

                setJoinedRooms(rooms);
            } else {
                setJoinedRooms([]);
            }
        } catch (error) {
            console.error("Error fetching joined rooms:", error);
        }
    };

    const handleJoinRoom = async () => {
        if (!roomCode) {
            Alert.alert("Error", "Please enter a valid room code.");
            return;
        }

        try {
            const userId = FIREBASE_AUTH.currentUser?.uid;
            if (!userId) {
                Alert.alert("Error", "User not authenticated.");
                return;
            }

            const roomQuery = collection(FIREBASE_DB, "rooms");
            const querySnapshot = await getDocs(roomQuery);
            const matchedRoom = querySnapshot.docs.find(
                (doc) => doc.data().code === roomCode
            );

            if (matchedRoom) {
                const roomData = matchedRoom.data();
                const roomId = matchedRoom.id;

                const roomDocRef = doc(FIREBASE_DB, "rooms", roomId);

                const updatedStudents = roomData.students || [];
                if (!updatedStudents.includes(userId)) {
                    updatedStudents.push(userId);
                    await setDoc(
                        roomDocRef,
                        { students: updatedStudents },
                        { merge: true }
                    );
                }

                setJoinedRoom({
                    id: roomId,
                    ...roomData,
                    students: updatedStudents,
                });

                await AsyncStorage.setItem(
                    "@joinedRoom",
                    JSON.stringify({
                        id: roomId,
                        ...roomData,
                        students: updatedStudents,
                    })
                );

                setModalVisible(false);
                setRoomCode("");
                Alert.alert("Success", "You joined the room successfully!");
            } else {
                Alert.alert(
                    "Error",
                    "Room not found. Please check the code and try again."
                );
            }
        } catch (error) {
            console.error("Error joining room:", error);
            Alert.alert("Error", "Failed to join the room. Please try again.");
        }
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        setIsScanning(false);
        setRoomCode(data);

        try {
            const userId = FIREBASE_AUTH.currentUser?.uid;
            if (!userId) {
                Alert.alert("Error", "User not authenticated.");
                return;
            }

            const roomQuery = collection(FIREBASE_DB, "rooms");
            const querySnapshot = await getDocs(roomQuery);
            const matchedRoom = querySnapshot.docs.find(
                (doc) => doc.data().code === data
            );

            if (matchedRoom) {
                const roomData = matchedRoom.data();
                const roomId = matchedRoom.id;

                const roomDocRef = doc(FIREBASE_DB, "rooms", roomId);

                const updatedStudents = roomData.students || [];
                if (!updatedStudents.includes(userId)) {
                    updatedStudents.push(userId);
                    await setDoc(
                        roomDocRef,
                        { students: updatedStudents },
                        { merge: true }
                    );
                }

                setJoinedRoom({
                    id: roomId,
                    ...roomData,
                    students: updatedStudents,
                });

                await AsyncStorage.setItem(
                    "@joinedRoom",
                    JSON.stringify({
                        id: roomId,
                        ...roomData,
                        students: updatedStudents,
                    })
                );

                Alert.alert("Success", "You joined the room successfully!");

                // Fetch updated joined rooms after joining
                fetchJoinedRooms(userId);
            } else {
                Alert.alert(
                    "Error",
                    "Room not found. Please check the code and try again."
                );
            }
        } catch (error) {
            console.error("Error joining room:", error);
            Alert.alert("Error", "Failed to join the room. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.joinRoom}>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.joinButton}
                >
                    <Text style={styles.joinRoomText}>JOIN ROOM +</Text>
                </TouchableOpacity>
            </View>

            {joinedRooms.length > 0 ? (
                joinedRooms.map((room: any) => (
                    <View style={styles.roomCard} key={room.id}>
                        <Text style={styles.roomDetailText}>
                            Room Name: {room.name}
                        </Text>
                        <Text style={styles.roomDetailText}>
                            Section: {room.section}
                        </Text>
                        <Text style={styles.roomDetailText}>
                            Start Time: {room.startTime}
                        </Text>
                        <Text style={styles.roomDetailText}>
                            End Time: {room.endTime}
                        </Text>
                        <View style={styles.roomCodeContainer}>
                            <Text style={styles.roomCodeText}>
                                Code: {room.id}
                            </Text>
                            <TouchableOpacity
                                onPress={() =>
                                    Clipboard.setStringAsync(room.id)
                                }
                            >
                                <MaterialIcons
                                    name="content-copy"
                                    size={24}
                                    color="black"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))
            ) : (
                <Text>No joined rooms found.</Text>
            )}

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Join a Room</Text>
                        <TextInput
                            placeholder="Enter Room Code"
                            style={styles.input}
                            value={roomCode}
                            onChangeText={setRoomCode}
                            keyboardType="numeric"
                            maxLength={7}
                        />
                        <TouchableOpacity
                            style={[styles.button, styles.scanButton]}
                            onPress={() => setIsScanning(true)}
                        >
                            <Text style={styles.buttonText}>SCAN QR CODE</Text>
                        </TouchableOpacity>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={handleJoinRoom}
                            >
                                <Text style={styles.buttonText}>JOIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {isScanning && hasPermission && (
                <Modal visible={isScanning} transparent={true}>
                    <View style={styles.barcodeScannerContainer}>
                        <BarCodeScanner
                            onBarCodeScanned={handleBarCodeScanned}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <TouchableOpacity
                            style={styles.closeScannerButton}
                            onPress={() => setIsScanning(false)}
                        >
                            <Text style={styles.buttonText}>CLOSE</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
        overflow: "scroll",
        paddingBottom: 100,
        paddingTop: 20,
    },
    joinRoom: {
        width: 320,
        height: 120,
        justifyContent: "center",
        alignItems: "center",
    },
    joinButton: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        borderRadius: 16,
        borderWidth: 10,
        borderColor: "#A0A0A0",
        borderStyle: "dashed",
    },
    joinRoomText: {
        position: "absolute",
        color: "#A0A0A0",
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: 2,
        textAlign: "center",
        fontFamily: "Montserrat",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        width: "80%",
        padding: 20,
        backgroundColor: "white",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        width: "100%",
    },
    scanButton: {
        backgroundColor: "#FFC107",
        paddingVertical: 10,
        borderRadius: 5,
        marginBottom: 20,
        alignItems: "center",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },
    button: {
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
        margin: 5,
        minWidth: 100,
    },
    cancelButton: {
        backgroundColor: "#800000",
    },
    confirmButton: {
        backgroundColor: "#800000",
    },
    barcodeScannerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
    },
    closeScannerButton: {
        position: "absolute",
        bottom: 20,
        backgroundColor: "#800000",
        padding: 10,
        borderRadius: 5,
    },
    roomCard: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
        width: "90%",
    },
    roomDetailText: {
        fontSize: 16,
        marginBottom: 5,
    },
    roomCodeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },
    roomCodeText: {
        fontSize: 16,
        fontWeight: "bold",
        flex: 1,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default StudentRoom;
