import {
    StyleSheet,
    Text,
    View,
    Modal,
    TextInput,
    TouchableOpacity,
    Alert,
    FlatList,
} from "react-native";
import React, { useState, useEffect } from "react";
import useViewLocation from "../../hooks/useViewLocation";
import CardRoom from "@/components/cards/CardRoom";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
} from "firebase/firestore"; // Add getDocs
import { FIREBASE_DB } from "@/FirebaseConfig";

const Home = () => {
    const { address, error } = useViewLocation();
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

    const renderRoom = ({ item }: { item: (typeof rooms)[0] }) => (
        <CardRoom
            id={item.id}
            name={item.name}
            section={item.section}
            startTime={item.startTime}
            endTime={item.endTime}
            roomCode={item.code}
        />
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text>Welcome!</Text>
                {address ? (
                    <Text>Address: {address}</Text>
                ) : (
                    <Text>{error || "Fetching address..."}</Text>
                )}
            </View>
            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id}
                renderItem={renderRoom}
                contentContainerStyle={styles.room}
                style={styles.roomCard}
            />
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        paddingBottom: 80,
        width: "100%",
    },
    header: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#D9D9D9",
        height: "30%",
        width: "100%",
        fontFamily: "sans-serif",
    },
    room: {
        width: "100%",
    },
    roomCard: {
        marginBottom: 10,
        width: "90%",
    },
    roomCode: {
        marginTop: 5,
        fontWeight: "bold",
        fontSize: 14,
        color: "#555",
    },
});
