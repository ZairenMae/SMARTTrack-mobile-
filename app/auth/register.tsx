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

class RegisterState {
    email: string;
    password: string;
    confirmPassword: string;
    selectedUserType: string;
    firstName: string;
    middleName: string;
    lastName: string;
    idNumber: string;

    constructor() {
        this.email = "";
        this.password = "";
        this.confirmPassword = "";
        this.selectedUserType = "";
        this.firstName = "";
        this.middleName = "";
        this.lastName = "";
        this.idNumber = "";
    }
}

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [register, setRegister] = useState<RegisterState>({
        email: "",
        password: "",
        confirmPassword: "",
        selectedUserType: "",
        firstName: "",
        middleName: "",
        lastName: "",
        idNumber: "",
    });
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
            !register.email ||
            !register.password ||
            !register.confirmPassword ||
            !register.selectedUserType ||
            !register.firstName ||
            !register.lastName ||
            !register.idNumber
        ) {
            setModalMessage("Please fill in all fields.");
            setModalVisible(true);
            return;
        }

        if (!validateEmail(register.email)) {
            setModalMessage("Please enter a valid email.");
            setModalVisible(true);
            return;
        }

        if (!validateIdNumber(register.idNumber)) {
            setModalMessage(
                "Please enter a valid ID number (e.g., 12-3456-789)."
            );
            setModalVisible(true);
            return;
        }

        if (!validatePassword(register.password)) {
            setModalMessage(
                "Password must be at least 8 characters long and contain at least one uppercase letter."
            );
            setModalVisible(true);
            return;
        }

        if (register.password !== register.confirmPassword) {
            setModalMessage("Passwords do not match.");
            setModalVisible(true);
            return;
        }

        if (!register.email.endsWith("@cit.edu")) {
            setModalMessage("Email must be a valid @cit.edu address.");
            setModalVisible(true);
            return;
        }

        const userExists = await checkIfUserExists(
            register.idNumber,
            register.email
        );
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
                register.email,
                register.password
            );
            console.log("User registered:", userCredential.user);

            // Send email verification
            await sendEmailVerification(userCredential.user);
            console.log("Verification email sent.");

            // Store user data in Firestore (ensure not to store passwords in plain text)
            await setDoc(doc(FIREBASE_DB, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: register.email,
                userType:
                    register.selectedUserType === "teacher"
                        ? "pending"
                        : register.selectedUserType,
                firstName: register.firstName,
                middleName: register.middleName,
                lastName: register.lastName,
                idNumber: register.idNumber,
                createdAt: new Date(),
            });

            // Store user data in AsyncStorage
            await AsyncStorage.setItem(
                "userData",
                JSON.stringify({
                    name: `${register.firstName} ${register.middleName} ${register.lastName}`,
                    studentId: register.idNumber,
                    email: register.email,
                })
            );
            console.log("User data stored in AsyncStorage");

            console.log("User added to Firestore");
            setModalMessage(
                "Registration successful! Please check your email to confirm your account."
            );
            setModalVisible(true);

            // After successful registration, navigate to the login page
            router.push("/auth/login");
        } catch (error) {
            console.error("Error registering user:", error);
            setModalMessage(
                (error as any).message ||
                    "An error occurred during registration."
            );
            setModalVisible(true);
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
                        value={register.email}
                        onChangeText={(text) =>
                            setRegister({ ...register, email: text })
                        }
                    />

                    <View style={styles.nameContainer}>
                        <TextInput
                            style={[styles.input, styles.nameInput]}
                            placeholder="Firstname"
                            placeholderTextColor="#999"
                            value={register.firstName}
                            onChangeText={(text) =>
                                setRegister({ ...register, firstName: text })
                            }
                        />
                        <TextInput
                            style={[styles.input, styles.nameInput]}
                            placeholder="Middle Name"
                            placeholderTextColor="#999"
                            value={register.middleName}
                            onChangeText={(text) =>
                                setRegister({ ...register, middleName: text })
                            }
                        />
                        <TextInput
                            style={[styles.input, styles.nameInput]}
                            placeholder="Lastname"
                            placeholderTextColor="#999"
                            value={register.lastName}
                            onChangeText={(text) =>
                                setRegister({ ...register, lastName: text })
                            }
                        />
                    </View>

                    <TextInput
                        style={styles.input}
                        placeholder="ID Number"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={register.idNumber}
                        onChangeText={(text) =>
                            setRegister({ ...register, idNumber: text })
                        }
                    />

                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            placeholderTextColor="#999"
                            secureTextEntry={!showPassword}
                            value={register.password}
                            onChangeText={(text) =>
                                setRegister({ ...register, password: text })
                            }
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
                            value={register.confirmPassword}
                            onChangeText={(text) =>
                                setRegister({
                                    ...register,
                                    confirmPassword: text,
                                })
                            }
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
                            selectedValue={register.selectedUserType}
                            onValueChange={(itemValue) =>
                                setRegister({
                                    ...register,
                                    selectedUserType: itemValue,
                                })
                            }
                        >
                            <Picker.Item label="Select User Type" value="" />
                            <Picker.Item label="Student" value="student" />
                            <Picker.Item label="Teacher" value="teacher" />
                        </Picker>
                    </View>

                    <TouchableOpacity
                        style={styles.registerButton}
                        onPress={handleRegister}
                    >
                        <Text style={styles.registerButtonText}>REGISTER</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalMessage}>{modalMessage}</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalCloseText}>Close</Text>
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
    modalMessage: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    modalCloseText: {
        color: "#1E90FF",
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: "#f1c40f",
        paddingVertical: 15,
        borderRadius: 8,
        padding: 5,
        alignItems: "center",
    },
    registerButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default Register;
