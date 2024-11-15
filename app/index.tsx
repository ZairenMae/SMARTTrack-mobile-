import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, StyleSheet } from "react-native";
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
        <ImageBackground
            source={require("E:/4th yr/IT332/SmartTrack/NSTP/assets/images/Splash_logo.png")}
            style={styles.background}
            resizeMode="cover"
        >
            {/* Empty View to ensure the image covers the whole screen */}
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
});
