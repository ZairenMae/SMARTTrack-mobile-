import React, { Component } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Button,
    Platform,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { getAuth } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { FIREBASE_DB as db } from "@/FirebaseConfig";
import * as Notifications from "expo-notifications";
import * as Notifications from "expo-notifications";

class Event {
    id!: string;
    date!: string;
    title!: string;
    location!: string;
    description?: string;
    students?: string[];
    notify?: boolean;
    wholeDay?: boolean;
    startTime?: string;
    endTime?: string;
}

interface StudentScheduleState {
    events: Event[];
    selectedDate: string;
    selectedMonth: string;
    selectedEvent: Event | null;
}

interface StudentScheduleState {
    events: Event[];
    selectedDate: string;
    selectedMonth: string;
    selectedEvent: Event | null;
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

class StudentSchedule extends Component<{}, StudentScheduleState> {
    eventsCollection = collection(db, "events");

    constructor(props: {}) {
        super(props);
        this.state = {
            events: [],
            selectedDate: "",
            selectedMonth: "2024-09",
            selectedEvent: null,
        };
    }

    
    componentDidMount() {
        this.fetchEvents();
    }

    fetchEvents = async () => {
      try {
          const querySnapshot = await getDocs(this.eventsCollection);
          const fetchedEvents: Event[] = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
          })) as Event[];
  
          const getUserId = (): string | null => {
              const auth = getAuth();
              const user = auth.currentUser;
              return user ? user.uid : null;
          };
  
          const currentStudentId = getUserId();
  
          if (!currentStudentId) {
              console.error("No user is logged in or user ID is null.");
              return; 
          }
  
          const filteredEvents = fetchedEvents.filter((event) => 
              event.students?.includes(currentStudentId)
          );
  
          this.setState({ events: filteredEvents });
  
