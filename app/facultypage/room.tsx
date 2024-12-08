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

const Room = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [rooms, setRooms] = useState<Room[]>([]);

    [];
    const [roomName, setRoomName] = useState("");
    const [roomSection, setRoomSection] = useState("");
    const [startHour, setStartHour] = useState("");
    const [startMinute, setStartMinute] = useState("");
    const [endHour, setEndHour] = useState("");
    const [endMinute, setEndMinute] = useState("");
    const [startAmPm, setStartAmPm] = useState("AM");
    const [endAmPm, setEndAmPm] = useState("AM");
    const [currentRoom, setCurrentRoom] = useState<any>(null);
    const [selectedDays, setSelectedDays] = useState<string[]>([]);

    const toggleDaySelection = (day: string) => {
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const dayButtons = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ];

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
            const startTime = new Date();
            startTime.setHours(
                startAmPm === "AM"
                    ? parseInt(startHour) % 12
                    : (parseInt(startHour) % 12) + 12,
                parseInt(startMinute),
                0
            );

            const endTime = new Date();
            endTime.setHours(
                endAmPm === "AM"
                    ? parseInt(endHour) % 12
                    : (parseInt(endHour) % 12) + 12,
                parseInt(endMinute),
                0
            );

            const newRoom = {
                name: roomName,
                section: roomSection,
                startTime: startTime.getTime(), // Save as timestamp
                endTime: endTime.getTime(), // Save as timestamp
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
                const roomWithDays = { ...currentRoom, days: selectedDays };
                const docRef = await addDoc(
                    collection(FIREBASE_DB, "rooms"),
                    roomWithDays
                );
                console.log("Room added with ID:", docRef.id);

                setRooms((prevRooms) => [
                    ...prevRooms,
                    { ...roomWithDays, id: docRef.id },
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
            const roomsSnapshot = await getDocs(
                collection(FIREBASE_DB, "rooms")
            );
            const usersSnapshot = await getDocs(
                collection(FIREBASE_DB, "users")
            );

            // Create a map of user IDs to user details
            const usersMap: Record<
                string,
                { firstName: string; lastName: string }
            > = {};
            usersSnapshot.forEach((userDoc) => {
                const userData = userDoc.data();
                usersMap[userDoc.id] = {
                    firstName: userData.firstName || "Unknown",
                    lastName: userData.lastName || "Unknown",
                };
            });

            // Map rooms and fetch full student details
            const fetchedRooms = roomsSnapshot.docs.map((roomDoc) => {
                const roomData = roomDoc.data();
                const students =
                    roomData.students?.map((studentId: string) => ({
                        id: studentId,
                        firstName: usersMap[studentId]?.firstName || "Unknown",
                        lastName: usersMap[studentId]?.lastName || "Unknown",
                    })) || [];

                return {
                    id: roomDoc.id,
                    name: roomData.name || "Unnamed Room",
                    code: roomData.code || "0000000",
                    section: roomData.section || "No Section",
                    startTime: roomData.startTime || 0,
                    endTime: roomData.endTime || 0,
                    days: Array.isArray(roomData.days) ? roomData.days : [],
                    students,
                };
            }) as Room[];

            setRooms(fetchedRooms);
        } catch (error) {
            console.error("Error fetching rooms:", error);
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

            <View style={styles.roomCardContainer}>
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
                        <Text>Students:</Text>
                        {room.students?.map((student) => (
                            <Text key={student.id}>
                                {student.firstName} {student.lastName}
                            </Text>
                        ))}
                    </View>
                ))}
            </View>

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
                        <View style={styles.daysContainer}>
                            {dayButtons.map((day) => (
                                <TouchableOpacity
                                    key={day}
                                    style={[
                                        styles.dayButton,
                                        selectedDays.includes(day)
                                            ? styles.dayButtonSelected
                                            : null,
                                    ]}
                                    onPress={() => toggleDaySelection(day)}
                                >
                                    <Text style={styles.dayButtonText}>
                                        {day}
                                    </Text>
                                </TouchableOpacity>
                            ))}
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
    roomCardContainer: {
        width: "100%",
        alignItems: "center",
        marginBottom: 100,
    },
    roomCard: {
        marginTop: 20,
        marginBottom: 10,
        alignItems: "center",
        width: "90%",
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
    daysContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginVertical: 10,
        justifyContent: "center",
    },
    dayButton: {
        padding: 10,
        borderRadius: 5,
        margin: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#f9f9f9",
    },
    dayButtonSelected: {
        backgroundColor: "#800000",
    },
    dayButtonText: {
        color: "#000",
        fontSize: 14,
        fontWeight: "bold",
    },
});

export default Room;
