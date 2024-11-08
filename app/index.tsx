// app/index.tsx
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SplashScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("userToken");
            if (token) {
                router.replace("/(tabs)"); // Navigate to tabs if authenticated
            } else {
                router.replace("/auth/login"); // Navigate to login if not authenticated
            }
        }; 

        setTimeout(() => {
            checkAuth();
        }, 2000); // Adjust delay as needed
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Welcome to MyApp!</Text>
            <Text style={styles.text}>Loading...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        color: "black",
    },
    text: {
        fontSize: 24,
        fontWeight: "bold",
    },
});
