import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import Svg, { Polygon } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";

const SideBar = ({ navigation }: any) => {
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
      {/* SVG Design */}
      <Svg height="150" width="100%" style={styles.upper}>
        <Polygon points="240,0 0,0 0,150 240,100" fill="#FFF" />
      </Svg>

      {/* Scrollable Content */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileContainer}>
          <Ionicons name="person-circle-outline" size={50} color="#FFC107" />
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileId}>{userData.studentId}</Text>
          <Text style={styles.profileEmail}>{userData.email}</Text>
        </View>

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
      </ScrollView>

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
