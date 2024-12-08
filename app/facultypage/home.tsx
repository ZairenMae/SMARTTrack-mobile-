import React, { useEffect, useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    Alert,
    FlatList,
} from "react-native";
import useViewLocation from "../../hooks/useViewLocation";
import CardRoom from "@/components/cards/CardRoom";
import {
    collection,
    getDocs,
} from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";

interface Room {
    id: string;
    name: string;
    section: string;
    startTime: string;
    endTime: string;
    code: string;
}

const Home: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const { address, error } = useViewLocation();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const querySnapshot = await getDocs(collection(FIREBASE_DB, "rooms"));
            const fetchedRooms: Room[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                name: doc.data().name || "Unnamed Room",
                section: doc.data().section || "No Section",
                startTime: doc.data().startTime || "N/A",
                endTime: doc.data().endTime || "N/A",
                code: doc.data().code || "0000000",
            }));
            setRooms(fetchedRooms);
        } catch (error) {
            console.error("Error fetching rooms:", error);
            Alert.alert("Error", "Failed to fetch rooms. Please try again.");
        }
    };

    const renderRoom = ({ item }: { item: Room }) => (
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
        height: "30%",
        width: "100%",
        fontFamily: "sans-serif",
        padding: 10,
    },
    room: {
        width: "100%",
    },
    roomCard: {
        marginBottom: 10,
        width: "90%",
        gap: 10,
    },
    roomCode: {
        marginTop: 5,
        fontWeight: "bold",
        fontSize: 14,
        color: "#555",
    },
});
