import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { Polygon } from "react-native-svg";

const SideBar = ({ navigation }: any) => {
return (
<View style={styles.sidebarContainer}>
<Svg height="50%" width="100%" style={styles.upper}>
<Polygon points="0,0 240,0 240,100 0,200" fill="#FFF" />
</Svg>
<View style={styles.lower}></View>
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

lower: {},
});

export default SideBar;