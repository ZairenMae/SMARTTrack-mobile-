import {
    StyleSheet,
    Text,
    View,
    Button,
    Alert,
    FlatList,
    TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import CardRoom from "@/components/cards/CardRoom";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    updateDoc,
} from "firebase/firestore"; // Add getDocs
import { FIREBASE_DB } from "@/FirebaseConfig";

const Home = () => {
    const [teachers, setTeachers] = useState<
        {
            uid: string;
            email: string;
            firstName: string;
            idNumber: string;
            lastName: string;
            middleName: string;
            userType: string;
        }[]
    >([]);

    // const fetchTeachers = async () => {
    //     try {
    //         const querySnapshot = await getDocs(
    //             collection(FIREBASE_DB, "users")
    //         );
    //         const fetchedTeachers = querySnapshot.docs
    //             .map((doc) => ({
    //                 uid: doc.id,
    //                 email: doc.data().email || "No Email",
    //                 firstName: doc.data().firstName || "No First Name",
    //                 idNumber: doc.data().idNumber || "No ID Number",
    //                 lastName: doc.data().lastName || "No Last Name",
    //                 middleName: doc.data().middleName || "No Middle Name",
    //                 userType: doc.data().userType || "No UserType",
    //             }))
    //             .filter((user) => user.userType === "teacher"); // Filter for teachers

    //         setTeachers(fetchedTeachers);
    //     } catch (error) {
    //         console.error("Error fetching teachers:", error);
    //         Alert.alert("Error", "Failed to fetch teachers. Please try again.");
    //     }
    // };

    const fetchTeachers = async () => {
        try {
            const querySnapshot = await getDocs(
                collection(FIREBASE_DB, "users")
            );
            const fetchedTeachers = querySnapshot.docs.map((doc) => ({
                uid: doc.id,
                email: doc.data().email || "No Email",
                firstName: doc.data().firstName || "No First Name",
                idNumber: doc.data().idNumber || "No ID Number",
                lastName: doc.data().lastName || "No Last Name",
                middleName: doc.data().middleName || "No Middle Name",
                userType: doc.data().userType || "No UserType",
            }));

            setTeachers(fetchedTeachers);
        } catch (error) {
            console.error("Error fetching teachers:", error);
            Alert.alert("Error", "Failed to fetch users. Please try again.");
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, [teachers]);

    const handleCheck = async (uid: string) => {
        try {
            // Reference the user document
            const userRef = doc(FIREBASE_DB, "users", uid);

            // Update the userType to "teacher"
            await updateDoc(userRef, {
                userType: "teacher",
            });

            console.log(
                `User with UID: ${uid} is checked and userType updated to "teacher".`
            );
            Alert.alert("Success", "User status updated to 'Teacher'.");
        } catch (error) {
            console.error("Error updating user type to teacher:", error);
            Alert.alert(
                "Error",
                "Failed to update user type. Please try again."
            );
        }
    };

    const handleReject = async (uid: string) => {
        try {
            // Reference the user document
            const userRef = doc(FIREBASE_DB, "users", uid);

            // Update the userType to "declined"
            await updateDoc(userRef, {
                userType: "declined",
            });

            console.log(
                `User with UID: ${uid} is rejected and userType updated to "declined".`
            );
            Alert.alert("Success", "User status updated to 'Declined'.");
        } catch (error) {
            console.error("Error updating user type to declined:", error);
            Alert.alert(
                "Error",
                "Failed to update user type. Please try again."
            );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.tableHeader}>
                    <Text style={styles.columnHeader}>Username</Text>
                    <Text style={styles.columnHeader}>Email</Text>
                    <Text style={styles.columnHeader}>User Type</Text>
                </View>
            </View>
            <View style={styles.body}>
                <FlatList
                    data={teachers}
                    keyExtractor={(item) => item.uid}
                    renderItem={({ item }) => (
                        <View style={styles.row}>
                            <Text style={styles.cell}>
                                {item.firstName} {item.lastName}
                            </Text>
                            <Text style={styles.cell}>{item.email}</Text>
                            <Text style={styles.cell}>{item.userType}</Text>

                            {/* Only show actions for users with userType "pending" */}
                            {item.userType === "pending" && (
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            styles.rejectButton,
                                        ]}
                                        onPress={() => handleReject(item.uid)}
                                    >
                                        <Text style={styles.buttonText}>X</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                            styles.checkButton,
                                        ]}
                                        onPress={() => handleCheck(item.uid)}
                                    >
                                        <Text style={styles.buttonText}>✔</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    )}
                />
            </View>
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
    },
    header: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#D9D9D9",
        height: "10%",
        width: "100%",
        fontFamily: "sans-serif",
    },
    body: {
        width: "100%",
    },
    tableHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        backgroundColor: "#ffffff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        width: "100%",
    },
    columnHeader: {
        flex: 1,
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
        textAlign: "center",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
    },
    cell: {
        flex: 1,
        fontSize: 14,
        color: "#333",
        textAlign: "center",
    },
    actions: {
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        padding: 8,
        marginLeft: 10,
        borderRadius: 5,
    },
    rejectButton: {
        backgroundColor: "#ff4d4d",
    },
    checkButton: {
        backgroundColor: "#4CAF50",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});
