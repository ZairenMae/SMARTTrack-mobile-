import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    ImageBackground,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from "firebase/auth";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import {
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    collection,
    where,
} from "firebase/firestore";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [selectedUserType, setSelectedUserType] = useState("");
    const [firstName, setFirstName] = useState("");
    const [middleName, setMiddleName] = useState("");
    const [lastName, setLastName] = useState("");
    const [idNumber, setIdNumber] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const router = useRouter();

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateIdNumber = (idNumber: string) => {
        const idNumberRegex = /^\d{2}-\d{4}-\d{3}$/;
        return idNumberRegex.test(idNumber);
    };

    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
        return passwordRegex.test(password);
    };

    const checkIfUserExists = async (idNumber: string, email: string) => {
        const userRef = doc(FIREBASE_DB, "users", idNumber);
        const userDoc = await getDoc(userRef);
        return (
            userDoc.exists() ||
            (
                await getDocs(
                    query(
                        collection(FIREBASE_DB, "users"),
                        where("email", "==", email)
                    )
                )
            ).size > 0
        );
    };

    const handleRegister = async () => {
        if (
            !email ||
            !password ||
            !confirmPassword ||
            !selectedUserType ||
            !firstName ||
            !lastName ||
            !idNumber
        ) {
            setModalMessage("Please fill in all fields.");
            setModalVisible(true);
            return;
        }

        if (!validateEmail(email)) {
            setModalMessage("Please enter a valid email.");
            setModalVisible(true);
            return;
        }

        if (!validateIdNumber(idNumber)) {
            setModalMessage(
                "Please enter a valid ID number (e.g., 12-3456-789)."
            );
            setModalVisible(true);
            return;
        }

        if (!validatePassword(password)) {
            setModalMessage(
                "Password must be at least 8 characters long and contain at least one uppercase letter."
            );
            setModalVisible(true);
            return;
        }

        if (password !== confirmPassword) {
            setModalMessage("Passwords do not match.");
            setModalVisible(true);
            return;
        }

        if (!email.endsWith("@cit.edu")) {
            setModalMessage("Email must be a valid @cit.edu address.");
            setModalVisible(true);
            return;
        }

        const userExists = await checkIfUserExists(idNumber, email);
        if (userExists) {
            setModalMessage(
                "This ID number or email address is already registered."
            );
            setModalVisible(true);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                FIREBASE_AUTH,
                email,
                password
            );
            console.log("User registered:", userCredential.user);

            // Send email verification
            await sendEmailVerification(userCredential.user);
            console.log("Verification email sent.");

            // Store user data in Firestore (ensure not to store passwords in plain text)
            await setDoc(doc(FIREBASE_DB, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                email,
                userType: selectedUserType,
                firstName,
                middleName,
                lastName,
                idNumber,
                createdAt: new Date(),
            });

            // Store user data in AsyncStorage
            await AsyncStorage.setItem(
                "userData",
                JSON.stringify({
                    name: `${firstName} ${middleName} ${lastName}`,
                    studentId: idNumber,
                    email: email,
                })
            );
            console.log("User data stored in AsyncStorage");

            console.log("User added to Firestore");
            setModalMessage("Registration successful!");
            setModalVisible(true);

            if (selectedUserType === "teacher") {
                router.push("/facultypage/home");
            } else {
                router.push("/userpage/home");
            }
        } catch (error) {
            console.error("Error registering user:", error);
            setModalMessage(
                (error as any).message ||
                    "An error occurred during registration."
            );
            setModalVisible(true);
        }
    };

    const deleteUserFromFirestore = async (uid: string) => {
        try {
            await deleteDoc(doc(FIREBASE_DB, "users", uid));
            console.log("User deleted from Firestore");
        } catch (error) {
            console.error("Error deleting user from Firestore:", error);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <ImageBackground
                source={require("../../assets/images/logo.png")}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.formContainer}>
                    <Text style={styles.title}>REGISTRATION</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />

                    <View style={styles.nameContainer}>
                        <TextInput
                            style={[styles.input, styles.nameInput]}
                            placeholder="Firstname"
                            placeholderTextColor="#999"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <TextInput
                            style={[styles.input, styles.nameInput]}
                            placeholder="ML"
                            placeholderTextColor="#999"
                            value={middleName}
                            onChangeText={setMiddleName}
                        />
                        <TextInput
                            style={[styles.input, styles.nameInput]}
                            placeholder="Lastname"
                            placeholderTextColor="#999"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="ID Number"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={idNumber}
                        onChangeText={setIdNumber}
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <MaterialCommunityIcons
                            name={showPassword ? "eye-off" : "eye"}
                            size={24}
                            color="#aaa"
                            style={styles.icon}
                            onPress={toggleShowPassword}
                        />
                    </View>

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm Password"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <MaterialCommunityIcons
                            name={showPassword ? "eye-off" : "eye"}
                            size={24}
                            color="#aaa"
                            style={styles.icon}
                            onPress={toggleShowPassword}
                        />
                    </View>

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedUserType}
                            onValueChange={(itemValue) =>
                                setSelectedUserType(itemValue)
                            }
                            style={styles.picker}
                        >
                            <Picker.Item label="Select User Type" value="" />
                            <Picker.Item
                                label="Teacher/Faculty"
                                value="pending"
                            />
                            <Picker.Item label="Student" value="student" />
                        </Picker>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleRegister}
                    >
                        <Text style={styles.buttonText}>SIGN UP</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            {/* Modal for displaying messages */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{modalMessage}</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.modalButton}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    backgroundImage: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
    },
    formContainer: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 10,
        padding: 20,
        width: "85%",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
        width: "100%",
        borderColor: "#ddd",
        borderWidth: 1,
    },
    nameContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    nameInput: {
        flex: 1,
        marginHorizontal: 5,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    icon: {
        position: "absolute",
        right: 10,
    },
    pickerContainer: {
        borderColor: "#ddd",
        borderWidth: 1,
        borderRadius: 8,
        marginVertical: 8,
        width: "100%",
        backgroundColor: "#fff",
    },
    picker: {
        width: "100%",
    },
    button: {
        backgroundColor: "#f1c40f",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 8,
        marginTop: 20,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },

    // Modal styles
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        marginBottom: 15,
        textAlign: "center",
    },
    modalButton: {
        backgroundColor: "#f1c40f",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
    },
});

export default Register;
