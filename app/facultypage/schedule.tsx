import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TextInput, Button, TouchableOpacity, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars'; 
import { FontAwesome5 } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';

interface Event {
  id: number;
  date: string;
  title: string;
  location: string;
}

const initialEvents: Event[] = [
  { id: 1, date: '2024-09-07', title: 'Health Program', location: 'N. Bacalso Avenue, Cebu City, Philippines 6000' },
  { id: 2, date: '2024-09-10', title: 'Cleaning Program', location: 'N. Bacalso Avenue, Cebu City, Philippines 6000' },
  { id: 3, date: '2024-09-22', title: 'Youth Program', location: 'N. Bacalso Avenue, Cebu City, Philippines 6000' },
  { id: 4, date: '2024-10-05', title: 'Environmental Program', location: 'N. Bacalso Avenue, Cebu City, Philippines 6000' },
];

const ScheduleScreen = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [selectedDate, setSelectedDate] = useState<string>(''); 
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-09');
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentEvent, setCurrentEvent] = useState<Event>({ id: 0, date: '', title: '', location: '' });

  const markedDates = events.reduce((acc: Record<string, { marked: boolean, dotColor: string }>, event) => {
    acc[event.date] = { marked: true, dotColor: '#FFD700' };
    return acc;
  }, {});

  const filterEventsByMonth = () => {
    return events.filter((event) => event.date.startsWith(selectedMonth));
  };

  // CREATE
  const handleAddEvent = () => {
    const newEvent = { ...currentEvent, id: Date.now(), date: selectedDate };
    setEvents([...events, newEvent]);
    setModalVisible(false);
    setCurrentEvent({ id: 0, date: '', title: '', location: '' });
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
    setCurrentEvent({ id: 0, date: '', title: '', location: '' });
    setIsEditing(false);
  };

  // DELETE
  const handleDeleteEvent = (id: number) => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setEvents(events.filter(event => event.id !== id)),
      }
    ]);
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: DateData) => handleSelectDate(day)}  
        onMonthChange={(month: { year: number, month: number }) => setSelectedMonth(`${month.year}-${String(month.month).padStart(2, '0')}`)      }  
        markedDates={{
          ...markedDates,
          [selectedDate]: { selected: true, selectedColor: '#800000' },
        }}        
        theme={{
          selectedDayBackgroundColor: '#800000',
          todayTextColor: '#800000',
          arrowColor: '#800000',
        }}
      />

      <ScrollView style={styles.eventsContainer} contentContainerStyle={styles.eventsContentContainer}>
        {filterEventsByMonth().map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventDateContainer}>
              <Text style={styles.eventDate}>{new Date(event.date).getDate()}</Text>
              <Text style={styles.eventTime}>ALL DAY</Text>
            </View>
            <View style={styles.eventDetails}>
              <View style={[styles.eventIndicator, { backgroundColor: event.id % 2 === 0 ? '#FFD700' : '#800000' }]} />
              <View style={styles.eventTextContainer}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventLocation}>{event.location}</Text>
              </View>
              <TouchableOpacity onPress={() => handleEditEvent(event)}
                style={{ paddingRight: 10 }}>
                <FontAwesome5 name="edit" size={22} color="#800000" />
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDeleteEvent(event.id)}>
                <FontAwesome5 name="minus-square" size={24} color="#800000" />
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
          setCurrentEvent({ id: 0, date: selectedDate, title: '', location: '' });
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
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Event Title"
            value={currentEvent.title}
            onChangeText={(text) => setCurrentEvent({ ...currentEvent, title: text })}
            style={styles.input}
          />
          <TextInput
            placeholder="Location"
            value={currentEvent.location}
            onChangeText={(text) => setCurrentEvent({ ...currentEvent, location: text })}
            style={styles.input}
          />
          <Button
            title={isEditing ? "Update Event" : "Add Event"}
            onPress={isEditing ? handleUpdateEvent : handleAddEvent}
          />
          <Button title="Cancel" onPress={() => setModalVisible(false)} color="red" />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  eventsContainer: { padding: 16 },
  eventsContentContainer: { paddingBottom: 100 }, 
  eventCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#fff', padding: 16, borderRadius: 8, elevation: 3 },
  eventDateContainer: { alignItems: 'center', marginRight: 16 },
  eventDate: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  eventTime: { fontSize: 12, color: '#333' },
  eventDetails: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  eventIndicator: { width: 4, height: '100%', marginRight: 12 },
  eventTextContainer: { flex: 1, paddingLeft: 10 },
  eventTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  eventLocation: { fontSize: 12, color: '#666' },
  addButton: { padding: 10, alignItems: 'center', margin: 20, borderRadius: 5, position: 'absolute', 
                bottom: 20, left: 20 },
  addButtonIcon: { color: '#f4c622', fontSize: 40 },
  modalContainer: { padding: 20 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 10, marginBottom: 10, borderRadius: 5 },
  editButton: { color: '#FFD700' },
  deleteButton: { color: '#ff0000' },
});

export default ScheduleScreen;