import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import React, { useState, useEffect } from "react";
import { collection, getDocs, getDoc, doc, addDoc, query, where } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { MaterialIcons } from "@expo/vector-icons"; 
import useViewLocation from "../../hooks/useViewLocation";
import { Timestamp } from "firebase/firestore";

interface Room {
    id: string;
    name: string;
    section: string;
    startTime: number;
    endTime: number;
    days: string[];
    students: string[];
}

const Home = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [userName, setUserName] = useState<string>("User");
    const [timeModalVisible, setTimeModalVisible] = useState<boolean>(false);
    const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
    const [currentDate, setCurrentDate] = useState<string>("");
    const [timeMessage, setTimeMessage] = useState<string>("");
    const [showTimeoutButton, setShowTimeoutButton] = useState<boolean>(false);

    const { address, error } = useViewLocation();

    const fetchCurrentUser = () => {
        const auth = getAuth();
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
                try {
                    const userDoc = await getDoc(doc(FIREBASE_DB, "users", user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserName(userData?.firstName || "User");
                    } else {
                        console.error("User document does not exist.");
                    }
                } catch (error) {
                    console.error("Error fetching user details:", error);
                }
            } else {
                console.error("No user is logged in.");
                // You can redirect to login if required
            }
        });
    };

    const fetchRooms = async () => {
        try {
            const querySnapshot = await getDocs(collection(FIREBASE_DB, "rooms"));
            const fetchedRooms = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Room[];
            setRooms(fetchedRooms);
        } catch (error) {
            console.error("Error fetching rooms:", error);
        }
    };

    const formatDateTime = (timestamp: number): string => {
        const date = new Date(timestamp);
        const formattedDate = date.toLocaleDateString("en-US");
        const formattedTime = date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
        return `${formattedDate}, ${formattedTime}`;
    };

   

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    useEffect(() => {
        if (userId) {
            fetchRooms();
        }
    }, [userId]);

    useEffect(() => {
        filterRoomsByDay();
    }, [rooms]);

    const handleTime = async (room: Room) => {
        const currentTime = new Date().getTime();
        const currentFormattedDate = new Date().toLocaleDateString("en-US");
        setCurrentDate(currentFormattedDate);
        let status = "";
    
        // Check if user has already timed in or timed out today
        const timeInQuery = query(
            collection(FIREBASE_DB, "Attendance-TimeIn"),
            where("userId", "==", userId),
            where("roomId", "==", room.id),
            where("timeInDate", "==", Timestamp.fromDate(new Date()))
        );
        const timeOutQuery = query(
            collection(FIREBASE_DB, "Attendance-TimeOut"),
            where("userId", "==", userId),
            where("roomId", "==", room.id),
            where("timeOutDate", "==", Timestamp.fromDate(new Date()))
        );
    
        const timeInSnapshot = await getDocs(timeInQuery);
        const timeOutSnapshot = await getDocs(timeOutQuery);
    
        // If the user has already timed in or timed out today
        if (!timeInSnapshot.empty || !timeOutSnapshot.empty) {
            setCurrentRoom(room);
            setTimeMessage("Already checked in or out today.");
            setTimeModalVisible(true);
            return;
        }
    
        // Handle Time In logic
        if (currentTime < room.startTime) {
            status = "Too early to time in";
        } else {
            const timeDifference = currentTime - room.startTime;
            if (timeDifference <= -20 * 60 * 1000) {
                status = "Early Bird";  // 20 minutes before start time
            } else if (timeDifference >= -5 * 60 * 1000 && timeDifference <= 5 * 60 * 1000) {
                status = "On Time";  // 5 minutes before or after start time
            } else if (timeDifference > 10 * 60 * 1000 && currentTime <= room.endTime - 30 * 60 * 1000) {
                status = "Late";  // Between 10 minutes after start time and 30 minutes before end time
            } else {
                status = "Too late to time in";
            }
    
            try {
                await addDoc(collection(FIREBASE_DB, "Attendance-TimeIn"), {
                    userId,
                    roomId: room.id,
                    roomName: room.name,
                    roomSection: room.section,
                    timeIn: currentTime,
                    timeInDate: Timestamp.fromDate(new Date()),
                    status,
                });
            } catch (error) {
                console.error("Error saving time in:", error);
            }
        }
    
        setCurrentRoom(room);
        setTimeMessage(status);
        setTimeModalVisible(true);
    
        // Check if it's time for a timeout button to show
        if (currentTime >= room.endTime - 30 * 60 * 1000) {
            setShowTimeoutButton(true);
        }
    };
    

    const handleTimeOut = async (room: Room) => {
        const currentTime = new Date().getTime();
        try {
            await addDoc(collection(FIREBASE_DB, "Attendance-TimeOut"), {
                userId,
                roomId: room.id,
                roomName: room.name,
                roomSection: room.section,
                timeOut: currentTime,
                timeOutDate: Timestamp.fromDate(new Date()),
            });
            // Set the status message after timeout
            setTimeMessage("You have successfully timed out.");
            setTimeModalVisible(true);
        } catch (error) {
            console.error("Error saving time out:", error);
        }
    };
    
    const filterRoomsByDay = () => {
        const currentDay = new Date().toLocaleString("en-US", { weekday: "long" });
        const visibleRooms = rooms.filter(
            (room) =>
                room.days?.includes(currentDay) &&
                room.students?.includes(userId ?? "")
        );
        setFilteredRooms(visibleRooms);
    
        // Reset showTimeoutButton after filtering rooms
        setShowTimeoutButton(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
                {address ? (
                    <View style={styles.locationContainer}>
                        <MaterialIcons name="location-on" size={20} color="#333" />
                        <Text style={styles.locationText}> {address}</Text>
                    </View>
                ) : (
                    <Text>{error || "Fetching location..."}</Text>
                )}
            </View>
            <View style={styles.roomContainer}>
                {filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                        <View key={room.id} style={styles.roomBox}>
                            <View style={styles.roomContent}>
                                <View style={styles.defaultImage} />
                                <View>
                                    <Text style={[styles.roomText, styles.boldText]}>
                                        Subject: {room.name}
                                    </Text>
                                    <Text style={[styles.roomText, styles.boldText]}>
                                        Section: {room.section}
                                    </Text>
                                    <Text style={[styles.roomText, styles.boldText]}>
                                        Start Time: {formatDateTime(room.startTime)}
                                    </Text>
                                    <Text style={[styles.roomText, styles.boldText]}>
                                        End Time: {formatDateTime(room.endTime)}
                                    </Text>
                                </View>
                            </View>
    
                            <Text style={styles.attendanceText}>
                                {currentRoom?.id === room.id && timeMessage}
                            </Text>
    
                            {currentRoom?.id !== room.id && (
                                <TouchableOpacity
                                    style={styles.timeInButton}
                                    onPress={() => handleTime(room)}
                                >
                                    <Text style={styles.buttonText}>Time In</Text>
                                </TouchableOpacity>
                            )}
    
                            {showTimeoutButton && currentRoom?.id === room.id && (
                                <TouchableOpacity
                                    style={styles.timeInButton}
                                    onPress={() => handleTimeOut(room)}
                                >
                                    <Text style={styles.buttonText}>Time Out</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))
                ) : (
                    <Text style={styles.noRoomsText}>No rooms available for today.</Text>
                )}
            </View>
    
            <Modal visible={timeModalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={[styles.modalText, { color: 'blue' }]}>{timeMessage}</Text>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setTimeModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
    },
    header: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#D9D9D9",
        height: "20%",
        width: "100%",
        paddingHorizontal: 20,
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationText: {
        fontSize: 16,
        marginLeft: 5,
        color: "#333",
    },
    roomContainer: {
        flex: 1,
        width: "100%",
        paddingHorizontal: 20,
        marginTop: 20,
    },
    roomBox: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        padding: 20,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    roomContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    defaultImage: {
        width: 50,
        height: 50,
        backgroundColor: "#000",
        borderRadius: 5,
        marginRight: 15,
    },
    roomText: {
        fontSize: 16,
        color: "#333",
        marginBottom: 5,
    },
    boldText: {
        fontWeight: "bold",
    },
    timeInButton: {
        marginTop: 10,
        backgroundColor: "#800000",
        borderRadius: 5,
        padding: 10,
        alignItems: "center",
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    noRoomsText: {
        textAlign: "center",
        fontSize: 16,
        color: "#777",
        marginTop: 20,
    },
    attendanceText: {
        fontSize: 18,
        color: "#333",
        marginTop: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        marginBottom: 10,
    },
    closeButton: {
        marginTop: 10,
        backgroundColor: "#800000",
        borderRadius: 5,
        padding: 10,
        alignItems: "center",
    },
    closeButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});