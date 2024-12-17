import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { collection, getDocs, query, where } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { useLocalSearchParams, useRouter } from "expo-router";

interface Room {
  id: string;
  name: string;
  section: string;
  startTime: number; // Use number for timestamps
  endTime: number;
}

const Attendance = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const { uid } = useLocalSearchParams(); // Get the UID from the search params
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async (uid: string) => {
      try {
        const roomsRef = collection(FIREBASE_DB, "rooms");

        // Query to find rooms where the user UID is in the "students" array
        const q = query(roomsRef, where("students", "array-contains", uid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          console.log("No rooms found for this user.");
          setRooms([]);
        } else {
          const fetchedRooms = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Room, "id">),
          }));
          setRooms(fetchedRooms);
        }
      } catch (error) {
        console.error("Error fetching rooms:", error);
      } finally {
        setLoading(false); // Stop the loading spinner
      }
    };

    if (uid) {
      fetchRooms(uid as string); // Ensure uid is treated as a string
    } else {
      console.error("Error: UID is not provided in the URL.");
      setLoading(false);
    }
  }, [uid]);

  // Convert timestamp to AM/PM format
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  // Handle room selection
  const handleRoomSelect = (roomId: string) => {
    router.push(`/userpage/table?roomId=${encodeURIComponent(roomId)}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Assigned Rooms</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : uid && rooms.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {rooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={styles.roomCard}
              onPress={() => handleRoomSelect(room.id)} // Redirect to table with room ID
            >
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomSection}>Section: {room.section}</Text>
              <Text style={styles.roomTime}>
                Time: {formatTime(room.startTime)} - {formatTime(room.endTime)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.noRoomsText}>No rooms assigned</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
  scrollViewContainer: {
    paddingBottom: 20,
  },
  roomCard: {
    marginBottom: 10,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  roomSection: {
    fontSize: 16,
    marginBottom: 4,
  },
  roomTime: {
    fontSize: 14,
    color: "#666",
  },
  noRoomsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#900",
  },
});

export default Attendance;
