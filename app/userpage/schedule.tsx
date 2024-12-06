import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Button, Platform } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars'; 
import { collection, getDocs } from 'firebase/firestore';
import { FIREBASE_DB as db } from "@/FirebaseConfig";
import * as Notifications from 'expo-notifications';

interface Event {
  id: string;
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

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const StudentSchedule = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('2024-09');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const eventsCollection = collection(db, 'events');

  // Fetch events from Firestore
  const fetchEvents = async () => {
    try {
      const querySnapshot = await getDocs(eventsCollection);
      const fetchedEvents: Event[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];

      setEvents(fetchedEvents);

      // Notify about new events
      fetchedEvents.forEach((event) => {
        if (event.notify) {
          scheduleEventNotification(event); 
        }
      });
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Schedule notification for an event
  const scheduleEventNotification = async (event: Event) => {
    if (Platform.OS !== 'web') { 
      const notificationTime = new Date(event.date);
      if (event.startTime) {
        const [hours, minutes] = event.startTime.split(':').map(Number);
        notificationTime.setHours(hours, minutes);
      }

      // Notify 15 minutes before the event
      notificationTime.setMinutes(notificationTime.getMinutes() - 15); 

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Upcoming Event: ${event.title}`,
            body: `Don't forget about your event at ${event.startTime} on ${event.date}!`,
          },
          trigger: notificationTime,
        });

        // Notify when a new event is added
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'New Event Added',
            body: `A new event titled "${event.title}" has been added to your schedule.`,
          },
          trigger: { seconds: 1 }, // Notify immediately
        });

      } catch (error) {
        console.error('Error scheduling notification:', error);
      }
    } else {
      // Handle for web platform (mocking with an alert or other method)
      console.log('Web platform - notification scheduling is not supported.');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const filterEventsByMonth = () => {
    return events.filter((event) => event.date.startsWith(selectedMonth));
  };

  const markedDates = events.reduce((acc: Record<string, { marked: boolean; dotColor: string }>, event) => {
    acc[event.date] = { marked: true, dotColor: '#FFD700' };
    return acc;
  }, {});

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <View style={styles.container}>
      {/* Calendar */}
      <Calendar
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
        onMonthChange={(month: { year: number; month: number }) =>
          setSelectedMonth(`${month.year}-${String(month.month).padStart(2, '0')}`)
        }
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

      {/* Event List */}
      <ScrollView style={styles.eventsContainer} contentContainerStyle={styles.eventsContentContainer}>
        {filterEventsByMonth().map((event) => (
          <TouchableOpacity key={event.id} onPress={() => handleEventClick(event)}>
            <View style={styles.eventCard}>
              <View style={styles.eventDateContainer}>
                <Text style={styles.eventDate}>{new Date(event.date).getDate()}</Text>
                <Text style={styles.eventTime}>
                  {event.wholeDay ? "ALL DAY" : `${event.startTime || "N/A"} - ${event.endTime || "N/A"}`}
                </Text>
              </View>
              <View style={styles.eventDetails}>
                <View style={styles.eventTextContainer}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventLocation}>{event.location}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal for event details */}
      {selectedEvent && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedEvent.title}</Text>
              <Text style={styles.modalText}>Date: {selectedEvent.date}</Text>
              <Text style={styles.modalText}>
                Time: {selectedEvent.wholeDay ? '8:00 AM - 5:00 PM' : `${selectedEvent.startTime || 'N/A'} - ${selectedEvent.endTime || 'N/A'}`}
              </Text>
              <Text style={styles.modalText}>Location: {selectedEvent.location}</Text>
              <Text style={styles.modalText}>Description: {selectedEvent.description || 'No description available'}</Text>
              <Button title="Close" onPress={handleCloseModal} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

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
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  eventDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eventDate: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 12,
    color: '#777',
  },
  eventDetails: {
    marginTop: 10,
  },
  eventTextContainer: {
    marginTop: 10,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventLocation: {
    fontSize: 14,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default StudentSchedule;
