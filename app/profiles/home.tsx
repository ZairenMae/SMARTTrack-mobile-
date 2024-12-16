import React, { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    Image,
    TouchableOpacity,
    Modal,
    Button,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";

interface User {
    name: string;
    studentId: string;
    photoUri: string | null;
}

const Home = () => {
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [photoUri, setPhotoUri] = useState(null);
    const [modalVisible, setModalVisible] = useState(false); // Modal for editing profile
    const [scanModalVisible, setScanModalVisible] = useState(false); // Modal for face scan

    const fetchUserData = async (uid: string) => {
        try {
            const userDocRef = doc(FIREBASE_DB, "users", uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const data = userDoc.data();
                const user = {
                    name: `${data.firstName} ${data.lastName}`,
                    studentId: data.idNumber,
                    photoUri: data.photoUri || null,
                };
                setUserData(user);
                await AsyncStorage.setItem("userData", JSON.stringify(user));
            } else {
                console.error("User document does not exist!");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = () => {
        launchImageLibrary(
            {
                mediaType: "photo",
                includeBase64: false,
                maxHeight: 200,
                maxWidth: 200,
            },
            (response: any) => {
                if (response.didCancel) {
                    console.log("User canceled image picker");
                } else if (response.errorMessage) {
                    console.error("ImagePicker Error: ", response.errorMessage);
                } else {
                    setPhotoUri(response.assets[0].uri); // Store the local image URI
                }
            }
        );
    };

    useEffect(() => {
        const uid = "exampleUserId"; // Replace with actual user ID
        fetchUserData(uid);
    }, []);

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Image
                    style={styles.profileImage}
                    source={{
                        uri:
                            photoUri ||
                            userData?.photoUri ||
                            "https://via.placeholder.com/100",
                    }}
                />
                <View style={styles.info}>
                    <Text style={styles.name}>
                        {loading ? "Loading..." : userData?.name}
                    </Text>
                    <Text style={styles.details}>
                        {loading ? "Loading..." : userData?.studentId}
                    </Text>
                    <Text style={styles.details}>SERIAL NUMBER</Text>
                    <Text style={styles.details}>PROGRAM</Text>
                </View>
            </View>

            {/* Button to open Image Picker */}
            <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Text style={styles.buttonText}>Change Profile Picture</Text>
            </TouchableOpacity>

            {/* View Profile and Edit Profile Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.viewButton]}
                >
                    <Text style={styles.actionButtonText}>View Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() => setModalVisible(true)} // Open modal when clicked
                >
                    <Text style={styles.actionButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Modal for editing profile */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)} // Close modal when back button is pressed
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Edit Profile</Text>

                    {/* Input Fields Section */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="ADDRESS"
                            placeholderTextColor="#000"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="NUMBER"
                            placeholderTextColor="#000"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="EMAIL"
                            placeholderTextColor="#000"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="FACEBOOK"
                            placeholderTextColor="#000"
                        />

                        {/* Replacing TextInput with TouchableOpacity for 'FACE ENROLLED' */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setScanModalVisible(true)} // Open the scan modal when pressed
                        >
                            <Text style={styles.buttonText}>FACE ENROLLED</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Save and Cancel Buttons */}
                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setModalVisible(false)} // Close modal
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => setModalVisible(false)} // Here you would save changes
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Modal for Face Scan */}
            <Modal
                visible={scanModalVisible}
                animationType="fade"
                onRequestClose={() => setScanModalVisible(false)} // Close scan modal
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Scan Your Face</Text>
                    <Text style={styles.details}>
                        Please scan your face for enrollment.
                    </Text>

                    {/* Scan Now Button */}
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => alert("Scanning...")} // Replace this with actual face scan functionality
                    >
                        <Text style={styles.buttonText}>Scan Now</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => setScanModalVisible(false)} // Close modal
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f4f4",
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#c4c4c4",
        padding: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: "#000",
    },
    info: {
        marginLeft: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#000",
    },
    details: {
        fontSize: 14,
        color: "#555",
        marginTop: 4,
    },
    inputContainer: {
        marginTop: 20,
        paddingHorizontal: 16,
    },
    input: {
        height: 40,
        borderColor: "#000",
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#4CAF50",
        padding: 10,
        marginTop: 20,
        borderRadius: 5,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: "row",
        marginTop: 16,
    },
    actionButton: {
        padding: 10,
        borderRadius: 5,
        marginHorizontal: 8,
    },
    viewButton: {
        backgroundColor: "#D32F2F",
    },
    editButton: {
        backgroundColor: "#FFEB3B",
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
});
