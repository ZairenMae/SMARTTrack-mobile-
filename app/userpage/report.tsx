import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FIREBASE_DB } from "@/FirebaseConfig";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "expo-router";

interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
}

const DashboardReport: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const loggedInUser = auth.currentUser; // Retrieve the logged-in user's info

        if (!loggedInUser) {
          throw new Error("No user is logged in");
        }

        const { uid } = loggedInUser;

        // Fetch the user's details from Firestore
        const usersRef = collection(FIREBASE_DB, "users");
        const userQuery = query(usersRef, where("uid", "==", uid));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          throw new Error("User details not found in Firestore");
        }

        const userDoc = userSnapshot.docs[0];
        const fetchedUser: User = {
          uid: userDoc.data().uid,
          firstName: userDoc.data().firstName,
          lastName: userDoc.data().lastName,
          email: userDoc.data().email,
        };

        setCurrentUser(fetchedUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleNavigateToAttendance = () => {
    if (currentUser) {
      router.push(`/userpage/attendance?uid=${encodeURIComponent(currentUser.uid)}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.dashboardReport}>
        <Text style={styles.infoText}>Loading...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.dashboardReport}>
        <Text style={styles.infoText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.dashboardReport}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={handleNavigateToAttendance}
        >
          <Text style={styles.cardTitle}>Daily Attendance</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  dashboardReport: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
    color: "#900",
  },
  card: {
    height: 100,
    borderWidth: 1,
    borderColor: "#666666",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: "#fff",
    margin: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
  },
});

export default DashboardReport;
