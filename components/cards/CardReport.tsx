import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import Modal from "../modal/Modal";

interface User {
  userName: string;
  section: string;
  checkInTime: string;
  thresholdTime: string;
  date: string;
  status: string;
}

interface CardReportProps {
  title: string;
  userName: string;
  section: string;
  checkInTime: string;
  thresholdTime: string;
  date: string;
  status: string;
  leaderboard: User[]; // List of all users for the leaderboard
}

const CardReport: React.FC<CardReportProps> = ({
  title,
  userName,
  section,
  checkInTime,
  thresholdTime,
  date,
  status,
  leaderboard,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = () => {
    setModalVisible(true);
  };

  const buttons = [
    {
      text: "Close",
      action: () => setModalVisible(false),
      color: "gray",
    },
  ];

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={handlePress}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.userName}>Name: {userName}</Text>
        <Text style={styles.details}>Check-In Time: {checkInTime}</Text>
        <Text style={styles.details}>Status: {status}</Text>
      </TouchableOpacity>
      <Modal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              title="Leaderboard"
              message={<ScrollView>
                  {leaderboard.map((user, index) => (
                      <View key={index} style={styles.leaderboardItem}>
                          <Text style={styles.leaderboardText}>
                              {index + 1}. {user.userName} - {user.checkInTime}
                          </Text>
                          <Text style={styles.leaderboardDetails}>Section: {user.section}</Text>
                          <Text style={styles.leaderboardDetails}>Status: {user.status}</Text>
                      </View>
                  ))}
              </ScrollView>}
              buttons={buttons} onPress={function (): void {
                  throw new Error("Function not implemented.");
              } }      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    height: 150,
    width: 300,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  details: {
    fontSize: 14,
    color: "#666",
  },
  leaderboardItem: {
    marginBottom: 10,
  },
  leaderboardText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  leaderboardDetails: {
    fontSize: 14,
    color: "#666",
  },
});

export default CardReport;
