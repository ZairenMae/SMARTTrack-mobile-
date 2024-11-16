import React, { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator,} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDocs, query, where, collection } from "firebase/firestore";

export default function Login() {
    const [idNumber, setIdNumber] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const auth = FIREBASE_AUTH;

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSignIn = async () => {
        setLoading(true);
    
        try {
            // Sign in with Firebase Authentication
            const userCredential = await signInWithEmailAndPassword(auth, idNumber + "@domain.com", password);
    
            const user = userCredential.user;
    
            // Query Firestore to get user role
            const userQuery = query(
                collection(FIREBASE_DB, "users"),
                where("idNumber", "==", idNumber)
            );
            const querySnapshot = await getDocs(userQuery);
    
            if (querySnapshot.empty) {
                alert("User role not found in Firestore");
                setLoading(false);
                return;
            }
    
            const userData = querySnapshot.docs[0].data();
    
            // Redirect based on user type
            if (userData.userType === "teacher") {
                router.push("/facultypage/home");
            } else if (userData.userType === "student") {
                router.push("/userpage/home");
            }
    
            console.log("User signed in:", user.email);
        } catch (error) {
            console.error(error);
            if ((error as any).code === "auth/wrong-password") {
                alert("Incorrect password");
            } else if ((error as any).code === "auth/user-not-found") {
                alert("User not found");
            } else {
                alert("Error signing in: " + (error as any).message);
            }
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
                    value={idNumber}
                    onChangeText={setIdNumber}
                />

                <Text style={styles.loginLabel}>Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder=""
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
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
                    <TouchableOpacity
                        onPress={() =>
                            router.push("/auth/forgot-password" as any)
                        }
                    >
                        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
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
});
