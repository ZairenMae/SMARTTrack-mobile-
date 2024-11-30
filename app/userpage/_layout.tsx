import React, { useState } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Pressable,
    ImageBackground,
} from "react-native";
import { Tabs, useRouter } from "expo-router"; // Use `useRouter` for navigation
import { MyTabBar } from "@/components/TabBar";
import { Feather } from "@expo/vector-icons";
import SideBar from "@/components/SideBar";

const TabLayout = () => {
    const [isSidebarVisible, setSidebarVisible] = useState(false);
    const router = useRouter(); // Use router for navigation

    const toggleSidebar = () => {
        setSidebarVisible((prev) => !prev);
    };

    const handleOutsidePress = () => {
        if (isSidebarVisible) {
            setSidebarVisible(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Overlay to detect outside clicks and close the sidebar */}
            {isSidebarVisible && (
                <Pressable onPress={handleOutsidePress}>
                    <View style={styles.overlay} />
                </Pressable>
            )}

            {/* SideBar rendering */}
            <View style={styles.sidebarContainer}>
                {isSidebarVisible && <SideBar navigation={router} />}{" "}
                {/* Pass router */}
            </View>

            {/* Main content with Tabs */}
            <View style={styles.contentContainer}>
                <Tabs
                    tabBar={(props) => <MyTabBar {...props} />}
                    screenOptions={{
                        headerLeft: () => (
                            <TouchableOpacity
                                onPress={toggleSidebar}
                                style={styles.menuButton}
                            >
                                <Feather
                                    name="menu"
                                    size={24}
                                    color="#F5C722"
                                />
                            </TouchableOpacity>
                        ),
                        headerTitleAlign: "center",
                        headerRight: () => (
                            <ImageBackground
                                source={require("@/assets/images/logo.png")}
                                style={styles.circleButton}
                            />
                        ),
                        headerStyle: {
                            backgroundColor: "#8A252C", // Set the header background color
                            elevation: 5, // Ensure header stays on top
                        },
                        headerTintColor: "#F5C722",
                    }}
                >
                    <Tabs.Screen name="home" options={{ title: "Home" }} />
                    <Tabs.Screen name="room" options={{ title: "Room" }} />
                    <Tabs.Screen name="report" options={{ title: "Report" }} />
                    <Tabs.Screen
                        name="schedule"
                        options={{ title: "Schedule" }}
                    />
                    <Tabs.Screen name="index" options={{ title: "Index" }} />
                </Tabs>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: "relative",
    },
    contentContainer: {
        flex: 1,
    },
    menuButton: {
        marginLeft: 20,
    },
    circleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F5C722", // Customize the circle color
        marginRight: 20, // Adjust spacing from the right
    },
    sidebarContainer: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000, // Sidebar zIndex should be below header zIndex but above content
    },
    overlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent overlay
        zIndex: 999, // Ensure it's behind the header but above the content
    },
});

export default TabLayout;
