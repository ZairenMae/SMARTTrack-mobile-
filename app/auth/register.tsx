import React, { Component } from "react";
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
    getDoc,
    getDocs,
    query,
    collection,
    where,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface RegisterState {
    showPassword: boolean;
    email: string;
    password: string;
    confirmPassword: string;
    selectedUserType: string;
    firstName: string;
    middleName: string;
    lastName: string;
    idNumber: string;
    modalVisible: boolean;
    modalMessage: string;
}

class Register extends Component<{}, RegisterState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            showPassword: false,
            email: "",
            password: "",
            confirmPassword: "",
            selectedUserType: "",
            firstName: "",
            middleName: "",
            lastName: "",
            idNumber: "",
            modalVisible: false,
            modalMessage: "",
        };
    }

    toggleShowPassword = (): void => {
        this.setState((prevState) => ({
            showPassword: !prevState.showPassword,
        }));
    };

    validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    validateIdNumber = (idNumber: string): boolean => {
        const idNumberRegex = /^\d{2}-\d{4}-\d{3}$/;
        return idNumberRegex.test(idNumber);
    };

    validatePassword = (password: string): boolean => {
        const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
        return passwordRegex.test(password);
    };

    checkIfUserExists = async (idNumber: string, email: string): Promise<boolean> => {
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

    handleRegister = async (): Promise<void> => {
        const {
            email,
            password,
            confirmPassword,
            selectedUserType,
            firstName,
            middleName,
            lastName,
            idNumber,
        } = this.state;

        if (
            !email ||
            !password ||
            !confirmPassword ||
            !selectedUserType ||
            !firstName ||
            !lastName ||
            !idNumber
        ) {
            this.setModal("Please fill in all fields.");
            return;
        }

        if (!this.validateEmail(email)) {
            this.setModal("Please enter a valid email.");
            return;
        }

        if (!this.validateIdNumber(idNumber)) {
            this.setModal("Please enter a valid ID number (e.g., 12-3456-789).");
            return;
        }

        if (!this.validatePassword(password)) {
            this.setModal(
                "Password must be at least 8 characters long and contain at least one uppercase letter."
            );
            return;
        }

        if (password !== confirmPassword) {
            this.setModal("Passwords do not match.");
            return;
        }

        if (!email.endsWith("@cit.edu")) {
            this.setModal("Email must be a valid @cit.edu address.");
            return;
        }

        const userExists = await this.checkIfUserExists(idNumber, email);
        if (userExists) {
            this.setModal("This ID number or email address is already registered.");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(
                FIREBASE_AUTH,
                email,
                password
            );

            // Send email verification
            await sendEmailVerification(userCredential.user);

            // Store user data in Firestore
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

            this.setModal("Registration successful!");

            // Navigate based on user type
            // Note: Navigation logic needs to be implemented.
        } catch (error: any) {
            this.setModal(error.message || "An error occurred during registration.");
        }
    };

    setModal = (message: string): void => {
        this.setState({
            modalMessage: message,
            modalVisible: true,
        });
    };

    closeModal = (): void => {
        this.setState({
            modalVisible: false,
        });
    };

    render() {
        const {
            showPassword,
            email,
            password,
            confirmPassword,
            selectedUserType,
            firstName,
            middleName,
            lastName,
            idNumber,
            modalVisible,
            modalMessage,
        } = this.state;
    
        return (
            <ScrollView contentContainerStyle={styles.container}>
                <ImageBackground
                    source={require("../../assets/images/logo.png")}
                    style={styles.backgroundImage}
                    resizeMode="cover"
                >
                    <View style={styles.formContainer}>
                        <Text style={styles.title}>REGISTRATION</Text>
                        
                        {/* Email Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={(text) => this.setState({ email: text })}
                        />
    
                        {/* Name Inputs */}
                        <View style={styles.nameContainer}>
                            <TextInput
                                style={[styles.input, styles.nameInput]}
                                placeholder="First Name"
                                placeholderTextColor="#999"
                                value={firstName}
                                onChangeText={(text) => this.setState({ firstName: text })}
                            />
                            <TextInput
                                style={[styles.input, styles.nameInput]}
                                placeholder="Middle Name"
                                placeholderTextColor="#999"
                                value={middleName}
                                onChangeText={(text) => this.setState({ middleName: text })}
                            />
                            <TextInput
                                style={[styles.input, styles.nameInput]}
                                placeholder="Last Name"
                                placeholderTextColor="#999"
                                value={lastName}
                                onChangeText={(text) => this.setState({ lastName: text })}
                            />
                        </View>
    
                        {/* ID Number Input */}
                        <TextInput
                            style={styles.input}
                            placeholder="ID Number"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={idNumber}
                            onChangeText={(text) => this.setState({ idNumber: text })}
                        />
    
                        {/* Password Input */}
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={(text) => this.setState({ password: text })}
                            />
                            <MaterialCommunityIcons
                                name={showPassword ? "eye-off" : "eye"}
                                size={24}
                                color="#aaa"
                                style={styles.icon}
                                onPress={this.toggleShowPassword}
                            />
                        </View>
    
                        {/* Confirm Password Input */}
                        <View style={styles.passwordContainer}>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm Password"
                                placeholderTextColor="#999"
                                secureTextEntry={!showPassword}
                                value={confirmPassword}
                                onChangeText={(text) => this.setState({ confirmPassword: text })}
                            />
                            <MaterialCommunityIcons
                                name={showPassword ? "eye-off" : "eye"}
                                size={24}
                                color="#aaa"
                                style={styles.icon}
                                onPress={this.toggleShowPassword}
                            />
                        </View>
    
                        {/* User Type Picker */}
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedUserType}
                                onValueChange={(itemValue) =>
                                    this.setState({ selectedUserType: itemValue })
                                }
                                style={styles.picker}
                            >
                                <Picker.Item label="Select User Type" value="" />
                                <Picker.Item label="Teacher/Faculty" value="teacher" />
                                <Picker.Item label="Student" value="student" />
                            </Picker>
                        </View>
    
                        {/* Register Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={this.handleRegister}
                        >
                            <Text style={styles.buttonText}>SIGN UP</Text>
                        </TouchableOpacity>
                    </View>
                </ImageBackground>
    
                {/* Modal for messages */}
                <Modal transparent={true} visible={modalVisible} onRequestClose={this.closeModal}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>{modalMessage}</Text>
                            <TouchableOpacity
                                onPress={this.closeModal}
                                style={styles.modalButton}
                            >
                                <Text style={styles.modalButtonText}>OK</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
    
}


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