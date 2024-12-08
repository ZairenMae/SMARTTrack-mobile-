import React from "react";
import { Stack } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function RootLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                setIsAuthenticated(!!token);
            } catch (error) {
                console.error("Failed to check authentication", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                <Stack.Screen name="(tabs)" />
            ) : (
                <>
                    <Stack.Screen name="auth/login" />
                    <Stack.Screen name="auth/register" />
                    <Stack.Screen name="FacultyPage" />
                    <Stack.Screen name="UserPage" />
                </>
            )}
        </Stack>
    );
}

const LoadingScreen = () => {
    return (
        <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    box: {
        // React Native styles
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5, // Android
    },
});