          filteredEvents.forEach((event) => {
              if (event.notify) {
                  this.scheduleEventNotification(event);
              }
          });
      } catch (error) {
          console.error("Error fetching events:", error);
      }
  };
  
    scheduleEventNotification = async (event: Event) => {
        if (Platform.OS !== "web") {
            const notificationTime = new Date(event.date);
            if (event.startTime) {
                const [hours, minutes] = event.startTime.split(":").map(Number);
                notificationTime.setHours(hours, minutes);
            }

            notificationTime.setMinutes(notificationTime.getMinutes() - 15);
            notificationTime.setMinutes(notificationTime.getMinutes() - 15);

            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `Upcoming Event: ${event.title}`,
                        body: `Don't forget about your event at ${event.startTime} on ${event.date}!`,
                    },
                    trigger: notificationTime,
                });
            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `Upcoming Event: ${event.title}`,
                        body: `Don't forget about your event at ${event.startTime} on ${event.date}!`,
                    },
                    trigger: notificationTime,
                });

                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "New Event Added",
                        body: `A new event titled "${event.title}" has been added to your schedule.`,
                    },
                    trigger: { seconds: 1 },
                });
            } catch (error) {
                console.error("Error scheduling notification:", error);
            }
        } else {
            console.log(
                "Web platform - notification scheduling is not supported."
            );
        }
    };

    filterEventsByMonth = () => {
        return this.state.events.filter((event) =>
            event.date.startsWith(this.state.selectedMonth)
        );
    };
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "New Event Added",
                        body: `A new event titled "${event.title}" has been added to your schedule.`,
                    },
                    trigger: { seconds: 1 },
                });
            } catch (error) {
                console.error("Error scheduling notification:", error);
            }
        } else {
            console.log(
                "Web platform - notification scheduling is not supported."
            );
        }
    };

    filterEventsByMonth = () => {
        return this.state.events.filter((event) =>
            event.date.startsWith(this.state.selectedMonth)
        );
    };

    handleSelectDate = (day: DateData) => {
        this.setState({ selectedDate: day.dateString });
    };

    handleSelectMonth = (month: { year: number; month: number }) => {
        this.setState({
            selectedMonth: `${month.year}-${String(month.month).padStart(
                2,
                "0"
            )}`,
        });
    };

    handleEventClick = (event: Event) => {
        this.setState({ selectedEvent: event });
    };

    handleCloseModal = () => {
        this.setState({ selectedEvent: null });
    };

    renderEvents = () => {
        return this.filterEventsByMonth().map((event) => (
            <TouchableOpacity
                key={event.id}
                onPress={() => this.handleEventClick(event)}
            >
                <View style={styles.eventCard}>
                    <View style={styles.eventDateContainer}>
                        <Text style={styles.eventDate}>
                            {new Date(event.date).getDate()}
                        </Text>
                        <Text style={styles.eventTime}>
                            {event.wholeDay
                                ? "ALL DAY"
                                : `${event.startTime || "N/A"} - ${
                                      event.endTime || "N/A"
                                  }`}
                        </Text>
                    </View>
                    <View style={styles.eventDetails}>
                        <View style={styles.eventTextContainer}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <Text style={styles.eventLocation}>
                                {event.location}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        ));
    };

    render() {
        const { selectedDate, selectedEvent } = this.state;

        const markedDates = this.state.events.reduce(
            (
                acc: Record<string, { marked: boolean; dotColor: string }>,
                event
            ) => {
                acc[event.date] = { marked: true, dotColor: "#FFD700" };
                return acc;
            },
            {}
        );

        return (
            <View style={styles.container}>
                <Calendar
                    onDayPress={this.handleSelectDate}
                    onMonthChange={this.handleSelectMonth}
                    markedDates={{
                        ...markedDates,
                        [selectedDate]: {
                            selected: true,
                            selectedColor: "#800000",
                        },
                    }}
                    theme={{
                        selectedDayBackgroundColor: "#800000",
                        todayTextColor: "#800000",
                        arrowColor: "#800000",
                    }}
                />
                <ScrollView
                    style={styles.eventsContainer}
                    contentContainerStyle={styles.eventsContentContainer}
                >
                    {this.renderEvents()}
                </ScrollView>
                {selectedEvent && (
                    <Modal
                        visible={true}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={this.handleCloseModal}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>
                                    {selectedEvent.title}
                                </Text>
                                <Text style={styles.modalText}>
                                    Date: {selectedEvent.date}
                                </Text>
                                <Text style={styles.modalText}>
                                    Time:{" "}
                                    {selectedEvent.wholeDay
                                        ? "8:00 AM - 5:00 PM"
                                        : `${
                                              selectedEvent.startTime || "N/A"
                                          } - ${
                                              selectedEvent.endTime || "N/A"
                                          }`}
                                </Text>
                                <Text style={styles.modalText}>
                                    Location: {selectedEvent.location}
                                </Text>
                                <Text style={styles.modalText}>
                                    Description:{" "}
                                    {selectedEvent.description ||
                                        "No description available"}
                                </Text>
                                <Button
                                    title="Close"
                                    onPress={this.handleCloseModal}
                                />
                            </View>
                        </View>
                    </Modal>
                )}
            </View>
        );
    }
}
    handleSelectDate = (day: DateData) => {
        this.setState({ selectedDate: day.dateString });
    };

    handleSelectMonth = (month: { year: number; month: number }) => {
        this.setState({
            selectedMonth: `${month.year}-${String(month.month).padStart(
                2,
                "0"
            )}`,
        });
    };

    handleEventClick = (event: Event) => {
        this.setState({ selectedEvent: event });
    };

    handleCloseModal = () => {
        this.setState({ selectedEvent: null });
    };

    renderEvents = () => {
        return this.filterEventsByMonth().map((event) => (
            <TouchableOpacity
                key={event.id}
                onPress={() => this.handleEventClick(event)}
            >
                <View style={styles.eventCard}>
                    <View style={styles.eventDateContainer}>
                        <Text style={styles.eventDate}>
                            {new Date(event.date).getDate()}
                        </Text>
                        <Text style={styles.eventTime}>
                            {event.wholeDay
                                ? "ALL DAY"
                                : `${event.startTime || "N/A"} - ${
                                      event.endTime || "N/A"
                                  }`}
                        </Text>
                    </View>
                    <View style={styles.eventDetails}>
                        <View style={styles.eventTextContainer}>
                            <Text style={styles.eventTitle}>{event.title}</Text>
                            <Text style={styles.eventLocation}>
                                {event.location}
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        ));
    };

    render() {
        const { selectedDate, selectedEvent } = this.state;

        const markedDates = this.state.events.reduce(
            (
                acc: Record<string, { marked: boolean; dotColor: string }>,
                event
            ) => {
                acc[event.date] = { marked: true, dotColor: "#FFD700" };
                return acc;
            },
            {}
        );

        return (
            <View style={styles.container}>
                <Calendar
                    onDayPress={this.handleSelectDate}
                    onMonthChange={this.handleSelectMonth}
                    markedDates={{
                        ...markedDates,
                        [selectedDate]: {
                            selected: true,
                            selectedColor: "#800000",
                        },
                    }}
                    theme={{
                        selectedDayBackgroundColor: "#800000",
                        todayTextColor: "#800000",
                        arrowColor: "#800000",
                    }}
                />
                <ScrollView
                    style={styles.eventsContainer}
                    contentContainerStyle={styles.eventsContentContainer}
                >
                    {this.renderEvents()}
                </ScrollView>
                {selectedEvent && (
                    <Modal
                        visible={true}
                        animationType="slide"
                        transparent={true}
                        onRequestClose={this.handleCloseModal}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>
                                    {selectedEvent.title}
                                </Text>
                                <Text style={styles.modalText}>
                                    Date: {selectedEvent.date}
                                </Text>
                                <Text style={styles.modalText}>
                                    Time:{" "}
                                    {selectedEvent.wholeDay
                                        ? "8:00 AM - 5:00 PM"
                                        : `${
                                              selectedEvent.startTime || "N/A"
                                          } - ${
                                              selectedEvent.endTime || "N/A"
                                          }`}
                                </Text>
                                <Text style={styles.modalText}>
                                    Location: {selectedEvent.location}
                                </Text>
                                <Text style={styles.modalText}>
                                    Description:{" "}
                                    {selectedEvent.description ||
                                        "No description available"}
                                </Text>
                                <Button
                                    title="Close"
                                    onPress={this.handleCloseModal}
                                />
                            </View>
                        </View>
                    </Modal>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    eventsContainer: {
        flex: 1,
        marginTop: 10,
    },
    eventsContentContainer: {
        paddingBottom: 20,
    },
    eventCard: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    eventDateContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    eventDate: {
        fontSize: 20,
        fontWeight: "bold",
    },
    eventTime: {
        fontSize: 12,
        color: "#777",
    },
    eventDetails: {
        marginTop: 10,
    },
    eventTextContainer: {
        marginTop: 10,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    eventLocation: {
        fontSize: 14,
        color: "#555",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 5,
    },
    container: {
        flex: 1,
        padding: 10,
    },
    eventsContainer: {
        flex: 1,
        marginTop: 10,
    },
    eventsContentContainer: {
        paddingBottom: 20,
    },
    eventCard: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: "#fff",
        borderRadius: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    eventDateContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    eventDate: {
        fontSize: 20,
        fontWeight: "bold",
    },
    eventTime: {
        fontSize: 12,
        color: "#777",
    },
    eventDetails: {
        marginTop: 10,
    },
    eventTextContainer: {
        marginTop: 10,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    eventLocation: {
        fontSize: 14,
        color: "#555",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    modalText: {
        fontSize: 16,
        marginBottom: 5,
    },
});

export default StudentSchedule;