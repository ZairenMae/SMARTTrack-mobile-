import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import { getDocs, query, where, collection } from "firebase/firestore";

class LoginState {
    idNumber: string;
    password: string;

    constructor() {
        this.idNumber = "";
        this.password = "";
    }
}

export default function Login() {
    const [login, setLogin] = useState<LoginState>({
        idNumber: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetEmail, setResetEmail] = useState(""); // State for password reset email
    const [isCardVisible, setIsCardVisible] = useState(false); // State to control card visibility
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility
    const [modalMessage, setModalMessage] = useState(""); // Modal message content
    const router = useRouter();
    const auth = FIREBASE_AUTH;

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleIdNumberChange = (text: string) => {
        setLogin((prevLogin) => ({
            ...prevLogin,
            idNumber: text,
        }));
    };

    const handlePasswordChange = (text: string) => {
        setLogin((prevLogin) => ({
            ...prevLogin,
            password: text,
        }));
    };

    // Function to display modal with a message
    const showModal = (message: string) => {
        setModalMessage(message);
        setModalVisible(true);
    };

    const handleSignIn = async () => {
        if (!login.idNumber || !login.password) {
            showModal(
                "Please fill out both the ID Number/Email and password fields."
            );
            return;
        }

        setLoading(true);

        try {
            let email;

            // Check if input is an email
            if (login.idNumber.includes("@")) {
                email = login.idNumber;
            } else {
                // Sanitize and validate ID number
                const sanitizedIdNumber = login.idNumber.trim();

                // Validate the format (e.g., 00-0000-000)
                const regex = /^(\d{2})-(\d{4})-(\d{3})$/;
                if (!regex.test(sanitizedIdNumber)) {
                    showModal("Invalid ID number format. Use 00-0000-000.");
                    setLoading(false);
                    return;
                }

                // Query Firestore for the ID number
                const userQuery = query(
                    collection(FIREBASE_DB, "users"),
                    where("idNumber", "==", sanitizedIdNumber)
                );

                const querySnapshot = await getDocs(userQuery);

                if (querySnapshot.empty) {
                    showModal("No user found with this ID Number.");
                    setLoading(false);
                    return;
                }

                // Use the email from Firestore
                email = querySnapshot.docs[0].data().email;
            }

            console.log("Attempting to sign in with email:", email);

            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                login.password
            );
            console.log("User signed in:", userCredential.user.email);

            // Navigate based on role
            const userQuery = query(
                collection(FIREBASE_DB, "users"),
                where("email", "==", email)
            );
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                if (userData.userType === "teacher") {
                    router.push("/facultypage/home");
                } else if (userData.userType === "student") {
                    router.push("/userpage/home");
                } else if (userData.userType === "admin") {
                    router.push("/admin/home");
                } else {
                    showModal("Unknown user type.");
                }
            } else {
                showModal("User data not found.");
            }
        } catch (error) {
            console.error("Error:", error);
            showModal("Invalid ID Number or Password.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!resetEmail) {
            showModal("Please enter your email address.");
            return;
        }

        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            showModal("Password reset link sent! Please check your email.");
            setIsCardVisible(false); // Close the card after success
        } catch (error) {
            console.error(error);
            showModal(
                "Failed to send password reset link. Please try again later."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require("../../assets/images/logo.png")}
                style={styles.logo}
            />
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.signInText}>
                Sign in to access your account
            </Text>

            <View style={styles.loginContainer}>
                <Text style={styles.loginLabel}>LOGIN</Text>

                <Text style={styles.loginLabel}>ID Number</Text>
                <TextInput
                    style={styles.input}
                    placeholder=""
                    value={login.idNumber}
                    onChangeText={handleIdNumberChange}
                />

                <Text style={styles.loginLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder=""
                        secureTextEntry={!showPassword}
                        value={login.password}
                        onChangeText={handlePasswordChange}
                    />

                    {loading ? (
                        <ActivityIndicator size="large" color="#FFC107" />
                    ) : null}
                    <MaterialCommunityIcons
                        name={showPassword ? "eye-off" : "eye"}
                        size={24}
                        color="#aaa"
                        style={styles.icon}
                        onPress={toggleShowPassword}
                    />
                </View>

                <View style={styles.forgotPasswordContainer}>
                    <TouchableOpacity onPress={() => setIsCardVisible(true)}>
                        <Text style={styles.forgotPasswordText}>
                            Forgot password?
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.signInButton}
                    onPress={handleSignIn}
                >
                    <Text style={styles.signInButtonText}>SIGN IN</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() =>
                        router.push({ pathname: "/auth/register", params: {} })
                    }
                >
                    <Text style={styles.registerText}>
                        Not a member?{" "}
                        <Text style={styles.registerLink}>Register now</Text>
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Card for Forgot Password */}
            {isCardVisible && (
                <View style={styles.cardContainer}>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>
                            Reset Your Password
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your ID number"
                            value={resetEmail}
                            onChangeText={setResetEmail}
                        />
                        {loading ? (
                            <ActivityIndicator size="large" color="#FFC107" />
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={styles.cardButton}
                                    onPress={handleForgotPassword}
                                >
                                    <Text style={styles.cardButtonText}>
                                        Send Reset Link
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.cardButton,
                                        { backgroundColor: "#800000" },
                                    ]}
                                    onPress={() => setIsCardVisible(false)}
                                >
                                    <Text style={styles.cardButtonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            )}

            {/* Modal for alerts */}
            <Modal
                visible={modalVisible}
                transparent={true}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#F5F5F5",
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 5,
    },
    signInText: {
        fontSize: 16,
        color: "#888",
        marginBottom: 20,
    },
    loginContainer: {
        width: "100%",
        padding: 20,
        backgroundColor: "#FFF",
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 5,
    },
    loginLabel: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    input: {
        width: "100%",
        height: 50,
        borderRadius: 5,
        borderColor: "#ccc",
        borderWidth: 1,
        paddingLeft: 10,
        marginBottom: 15,
    },
    passwordContainer: {
        position: "relative",
        marginBottom: 10,
    },
    icon: {
        position: "absolute",
        right: 10,
        top: 12,
    },
    forgotPasswordContainer: {
        alignItems: "flex-end",
        marginBottom: 20,
    },
    forgotPasswordText: {
        color: "#1E90FF",
        textDecorationLine: "underline",
    },
    signInButton: {
        width: "100%",
        backgroundColor: "#FFC107",
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 20,
    },
    signInButtonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
    },
    registerText: {
        fontSize: 14,
        color: "#888",
    },
    registerLink: {
        color: "#1E90FF",
        textDecorationLine: "underline",
    },
    cardContainer: {
        position: "absolute",
        top: "30%",
        left: "10%",
        right: "10%",
        backgroundColor: "rgba(0,0,0,0.5)", // Dim the background
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        borderRadius: 10,
        elevation: 10,
    },
    card: {
        backgroundColor: "#FFF",
        width: "100%",
        padding: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 5,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    cardButton: {
        backgroundColor: "#000000",
        paddingVertical: 15,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: "center",
    },
    cardButtonText: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: "#800000",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 5,
        alignItems: "center",
    },
    modalButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
