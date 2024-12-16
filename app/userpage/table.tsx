import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";

interface AttendanceRecord {
  userId: string;
  fullName: string;
  roomName: string;
  roomSection: string;
  status: string;
  timeIn: number | null;
  timeOut: number | null;
  date: string;
}

const Table = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Extract roomId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomIdParam = urlParams.get("roomId");
    setRoomId(roomIdParam);

    const fetchAttendance = async (roomId: string) => {
      try {
        console.log(`Fetching attendance records for roomId: ${roomId}`);

        const timeInRef = collection(FIREBASE_DB, "Attendance-TimeIn");
        const timeInQuery = query(timeInRef, where("roomId", "==", roomId));
        const timeInSnapshot = await getDocs(timeInQuery);

        const timeInRecords = timeInSnapshot.docs.map((doc) => ({
          userId: doc.data().userId,
          fullName: "N/A", // Placeholder, will be updated later
          roomName: doc.data().roomName,
          roomSection: doc.data().roomSection,
          status: doc.data().status || "N/A",
          timeIn: doc.data().timeIn || null,
          timeOut: null,
          date: doc.data().date || "N/A",
        }));

        const timeOutRef = collection(FIREBASE_DB, "Attendance-TimeOut");
        const timeOutQuery = query(timeOutRef, where("roomId", "==", roomId));
        const timeOutSnapshot = await getDocs(timeOutQuery);

        const timeOutRecords = timeOutSnapshot.docs.map((doc) => ({
          userId: doc.data().userId,
          fullName: "N/A", // Placeholder, will be updated later
          roomName: doc.data().roomName,
          roomSection: doc.data().roomSection,
          status: "N/A",
          timeIn: null,
          timeOut: doc.data().timeOut || null,
          date: doc.data().date || "N/A",
        }));

        const recordMap: Record<string, AttendanceRecord> = {};
        [...timeInRecords, ...timeOutRecords].forEach((record) => {
          const key = `${record.userId}-${record.date}`;
          if (!recordMap[key]) {
            recordMap[key] = { ...record };
          } else {
            recordMap[key] = { ...recordMap[key], ...record };
          }
        });

        const finalRecords = await Promise.all(
          Object.values(recordMap).map(async (record) => {
            const userQuery = query(
              collection(FIREBASE_DB, "users"),
              where("uid", "==", record.userId)
            );
            const userSnapshot = await getDocs(userQuery);
            const user = userSnapshot.docs[0]?.data() || { firstName: "N/A", lastName: "N/A" };

            return {
              ...record,
              fullName: `${user.firstName} ${user.lastName}`,
            };
          })
        );

        setAttendanceRecords(finalRecords);
      } catch (error) {
        console.error("Error fetching attendance records:", error);
      } finally {
        setLoading(false);
      }
    };

    if (roomIdParam) {
      fetchAttendance(roomIdParam);
    } else {
      console.error("Error: roomId is not provided in the URL.");
      setLoading(false);
    }
  }, []);

  const formatTime = (timestamp: number | null) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Attendance Records</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : attendanceRecords.length > 0 ? (
        <ScrollView horizontal>
          <View>
            <View style={styles.tableHeader}>
              <Text style={styles.headerCell}>Full Name</Text>
              <Text style={styles.headerCell}>Room Name</Text>
              <Text style={styles.headerCell}>Section</Text>
              <Text style={styles.headerCell}>Status</Text>
              <Text style={styles.headerCell}>Time In</Text>
              <Text style={styles.headerCell}>Time Out</Text>
              <Text style={styles.headerCell}>Date</Text>
            </View>
            {attendanceRecords.map((record, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.cell}>{record.fullName}</Text>
                <Text style={styles.cell}>{record.roomName}</Text>
                <Text style={styles.cell}>{record.roomSection}</Text>
                <Text style={styles.cell}>{record.status}</Text>
                <Text style={styles.cell}>{formatTime(record.timeIn)}</Text>
                <Text style={styles.cell}>{formatTime(record.timeOut)}</Text>
                <Text style={styles.cell}>{record.date}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <Text style={styles.noRecordsText}>No attendance records found for this room.</Text>
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
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerCell: {
    fontWeight: "bold",
    padding: 8,
    width: 120,
  },
  tableRow: {
    flexDirection: "row",
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  cell: {
    padding: 8,
    width: 120,
  },
  noRecordsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#900",
  },
});

export default Table;
