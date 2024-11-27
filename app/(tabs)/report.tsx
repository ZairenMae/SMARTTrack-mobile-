import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import ModalComponent from "../../components/modal/Modal";

interface User {
  userName: string;
  section: string;
  checkInTime: string;
  thresholdTime: string;
  date: string;
  status: string;
}

const DashboardReport = () => {
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [modalVisible, setModalVisible] = useState(false); // Modal state

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(FIREBASE_DB, "earlyWorms"), (snapshot) => {
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          userName: data.userName || "No Name",
          section: data.section || "No Section",
          checkInTime: data.checkInTime || "00:00",
          thresholdTime: data.thresholdTime || "00:00",
          date: data.date?.toDate().toLocaleDateString() || "No Date",
          status: data.status || "No Status",
        };
      });

      const sortedUsers = users.sort((a, b) =>
        new Date(`1970-01-01T${a.checkInTime}`).getTime() -
        new Date(`1970-01-01T${b.checkInTime}`).getTime()
      );

      setLeaderboard(sortedUsers);
    });

    return () => unsubscribe();
  }, []);

  const staticCards = [
    {
      title: "Early Leavers",
      progressHeader: "Attendance",
      progressValue: 75,
    },
    {
      title: "Late Comers",
      progressHeader: "Attendance",
      progressValue: 60,
    },
    {
      title: "Daily Attendance",
      progressHeader: "Attendance",
      progressValue: 85,
    },
    {
      title: "Monthly Attendance",
      progressHeader: "Attendance",
      progressValue: 95,
    },
  ];

  return (
    <View style={styles.dashboardReport}>
      <Text style={styles.headerText}>Dashboard Report</Text>
      <View style={styles.cardContainer}>
        {/* Dynamic Early Worms Card */}
        {leaderboard.length > 0 ? (
          <TouchableOpacity
            style={styles.card}
            onPress={() => setModalVisible(true)} // Open modal on press
          >
            <Text style={styles.cardTitle}>Early Worms</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.progressHeader}>Name</Text>
              <Text style={styles.progressValue}>{leaderboard[0].userName}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text>No Early Worms Found</Text>
        )}

        {/* Static Cards */}
        {staticCards.map((card, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <View style={styles.infoContainer}>
              <Text style={styles.progressHeader}>{card.progressHeader}</Text>
              <Text style={styles.progressValue}>{card.progressValue}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Modal for Leaderboard */}
      {leaderboard.length > 0 && (
        <ModalComponent
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          title="Early Worm Leaderboard"
          message={
            leaderboard
              .map(
                (user, index) =>
                  `${index + 1}. Name: ${user.userName}\n   Section: ${user.section}\n   Check-In: ${user.checkInTime}\n   Status: ${user.status}`
              )
              .join("\n\n")
          }
          buttons={[
            {
              text: "Close",
              action: () => setModalVisible(false),
              color: "gray",
            },
          ]}
          onPress={() => {}}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardReport: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#900",
  },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    height: 270,
    width: 220,
    borderWidth: 1,
    borderColor: "#666666",
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: "#fff",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  infoContainer: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "rgb(138, 37, 44)",
    width: "100%",
  },
  progressHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "rgb(245, 199, 34)",
  },
});

export default DashboardReport;
