import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    ActivityIndicator,
} from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_AUTH, FIREBASE_DB } from "@/FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "expo-router";

const SideBar = ({ navigation }: any) => {
    const [userData, setUserData] = useState({
        name: "",
        studentId: "",
    });
    const [loading, setLoading] = useState(true); // Track loading state

    const router = useRouter();

    // Fetch user data from Firestore and save it locally
    const fetchUserData = async (uid: string) => {
        try {
            const userDocRef = doc(FIREBASE_DB, "users", uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const data = userDoc.data();
                const user = {
                    name: `${data.firstName} ${data.lastName}`,
                    studentId: data.idNumber,
                };
                setUserData(user);

                // Save user data locally
                await AsyncStorage.setItem("userData", JSON.stringify(user));
            } else {
                console.error("User document does not exist!");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    // Load user data from AsyncStorage
    const loadUserDataFromStorage = async () => {
        try {
            const storedData = await AsyncStorage.getItem("userData");
            if (storedData) {
                setUserData(JSON.parse(storedData));
            }
        } catch (error) {
            console.error("Error loading user data from AsyncStorage:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            if (user) {
                fetchUserData(user.uid);
            } else {
                setLoading(false); // Stop loading if no user is signed in
            }
        });

        // Load cached user data initially
        loadUserDataFromStorage();

        return unsubscribe; // Cleanup listener
    }, []);

    const menuItems = [
        {
            title: "Notification",
            icon: "notifications-outline",
            onPress: () => {},
        },
        {
            title: "About",
            icon: "information-circle-outline",
            onPress: () => {},
        },
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFC107" />
            </View>
        );
    }

    return (
        <View style={styles.sidebarContainer}>
            {/* SVG Design */}
            <Svg height="150" width="100%" style={styles.upper}>
                <Polygon points="240,0 0,0 0,150 240,100" fill="#FFF" />
            </Svg>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.profileContainer}>
                    <Ionicons
                        name="person-circle-outline"
                        size={50}
                        color="#FFC107"
                    />
                    <Text style={styles.profileName}>
                        {userData.name || "Name not available"}
                    </Text>
                    <Text style={styles.profileId}>
                        {userData.studentId || "Student ID not available"}
                    </Text>
                </View>

                <View style={styles.menuContainer}>
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            onPress={item.onPress}
                        >
                            <Ionicons
                                name={
                                    "notifications-outline" as keyof typeof Ionicons.glyphMap
                                }
                                size={20}
                                color="#FFF"
                            />
                            <Text style={styles.menuText}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Logout Button */}
            <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={async () => {
                    try {
                        await FIREBASE_AUTH.signOut();
                        await AsyncStorage.clear();
                        console.log("User logged out successfully");
                        router.replace("/auth/login");
                    } catch (error) {
                        console.error("Error during logout:", error);
                    }
                    }}
                >
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
                        </View>
                    );
                };

const styles = StyleSheet.create({
    sidebarContainer: {
        position: "absolute",
        top: 63,
        left: 0,
        width: 240,
        height: Dimensions.get("window").height - 63,
        backgroundColor: "#8A252C",
        zIndex: 1,
    },
    upper: {
        position: "absolute",
        top: 0,
        left: 0,
    },
    scrollContent: {
        paddingTop: 150, // Leave space below SVG
        paddingHorizontal: 20,
        paddingBottom: 80, // Leave space for logout button
    },
    profileContainer: {
        alignItems: "center",
        marginBottom: 20,
    },
    profileName: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
        marginTop: 10,
    },
    profileId: {
        fontSize: 14,
        color: "#FFF",
        marginBottom: 5,
    },
    menuContainer: {
        marginTop: 20,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    menuText: {
        fontSize: 16,
        color: "#FFF",
        marginLeft: 10,
    },
    logoutButton: {
        position: "absolute",
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: "#FFC107",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    logoutText: {
        color: "#8A252C",
        fontWeight: "bold",
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#8A252C",
    },
});

export default SideBar;