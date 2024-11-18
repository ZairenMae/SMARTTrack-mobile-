import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

const SideBar = ({ navigation }: any) => {
  // Move userData to the top
  const userData = {
    name: "Zairen Mae A. Niñofranco",
    studentId: "00-0000-000",
    email: "zairenmae.niñofranco@cit.edu",
  };

  const menuItems: { title: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[] = [
    { title: "Notification", icon: "notifications-outline", onPress: () => {} },
    { title: "About", icon: "information-circle-outline", onPress: () => {} },
  ];

  return (
    <View style={styles.sidebarContainer}>
      {/* Upper Section with SVG */}
      <Svg height="50%" width="100%" style={styles.upper}>
        <Polygon points="0,0 240,0 240,100 0,200" fill="#FFF" />
      </Svg>

      {/* Lower Section */}
      <View style={styles.lower}>
        {/* Move User Profile above Menu Items */}
        <View style={styles.profileContainer}>
          <Ionicons name="person-circle-outline" size={50} color="#FFC107" />
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileId}>{userData.studentId}</Text>
          <Text style={styles.profileEmail}>{userData.email}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={20} color="#FFF" />
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            console.log("Logging out...");
          }}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    position: "absolute",
    top: 63,
    left: 0,
    width: 240,
    height: "100%",
    backgroundColor: "#8A252C",
    zIndex: 1,
  },
  upper: {
    left: 0,
  },
  lower: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start", // Ensures proper alignment of content
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
  profileEmail: {
    fontSize: 12,
    color: "#FFF",
    textAlign: "center",
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
});

export default SideBar;
