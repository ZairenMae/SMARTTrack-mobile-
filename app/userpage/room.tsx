import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    Modal,
    TextInput,
    TouchableOpacity,
    Alert,
    FlatList,
    ScrollView,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
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
import CardRoom from "../../components/cards/CardRoom";

interface Student {
    id: string;
    firstName: string;
    lastName: string;
}

interface Room {
    id: string;
    name: string;
    code: string;
    section: string;
    startTime: number;
    endTime: number;
    days: string[];
    students: Student[];
    teacherId?: string;
    teacherName?: string;
}

const StudentRoom = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [roomCode, setRoomCode] = useState("");
    const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [user, setUser] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchJoinedRooms(currentUser.uid);
            } else {
                setUser(null);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const requestCameraPermission = async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === "granted");
        };

        requestCameraPermission();
    }, []);

    const fetchTeacherName = async (teacherUid: string): Promise<string> => {
        try {
            const teacherDocRef = doc(FIREBASE_DB, "users", teacherUid);
            const teacherSnap = await getDoc(teacherDocRef);
            if (teacherSnap.exists()) {
                const data = teacherSnap.data();
                if (data.userType === "teacher") {
                    const firstName = data.firstName || "";
                    const lastName = data.lastName || "";
                    return `${firstName} ${lastName}`.trim();
                }
            }
        } catch (error) {
            console.error("Error fetching teacher data:", error);
        }
        return "Unknown Teacher";
    };

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
                        const studentDetailsPromises = studentIds.map(async (studentId: string) => {
                            const studentDocRef = doc(FIREBASE_DB, "users", studentId);
                            const studentSnapshot = await getDoc(studentDocRef);
    
                            if (studentSnapshot.exists()) {
                                const studData = studentSnapshot.data();
                                return {
                                    id: studentId,
                                    firstName: studData.firstName || "",
                                    lastName: studData.lastName || "",
                                };
                            } else {
                                return null;
                            }
                        });
    
                        const studentDetails = (await Promise.all(studentDetailsPromises)).filter(Boolean) as Student[];
    
                        let teacherName = "Unknown Teacher";
                        if (roomData.teacherId) {
                            teacherName = await fetchTeacherName(
                                roomData.teacherId
                            );
                        }
    
                        return {
                            id: roomDoc.id,
                            name: roomData.name || "",
                            code: roomData.code || "",
                            section: roomData.section || "",
                            startTime: roomData.startTime || 0,
                            endTime: roomData.endTime || 0,
                            days: roomData.days || [],
                            students: studentDetails,
                            teacherId: roomData.teacherId || "",
                            teacherName,
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

    const renderRoomItem = ({ item }: { item: Room }) => (
        <TouchableOpacity
            style={styles.roomCard}
            onPress={() => setSelectedRoom(item)}
        >
            <CardRoom
                id={item.id}
                name={item.name}
                section={item.section}
                startTime={item.startTime}
                endTime={item.endTime}
                roomCode={item.code}
                userType="student"
            />
        </TouchableOpacity>
    );

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
                <FlatList
                    data={joinedRooms}
                    renderItem={renderRoomItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.flatListContainer}
                />
            ) : (
                <Text>No joined rooms found.</Text>
            )}

            {/* Modal for Join Room */}
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
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={() => console.log("Join Room")}
                            >
                                <Text style={styles.buttonText}>JOIN</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal for Selected Room Details */}
            <Modal
                visible={selectedRoom !== null}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setSelectedRoom(null)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {selectedRoom && (
                            <>
                                <Text style={styles.modalTitle}>
                                    {selectedRoom.name}
                                </Text>
                                <Text>Section: {selectedRoom.section}</Text>
                                <Text>
                                    Start:{" "}
                                    {new Date(
                                        selectedRoom.startTime
                                    ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Text>
                                <Text>
                                    End:{" "}
                                    {new Date(
                                        selectedRoom.endTime
                                    ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </Text>
                                <Text>
                                    Teacher: {selectedRoom.teacherName}
                                </Text>
                                <Text
                                    style={{
                                        fontWeight: "bold",
                                        marginTop: 10,
                                    }}
                                >
                                    Members:
                                </Text>
                                <ScrollView
                                    style={{
                                        maxHeight: 200,
                                        marginVertical: 10,
                                    }}
                                >
                                    {selectedRoom.students &&
                                    selectedRoom.students.length > 0 ? (
                                        selectedRoom.students.map((student) => (
                                            <Text key={student.id}>
                                                {student.firstName}{" "}
                                                {student.lastName}
                                            </Text>
                                        ))
                                    ) : (
                                        <Text>No classmates found.</Text>
                                    )}
                                </ScrollView>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => setSelectedRoom(null)}
                                >
                                    <Text style={styles.buttonText}>CLOSE</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
    },
    joinRoom: {
        alignItems: "center",
        marginVertical: 20,
    },
    joinButton: {
        width: "90%",
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 16,
        borderWidth: 2,
        borderColor: "#A0A0A0",
        borderStyle: "dashed",
        alignItems: "center",
    },
    joinRoomText: {
        color: "#A0A0A0",
        fontSize: 18,
        fontWeight: "bold",
    },
    flatListContainer: {
        alignItems: "center",
        paddingBottom: 100,
    },
    roomCard: {
        marginTop: 20,
        marginBottom: 10,
        alignItems: "center",
        width: "90%",
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
        backgroundColor: "#fff",
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
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
        backgroundColor: "#008000",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        width: "100%",
    },
});

export default StudentRoom;
