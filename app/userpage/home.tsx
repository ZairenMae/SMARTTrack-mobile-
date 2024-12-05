import { StyleSheet, Text, View, Button } from "react-native";
import React, { useState } from "react";
import useViewLocation from "../../hooks/useViewLocation";
import CardRoom from "@/components/cards/CardRoom";

const Home = () => {
    const { address, error } = useViewLocation();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text>Welcome!</Text>
                {address ? (
                    <Text>Address: {address}</Text>
                ) : (
                    <Text>{error || "Fetching address..."}</Text>
                )}
            </View>
            <View style={styles.room}>
                {/* <CardRoom name="NSTP 1" section="G2" startTime="walay time" />
                <CardRoom name="NSTP 1" section="G2" startTime="walay time" /> */}
            </View>
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
    },
    header: {
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#D9D9D9",
        height: "30%",
        width: "100%",
        fontFamily: "sans-serif",
    },
    room: {
        width: "100%",
    },
});
