import React, { Component } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { FIREBASE_DB } from "@/FirebaseConfig";
import ModalComponent from "../../components/modal/Modal";

interface User {
    userName: string;
    section: string;
    checkInTime: string;
    thresholdTime: string;
    date: string;
    status: string;
}

interface DashboardReportState {
    leaderboard: User[];
    modalVisible: boolean;
}

class DashboardReport extends Component<{}, DashboardReportState> {
    private unsubscribe: (() => void) | undefined;

    constructor(props: {}) {
        super(props);
        this.state = {
            leaderboard: [], // Initialize with an empty array
            modalVisible: false,
        };
    }

    componentDidMount() {
        this.subscribeToLeaderboard();
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    subscribeToLeaderboard = () => {
        this.unsubscribe = onSnapshot(
            collection(FIREBASE_DB, "earlyWorms"),
            (snapshot) => {
                const users = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        userName: data.userName || "No Name",
                        section: data.section || "No Section",
                        checkInTime: data.checkInTime || "00:00",
                        thresholdTime: data.thresholdTime || "00:00",
                        date: data.date?.toDate().toLocaleDateString() || "No Date",
                        status: data.status || "No Status",
                    };
                });

                const sortedUsers = users.sort(
                    (a, b) =>
                        new Date(`1970-01-01T${a.checkInTime}`).getTime() -
                        new Date(`1970-01-01T${b.checkInTime}`).getTime()
                );

                this.setState({ leaderboard: sortedUsers });
            }
        );
    };

    renderDynamicCard = () => {
        const { leaderboard } = this.state; // Ensure leaderboard is destructured safely
        if (!leaderboard || leaderboard.length === 0) {
            return <Text>No Early Worms Found</Text>;
        }

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => this.setState({ modalVisible: true })}
            >
                <Text style={styles.cardTitle}>Daily Attendance</Text>
                <View style={styles.infoContainer}>
                    <Text style={styles.progressHeader}>Earliest Time In</Text>
                    <Text style={styles.progressValue}>{leaderboard[0].userName}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    render() {
        const { modalVisible, leaderboard } = this.state;

        return (
            <View style={styles.dashboardReport}>
                <Text style={styles.headerText}>Dashboard Report</Text>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.cardContainer}>
                        {this.renderDynamicCard()}
                    </View>
                </ScrollView>

                {leaderboard.length > 0 && (
                   <ModalComponent
                   visible={modalVisible}
                   onClose={() => this.setState({ modalVisible: false })}
                   title="Early Worm Leaderboard"
                   message={leaderboard
                       .map(
                           (user, index) =>
                               `${index + 1}. Name: ${user.userName}\n   Section: ${
                                   user.section
                               }\n   Check-In: ${user.checkInTime}\n   Status: ${user.status}`
                       )
                       .join("\n\n")}
                   buttons={[
                       {
                           text: "Close",
                           action: () => this.setState({ modalVisible: false }),
                           color: "gray",
                       },
                   ]}
                   onPress={() => {}}
               />
               
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    dashboardReport: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 16,
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 16,
        color: "#900",
    },
    cardContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    card: {
        height: 270,
        width: 220,
        borderWidth: 1,
        borderColor: "#666666",
        borderRadius: 25,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
        backgroundColor: "#fff",
        overflow: "hidden",
        justifyContent: "center",
        alignItems: "center",
        margin: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 5,
        textAlign: "center",
    },
    infoContainer: {
        padding: 10,
        alignItems: "center",
        backgroundColor: "rgb(138, 37, 44)",
        width: "100%",
    },
    progressHeader: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
        marginBottom: 5,
    },
    progressValue: {
        fontSize: 24,
        fontWeight: "bold",
        color: "rgb(245, 199, 34)",
    },
});

export default DashboardReport;
