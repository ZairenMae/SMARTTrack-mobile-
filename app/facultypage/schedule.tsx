import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Modal,
    TextInput,
    Button,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { FontAwesome5 } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";

interface Event {
    id: number;
    date: string;
    title: string;
    location: string;
    description?: string;
    students?: string;
    notify?: boolean;
    wholeDay?: boolean;
    startTime?: string;
    endTime?: string;
}

const initialEvents: Event[] = [
    {
        id: 1,
        date: "2024-09-07",
        title: "Health Program",
        location: "N. Bacalso Avenue, Cebu City, Philippines 6000",
    },
    {
        id: 2,
        date: "2024-09-10",
        title: "Cleaning Program",
        location: "N. Bacalso Avenue, Cebu City, Philippines 6000",
    },
    {
        id: 3,
        date: "2024-09-22",
        title: "Youth Program",
        location: "N. Bacalso Avenue, Cebu City, Philippines 6000",
    },
    {
        id: 4,
        date: "2024-10-05",
        title: "Environmental Program",
        location: "N. Bacalso Avenue, Cebu City, Philippines 6000",
    },
];

const ScheduleScreen = () => {
    const [events, setEvents] = useState<Event[]>(initialEvents);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>("2024-09");
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentEvent, setCurrentEvent] = useState<Event>({
        id: 0,
        date: "",
        title: "",
        location: "",
    });

    const markedDates = events.reduce(
        (acc: Record<string, { marked: boolean; dotColor: string }>, event) => {
            acc[event.date] = { marked: true, dotColor: "#FFD700" };
            return acc;
        },
        {}
    );

    const filterEventsByMonth = () => {
        return events.filter((event) => event.date.startsWith(selectedMonth));
    };

    // CREATE
    const handleAddEvent = () => {
        const newEvent = {
            ...currentEvent,
            id: Date.now(),
            date: selectedDate,
        };
        setEvents([...events, newEvent]);
        setModalVisible(false);
        setCurrentEvent({ id: 0, date: "", title: "", location: "" });
    };

    // READ
    const handleSelectDate = (day: DateData) => {
        setSelectedDate(day.dateString);
    };

    // UPDATE
    const handleEditEvent = (event: Event) => {
        setCurrentEvent(event);
        setIsEditing(true);
        setModalVisible(true);
    };

    const handleUpdateEvent = () => {
        const updatedEvents = events.map((event) =>
            event.id === currentEvent.id ? currentEvent : event
        );
        setEvents(updatedEvents);
        setModalVisible(false);
        setCurrentEvent({ id: 0, date: "", title: "", location: "" });
        setIsEditing(false);
    };

    // DELETE
    const handleDeleteEvent = (id: number) => {
        Alert.alert(
            "Delete Event",
            "Are you sure you want to delete this event?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        console.log("Deleting event...");
                        const updatedEvents = events.filter(
                            (event) => event.id !== id
                        );
                        console.log("Updated events:", updatedEvents);
                        setEvents(updatedEvents);
                    },
                },
            ],
            { cancelable: true }
        );
    };

    return (
        <View style={styles.container}>
            <Calendar
                onDayPress={(day: DateData) => handleSelectDate(day)}
                onMonthChange={(month: { year: number; month: number }) =>
                    setSelectedMonth(
                        `${month.year}-${String(month.month).padStart(2, "0")}`
                    )
                }
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
                {filterEventsByMonth().map((event) => (
                    <View key={event.id} style={styles.eventCard}>
                        <View style={styles.eventDateContainer}>
                            <Text style={styles.eventDate}>
                                {new Date(event.date).getDate()}
                            </Text>
                            {/* Show "ALL DAY" if wholeDay is true; otherwise, show startTime and endTime */}
                            <Text style={styles.eventTime}>
                                {event.wholeDay
                                    ? "ALL DAY"
                                    : `${event.startTime || "N/A"} - ${
                                          event.endTime || "N/A"
                                      }`}
                            </Text>
                        </View>
                        <View style={styles.eventDetails}>
                            <View
                                style={[
                                    styles.eventIndicator,
                                    {
                                        backgroundColor:
                                            event.id % 2 === 0
                                                ? "#FFD700"
                                                : "#800000",
                                    },
                                ]}
                            />
                            <View style={styles.eventTextContainer}>
                                <Text style={styles.eventTitle}>
                                    {event.title}
                                </Text>
                                <Text style={styles.eventLocation}>
                                    {event.location}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleEditEvent(event)}
                                style={{ paddingRight: 10 }}
                            >
                                <FontAwesome5
                                    name="edit"
                                    size={22}
                                    color="#800000"
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleDeleteEvent(event.id)}
                            >
                                <FontAwesome5
                                    name="minus-square"
                                    size={24}
                                    color="#800000"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {selectedDate && (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                        setModalVisible(true);
                        setIsEditing(false);
                        setCurrentEvent({
                            id: 0,
                            date: selectedDate,
                            title: "",
                            location: "",
                        });
                    }}
                >
                    <AntDesign name="pluscircle" style={styles.addButtonIcon} />
                </TouchableOpacity>
            )}

            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.createActivityContainer}>
                    <Text style={styles.modalHeader}>Create Activity</Text>

                    <TextInput
                        placeholder="Activity Name"
                        value={currentEvent.title}
                        onChangeText={(text) =>
                            setCurrentEvent({ ...currentEvent, title: text })
                        }
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Description"
                        value={currentEvent.description || ""}
                        onChangeText={(text) =>
                            setCurrentEvent({
                                ...currentEvent,
                                description: text,
                            })
                        }
                        style={[
                            styles.input,
                            { height: 80, textAlignVertical: "top" },
                        ]}
                        multiline
                    />

                    <TextInput
                        placeholder="Location"
                        value={currentEvent.location}
                        onChangeText={(text) =>
                            setCurrentEvent({ ...currentEvent, location: text })
                        }
                        style={styles.input}
                    />

                    <TextInput
                        placeholder="Add Student"
                        value={currentEvent.students || ""}
                        onChangeText={(text) =>
                            setCurrentEvent({ ...currentEvent, students: text })
                        }
                        style={styles.input}
                    />

                    <Text style={styles.dateLabel}>Date: {selectedDate}</Text>

                    <View style={styles.toggleContainer}>
                        <TouchableOpacity
                            onPress={() =>
                                setCurrentEvent({
                                    ...currentEvent,
                                    notify: !currentEvent.notify,
                                })
                            }
                            style={styles.toggleButton}
                        >
                            <FontAwesome5
                                name={
                                    currentEvent.notify
                                        ? "check-square"
                                        : "square"
                                }
                                size={24}
                                color="#800000"
                            />
                            <Text style={styles.toggleText}>Notify</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() =>
                                setCurrentEvent({
                                    ...currentEvent,
                                    wholeDay: !currentEvent.wholeDay,
                                })
                            }
                            style={styles.toggleButton}
                        >
                            <FontAwesome5
                                name={
                                    currentEvent.wholeDay
                                        ? "check-square"
                                        : "square"
                                }
                                size={24}
                                color="#800000"
                            />
                            <Text style={styles.toggleText}>Whole Day</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.timePickerContainer}>
                        <Text style={styles.timeLabel}>Time Start:</Text>
                        <View style={styles.timeRow}>
                            <TextInput
                                placeholder="HH"
                                value={
                                    currentEvent.startTime?.split(":")[0] || ""
                                }
                                onChangeText={(text) => {
                                    const [hours, minutes] = (
                                        currentEvent.startTime || "00:00 AM"
                                    ).split(/[: ]/);
                                    setCurrentEvent({
                                        ...currentEvent,
                                        startTime: `${text.padStart(2, "0")}:${
                                            minutes || "00"
                                        } ${
                                            currentEvent.startTime?.split(
                                                " "
                                            )[1] || "AM"
                                        }`,
                                    });
                                }}
                                style={styles.timeInput}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <Text style={styles.colon}>:</Text>
                            <TextInput
                                placeholder="MM"
                                value={
                                    currentEvent.startTime
                                        ?.split(":")[1]
                                        ?.split(" ")[0] || ""
                                }
                                onChangeText={(text) => {
                                    const [hours, minutes] = (
                                        currentEvent.startTime || "00:00 AM"
                                    ).split(/[: ]/);
                                    setCurrentEvent({
                                        ...currentEvent,
                                        startTime: `${
                                            hours || "00"
                                        }:${text.padStart(2, "0")} ${
                                            currentEvent.startTime?.split(
                                                " "
                                            )[1] || "AM"
                                        }`,
                                    });
                                }}
                                style={styles.timeInput}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.amPmToggle,
                                    currentEvent.startTime?.includes("AM")
                                        ? styles.activeToggle
                                        : null,
                                ]}
                                onPress={() => {
                                    const [hours, minutes] = (
                                        currentEvent.startTime || "00:00 AM"
                                    ).split(/[: ]/);
                                    setCurrentEvent({
                                        ...currentEvent,
                                        startTime: `${hours || "00"}:${
                                            minutes || "00"
                                        } AM`,
                                    });
                                }}
                            >
                                <Text style={styles.amPmText}>AM</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.amPmToggle,
                                    currentEvent.startTime?.includes("PM")
                                        ? styles.activeToggle
                                        : null,
                                ]}
                                onPress={() => {
                                    const [hours, minutes] = (
                                        currentEvent.startTime || "00:00 AM"
                                    ).split(/[: ]/);
                                    setCurrentEvent({
                                        ...currentEvent,
                                        startTime: `${hours || "00"}:${
                                            minutes || "00"
                                        } PM`,
                                    });
                                }}
                            >
                                <Text style={styles.amPmText}>PM</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.timeLabel}>Time End:</Text>
                        <View style={styles.timeRow}>
                            <TextInput
                                placeholder="HH"
                                value={
                                    currentEvent.endTime?.split(":")[0] || ""
                                }
                                onChangeText={(text) => {
                                    const [hours, minutes] = (
                                        currentEvent.endTime || "00:00 AM"
                                    ).split(/[: ]/);
                                    setCurrentEvent({
                                        ...currentEvent,
                                        endTime: `${text.padStart(2, "0")}:${
                                            minutes || "00"
                                        } ${
                                            currentEvent.endTime?.split(
                                                " "
                                            )[1] || "AM"
                                        }`,
                                    });
                                }}
                                style={styles.timeInput}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <Text style={styles.colon}>:</Text>
                            <TextInput
                                placeholder="MM"
                                value={
                                    currentEvent.endTime
                                        ?.split(":")[1]
                                        ?.split(" ")[0] || ""
                                }
                                onChangeText={(text) => {
                                    const [hours, minutes] = (
                                        currentEvent.endTime || "00:00 AM"
                                    ).split(/[: ]/);
                                    setCurrentEvent({
                                        ...currentEvent,
                                        endTime: `${
                                            hours || "00"
                                        }:${text.padStart(2, "0")} ${
                                            currentEvent.endTime?.split(
                                                " "
                                            )[1] || "AM"
                                        }`,
                                    });
                                }}
                                style={styles.timeInput}
                                keyboardType="numeric"
                                maxLength={2}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.amPmToggle,
                                    currentEvent.endTime?.includes("AM")
                                        ? styles.activeToggle
                                        : null,
                                ]}
                                onPress={() => {
                                    const [hours, minutes] = (
                                        currentEvent.endTime || "00:00 AM"
                                    ).split(/[: ]/);
                                    setCurrentEvent({
                                        ...currentEvent,
                                        endTime: `${hours || "00"}:${
                                            minutes || "00"
                                        } AM`,
                                    });
                                }}
                            >
                                <Text style={styles.amPmText}>AM</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.amPmToggle,
                                    currentEvent.endTime?.includes("PM")
                                        ? styles.activeToggle
                                        : null,
                                ]}
                                onPress={() => {
                                    const [hours, minutes] = (
                                        currentEvent.endTime || "00:00 AM"
                                    ).split(/[: ]/);
                                    setCurrentEvent({
                                        ...currentEvent,
                                        endTime: `${hours || "00"}:${
                                            minutes || "00"
                                        } PM`,
                                    });
                                }}
                            >
                                <Text style={styles.amPmText}>PM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            onPress={
                                isEditing ? handleUpdateEvent : handleAddEvent
                            }
                            style={styles.createButton}
                        >
                            <Text style={styles.createButtonText}>
                                {isEditing ? "Update" : "Create"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.cancelButton}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f4f4f4",
    },
    eventsContainer: {
        padding: 16,
    },
    eventsContentContainer: {
        paddingBottom: 100,
    },
    eventCard: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 8,
        elevation: 3,
    },
    eventDateContainer: {
        alignItems: "center",
        marginRight: 16,
    },
    eventDate: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
    },
    eventTime: {
        fontSize: 12,
        color: "#333",
    },
    eventDetails: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    eventIndicator: {
        width: 4,
        height: "100%",
        marginRight: 12,
    },
    eventTextContainer: {
        flex: 1,
        paddingLeft: 10,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333",
    },
    eventLocation: {
        fontSize: 12,
        color: "#666",
    },
    addButton: {
        padding: 10,
        alignItems: "center",
        margin: 20,
        borderRadius: 5,
        position: "absolute",
        bottom: 20,
        left: 20,
    },
    addButtonIcon: {
        color: "#f4c622",
        fontSize: 40,
    },
    modalContainer: {
        padding: 20,
    },
    editButton: {
        color: "#FFD700",
    },
    deleteButton: {
        color: "#ff0000",
    },
    createActivityContainer: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    modalHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        color: "#800000",
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        marginBottom: 10,
        borderRadius: 5,
        fontSize: 16,
    },
    dateLabel: {
        fontSize: 16,
        marginBottom: 10,
        color: "#333",
    },
    toggleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 10,
    },
    toggleButton: {
        flexDirection: "row",
        alignItems: "center",
    },
    toggleText: {
        fontSize: 16,
        marginLeft: 8,
        color: "#333",
    },
    timePickerContainer: {
        marginVertical: 10,
    },
    timeLabel: {
        fontSize: 16,
        color: "#333",
        marginBottom: 5,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    createButton: {
        backgroundColor: "#800000",
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
    },
    createButtonText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
    },
    cancelButton: {
        backgroundColor: "#ddd",
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
    },
    cancelButtonText: {
        color: "#333",
        fontSize: 16,
        textAlign: "center",
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    timeInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 10,
        width: 60,
        textAlign: "center",
        borderRadius: 5,
        fontSize: 16,
    },
    colon: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333",
        marginHorizontal: 5,
    },
    amPmToggle: {
        borderWidth: 1,
        borderColor: "#ddd",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        marginLeft: 10,
    },
    activeToggle: {
        backgroundColor: "#800000",
        borderColor: "#800000",
    },
    amPmText: {
        fontSize: 16,
        color: "#fff",
        textAlign: "center",
    },
});

export default ScheduleScreen;
