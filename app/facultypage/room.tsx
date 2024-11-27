import React, { useState, useEffect } from "react"; // Add useEffect
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
import * as Clipboard from "expo-clipboard";
import CardRoom from "../../components/cards/CardRoom";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
} from "firebase/firestore"; // Add getDocs
import { FIREBASE_DB } from "@/FirebaseConfig";

const Room = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [rooms, setRooms] = useState<
        {
            id: string;
            name: string;
            section: string;
            startTime: string;
            endTime: string;
            code: string;
        }[]
    >([]);
    const [roomName, setRoomName] = useState("");
    const [roomSection, setRoomSection] = useState("");
    const [startHour, setStartHour] = useState("");
    const [startMinute, setStartMinute] = useState("");
    const [endHour, setEndHour] = useState("");
    const [endMinute, setEndMinute] = useState("");
    const [startAmPm, setStartAmPm] = useState("AM");
    const [endAmPm, setEndAmPm] = useState("AM");
    const [currentRoom, setCurrentRoom] = useState<any>(null);

    const generateRoomCode = () =>
        Math.floor(1000000 + Math.random() * 9000000).toString();

    const toggleStartAmPm = () =>
        setStartAmPm((prev) => (prev === "AM" ? "PM" : "AM"));
    const toggleEndAmPm = () =>
        setEndAmPm((prev) => (prev === "AM" ? "PM" : "AM"));

    const validateHourInput = (value: string): string => {
        const numericValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
        if (numericValue === "") return ""; // Allow empty input
        const parsedValue = Math.min(
            Math.max(parseInt(numericValue, 10), 1),
            12
        ); // Restrict within 1-12
        return parsedValue.toString();
    };

    const validateMinuteInput = (value: string): string => {
        const numericValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
        if (numericValue.length > 2) return numericValue.slice(0, 2); // Limit input to 2 characters
        if (numericValue === "") return ""; // Allow empty input for flexibility
        const parsedValue = Math.min(parseInt(numericValue, 10), 59); // Restrict to max 59
        return parsedValue.toString(); // Return valid numeric value
    };

    const handleCreateRoom = () => {
        if (
            roomName &&
            roomSection &&
            startHour &&
            startMinute &&
            endHour &&
            endMinute
        ) {
            const newRoom = {
                name: roomName,
                section: roomSection,
                startTime: `${startHour}:${startMinute} ${startAmPm}`,
                endTime: `${endHour}:${endMinute} ${endAmPm}`,
                code: generateRoomCode(),
            };

            setCurrentRoom(newRoom);
            setConfirmationVisible(true);
            setModalVisible(false);
        } else {
            Alert.alert("Error", "All fields are required to create a room.");
        }
    };

    const confirmRoomCreation = async () => {
        try {
            if (currentRoom) {
                // Add room data to Firestore
                const docRef = await addDoc(
                    collection(FIREBASE_DB, "rooms"),
                    currentRoom
                );
                console.log("Room added with ID:", docRef.id);

                // Add room to local state
                setRooms((prevRooms) => [
                    ...prevRooms,
                    { ...currentRoom, id: docRef.id },
                ]);
            }

            setCurrentRoom(null);
            setConfirmationVisible(false);
        } catch (error) {
            console.error("Error adding room to Firestore:", error);
            Alert.alert(
                "Error",
                "Failed to create the room. Please try again."
            );
        }
    };

    const cancelRoomCreation = () => {
        setCurrentRoom(null);
        setConfirmationVisible(false);
    };

    const handleCopyToClipboard = (text: string) => {
        Clipboard.setStringAsync(text);
        Alert.alert("Copied", "Room code copied to clipboard!");
    };

    // Fetch rooms from Firestore on component mount
    const fetchRooms = async () => {
        try {
            const querySnapshot = await getDocs(
                collection(FIREBASE_DB, "rooms")
            );
            const fetchedRooms = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name || "Unnamed Room", // Default value if name is missing
                section: doc.data().section || "No Section", // Default value if section is missing
                startTime: doc.data().startTime || "N/A", // Default value if startTime is missing
                endTime: doc.data().endTime || "N/A", // Default value if endTime is missing
                code: doc.data().code || "0000000", // Default value if code is missing
            }));
            setRooms(fetchedRooms);
        } catch (error) {
            console.error("Error fetching rooms:", error);
            Alert.alert("Error", "Failed to fetch rooms. Please try again.");
        }
    };

    useEffect(() => {
        fetchRooms();
    }, [rooms]);

    console.log(rooms);

    return (
        <View style={styles.container}>
            <View style={styles.createGame}>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    style={styles.createButton}
                >
                    <View style={styles.dash}></View>
                    <Text style={styles.createRoom}>CREATE ROOM +</Text>
                </TouchableOpacity>
            </View>

            {rooms.map((room) => (
                <View key={room.id} style={styles.roomCard}>
                    <CardRoom
                        id={room.id}
                        name={room.name}
                        section={room.section}
                        startTime={room.startTime}
                        endTime={room.endTime}
                        roomCode={room.code}
                    />
                </View>
            ))}

            {/* Modal for Creating a Room */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create a Room</Text>
                        <TextInput
                            placeholder="Room Name"
                            style={styles.input}
                            value={roomName}
                            onChangeText={setRoomName}
                        />
                        <TextInput
                            placeholder="Section"
                            style={styles.input}
                            value={roomSection}
                            onChangeText={setRoomSection}
                        />
                        <View style={styles.timeInputContainer}>
                            <View style={styles.timeGroup}>
                                <TextInput
                                    placeholder="HH"
                                    style={styles.timeInput}
                                    value={startHour}
                                    onChangeText={(value) =>
                                        setStartHour(validateHourInput(value))
                                    }
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                                <Text style={styles.colon}>:</Text>
                                <TextInput
                                    placeholder="MM"
                                    style={styles.timeInput}
                                    value={startMinute}
                                    onChangeText={(value) =>
                                        setStartMinute(
                                            validateMinuteInput(value)
                                        )
                                    }
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                                <TouchableOpacity
                                    style={[styles.button, styles.amPmButton]}
                                    onPress={toggleStartAmPm}
                                >
                                    <Text style={styles.buttonText}>
                                        {startAmPm}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.timeInputContainer}>
                            <View style={styles.timeGroup}>
                                <TextInput
                                    placeholder="HH"
                                    style={styles.timeInput}
                                    value={endHour}
                                    onChangeText={(value) =>
                                        setEndHour(validateHourInput(value))
                                    }
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                                <Text style={styles.colon}>:</Text>
                                <TextInput
                                    placeholder="MM"
                                    style={styles.timeInput}
                                    value={endMinute}
                                    onChangeText={(value) =>
                                        setEndMinute(validateMinuteInput(value))
                                    }
                                    keyboardType="numeric"
                                    maxLength={2}
                                />
                                <TouchableOpacity
                                    style={[styles.button, styles.amPmButton]}
                                    onPress={toggleEndAmPm}
                                >
                                    <Text style={styles.buttonText}>
                                        {endAmPm}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={handleCreateRoom}
                            >
                                <Text style={styles.buttonText}>CREATE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Confirmation Modal */}
            <Modal
                visible={confirmationVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelRoomCreation}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Confirm Room Creation
                        </Text>
                        {currentRoom && (
                            <View>
                                <Text>Room Name: {currentRoom.name}</Text>
                                <Text>Section: {currentRoom.section}</Text>
                                <Text>Start Time: {currentRoom.startTime}</Text>
                                <Text>End Time: {currentRoom.endTime}</Text>
                                <View style={styles.roomCodeRow}>
                                    <Text style={styles.roomCodeText}>
                                        Room Code: {currentRoom.code}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleCopyToClipboard(
                                                currentRoom.code
                                            )
                                        }
                                    >
                                        <MaterialIcons
                                            name="content-copy"
                                            size={20}
                                            color="black"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={cancelRoomCreation}
                            >
                                <Text style={styles.buttonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.confirmButton]}
                                onPress={confirmRoomCreation}
                            >
                                <Text style={styles.buttonText}>CONFIRM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    },
    createGame: {
        width: 320,
        height: 120,
        justifyContent: "center",
        alignItems: "center",
    },
    createButton: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    dash: {
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        borderRadius: 16,
        borderWidth: 16,
        borderColor: "#A0A0A0",
        borderStyle: "dashed",
    },
    createRoom: {
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
        marginBottom: 10,
        width: "100%",
    },
    timeInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    timeGroup: {
        flexDirection: "row",
        alignItems: "center",
    },
    timeInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 5,
        width: 50,
        textAlign: "center",
    },
    colon: {
        fontSize: 18,
        marginHorizontal: 5,
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
        backgroundColor: "#800000", // Maroon color
    },
    confirmButton: {
        backgroundColor: "#800000", // Maroon color
    },
    amPmButton: {
        backgroundColor: "#800000", // Maroon color for AM/PM buttons
    },
    buttonText: {
        color: "#fff", // White text
        fontSize: 16,
        fontWeight: "bold",
    },
    roomCard: {
        marginBottom: 10,
        alignItems: "center",
    },
    roomCode: {
        marginTop: 5,
        fontWeight: "bold",
        fontSize: 14,
        color: "#555",
    },

    roomCodeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
    },
    roomCodeText: {
        fontSize: 18,
        fontWeight: "bold",
        flex: 1,
    },
    roomCodeRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 10,
    },
});

export default Room;
