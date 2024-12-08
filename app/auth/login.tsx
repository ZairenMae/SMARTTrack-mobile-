import React, { Component } from "react";
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
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
} from "firebase/auth";
import { getDocs, query, where, collection } from "firebase/firestore";

interface LoginState {
    idNumber: string;
    password: string;
    showPassword: boolean;
    loading: boolean;
    resetEmail: string;
    isCardVisible: boolean;
    modalVisible: boolean;
    modalMessage: string;
}

export default class Login extends Component<{}, LoginState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            idNumber: "",
            password: "",
            showPassword: false,
            loading: false,
            resetEmail: "",
            isCardVisible: false,
            modalVisible: false,
            modalMessage: "",
        };
    }

    toggleShowPassword = (): void => {
        this.setState((prevState) => ({
            showPassword: !prevState.showPassword,
        }));
    };

    showModal = (message: string): void => {
        this.setState({
            modalMessage: message,
            modalVisible: true,
        });
    };

    handleSignIn = async (): Promise<void> => {
        const { idNumber, password } = this.state;

        if (!idNumber || !password) {
            this.showModal("Please fill out both the ID Number/Email and password fields.");
            return;
        }

        this.setState({ loading: true });

        try {
            let email: string;

            // Check if input is an email
            if (idNumber.includes("@")) {
                email = idNumber;
            } else {
                const sanitizedIdNumber = idNumber.trim();

                const regex = /^(\d{2})-(\d{4})-(\d{3})$/;
                if (!regex.test(sanitizedIdNumber)) {
                    this.showModal("Invalid ID number format. Use 00-0000-000.");
                    this.setState({ loading: false });
                    return;
                }

                const userQuery = query(
                    collection(FIREBASE_DB, "users"),
                    where("idNumber", "==", sanitizedIdNumber)
                );

                const querySnapshot = await getDocs(userQuery);

                if (querySnapshot.empty) {
                    this.showModal("No user found with this ID Number.");
                    this.setState({ loading: false });
                    return;
                }

                email = querySnapshot.docs[0].data().email;
            }

            console.log("Attempting to sign in with email:", email);

            const userCredential = await signInWithEmailAndPassword(
                FIREBASE_AUTH,
                email,
                password
            );

            console.log("User signed in:", userCredential.user.email);

            const userQuery = query(
                collection(FIREBASE_DB, "users"),
                where("email", "==", email)
            );
            const userSnapshot = await getDocs(userQuery);

            if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                const userType = userData.userType;
                if (userType === "teacher") {
                    console.log("Redirecting to Teacher Dashboard");
                } else if (userType === "student") {
                    console.log("Redirecting to Student Dashboard");
                } else if (userType === "admin") {
                    console.log("Redirecting to Admin Dashboard");
                } else {
                    this.showModal("Unknown user type.");
                }
            } else {
                this.showModal("User data not found.");
            }
        } catch (error) {
            console.error("Error:", error);
            this.showModal("An error occurred during sign-in.");
        } finally {
            this.setState({ loading: false });
        }
    };

    handleForgotPassword = async (): Promise<void> => {
        const { resetEmail } = this.state;

        if (!resetEmail) {
            this.showModal("Please enter your email address.");
            return;
        }

        this.setState({ loading: true });

        try {
            await sendPasswordResetEmail(FIREBASE_AUTH, resetEmail);
            this.showModal("Password reset link sent! Please check your email.");
            this.setState({ isCardVisible: false });
        } catch (error) {
            console.error(error);
            this.showModal("Failed to send password reset link. Please try again later.");
        } finally {
            this.setState({ loading: false });
        }
    };

    render() {
        const {
            idNumber,
            password,
            showPassword,
            loading,
            resetEmail,
            isCardVisible,
            modalVisible,
            modalMessage,
        } = this.state;

        return (
            <View style={styles.container}>
                <Image
                    source={require("../../assets/images/logo.png")}
                    style={styles.logo}
                />
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.signInText}>Sign in to access your account</Text>

                <View style={styles.loginContainer}>
                    <Text style={styles.loginLabel}>LOGIN</Text>

                    <Text style={styles.loginLabel}>ID Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder=""
                        value={idNumber}
                        onChangeText={(text) => this.setState({ idNumber: text })}
                    />

                    <Text style={styles.loginLabel}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder=""
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

                    {loading && <ActivityIndicator size="large" color="#FFC107" />}

                    <View style={styles.forgotPasswordContainer}>
                        <TouchableOpacity onPress={() => this.setState({ isCardVisible: true })}>
                            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.signInButton}
                        onPress={this.handleSignIn}
                    >
                        <Text style={styles.signInButtonText}>SIGN IN</Text>
                    </TouchableOpacity>

                    <TouchableOpacity>
                        <Text style={styles.registerText}>
                            Not a member? <Text style={styles.registerLink}>Register now</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

                {isCardVisible && (
                    <View style={styles.cardContainer}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Reset Your Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={resetEmail}
                                onChangeText={(text) => this.setState({ resetEmail: text })}
                            />
                            <TouchableOpacity
                                style={styles.cardButton}
                                onPress={this.handleForgotPassword}
                            >
                                <Text style={styles.cardButtonText}>Send Reset Link</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.cardButton, { backgroundColor: "#800000" }]}
                                onPress={() => this.setState({ isCardVisible: false })}
                            >
                                <Text style={styles.cardButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <Modal
                    visible={modalVisible}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => this.setState({ modalVisible: false })}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalText}>{modalMessage}</Text>
                            <TouchableOpacity
                                onPress={() => this.setState({ modalVisible: false })}
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
