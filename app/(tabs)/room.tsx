import React, { useState } from "react";
import { StyleSheet, Text, View, Modal, TextInput, Button, TouchableOpacity } from "react-native";
import CardRoom from "../../components/cards/CardRoom";

const Home = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [rooms, setRooms] = useState<{ name: string; section: string; time: string }[]>([]);
    const [roomName, setRoomName] = useState("");
    const [roomSection, setRoomSection] = useState("");
    const [roomTime, setRoomTime] = useState("");

    // Function to handle room creation
    const handleCreateRoom = () => {
        if (roomName && roomSection && roomTime) {
            setRooms((prevRooms) => [
                ...prevRooms,
                { name: roomName, section: roomSection, time: roomTime },
            ]);
            setRoomName("");
            setRoomSection("");
            setRoomTime("");
            setModalVisible(false);
        }
    };

    // Function to handle room deletion
    const handleDeleteRoom = (index: number) => {
        setRooms((prevRooms) => prevRooms.filter((_, i) => i !== index));
    };

    return (
        <View style={styles.container}>
            <View style={styles.createGame}>
                <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.createButton}>
                    <View style={styles.dash}></View>
                    <Text style={styles.createRoom}>CREATE ROOM +</Text>
                </TouchableOpacity>
            </View>

            {/* Display Room Cards */}
            {rooms.map((room, index) => (
                <View key={index} style={styles.roomCard}>
                    <CardRoom name={room.name} section={room.section} time={room.time} />
                    <TouchableOpacity
                        onPress={() => handleDeleteRoom(index)}
                        style={styles.deleteButton}
                    >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
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
                        <TextInput
                            placeholder="Time"
                            style={styles.input}
                            value={roomTime}
                            onChangeText={setRoomTime}
                        />
                        <View style={styles.buttonContainer}>
                            <Button title="Cancel" onPress={() => setModalVisible(false)} />
                            <Button title="Create" onPress={handleCreateRoom} />
                        </View>
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
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F9F9F9",
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
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    roomCard: {
        marginBottom: 10,
        alignItems: "center",
    },
    deleteButton: {
        marginTop: 5,
        backgroundColor: "#FF4D4D",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    deleteButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});