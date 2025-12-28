import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  fetchMenuItems,
  fetchCateringEvents,
  updateCateringEventPayment,
} from '../../api/api';
import ScheduleCateringModal from '../../components/ScheduleCateringModal';

export default function CateringTab() {
  const navigation = useNavigation(); // <- useNavigation hook
  const [cateringEvents, setCateringEvents] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [eventTab, setEventTab] = useState('upcoming');

  const [scheduleForm, setScheduleForm] = useState({
    eventName: '',
    client: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    attendees: '',
    contactName: '',
    contactPhone: '',
    notes: '',
    selectedItems: [],
  });

  // ----------- SCHEDULE EVENT -------------
  const handleScheduleSubmit = async () => {
    const required = [
      'eventName',
      'client',
      'date',
      'startTime',
      'endTime',
      'location',
      'attendees',
      'contactName',
      'contactPhone',
    ];

    const missing = required.filter(
      (f) => !scheduleForm[f] || scheduleForm[f].toString().trim() === ''
    );

    if (missing.length) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }

    if (scheduleForm.selectedItems.length === 0) {
      Alert.alert('Error', 'Please select at least one menu item.');
      return;
    }

    const selectedItemsData = scheduleForm.selectedItems.map((itemId) => {
      const item = menuItems.find((i) => i.id === itemId);
      return {
        menu_item: item.id,
        name: item.name,
        quantity: item.selectedQuantity || 1,
        unit_price: item.price || 0,
        image: item.image || null,
      };
    });

    const totalPrice = selectedItemsData.reduce(
      (sum, i) => sum + i.unit_price * i.quantity,
      0
    );

    const downPayment = totalPrice * 0.5;

    Alert.alert(
      'Down Payment Required',
      `You need to pay 50% (₱${downPayment.toLocaleString()}) to schedule this event.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: () => {
            setCateringEvents((prev) => [
              ...prev,
              {
                id: Date.now(),
                name: scheduleForm.eventName,
                client_name: scheduleForm.client,
                event_date: scheduleForm.date,
                start_time: scheduleForm.startTime,
                end_time: scheduleForm.endTime,
                location: scheduleForm.location,
                guest_count: Number(scheduleForm.attendees),
                notes: scheduleForm.notes,
                items: selectedItemsData,
                total_price: totalPrice,
                paid_amount: downPayment,
                status: 'Pending Payment',
              },
            ]);
            setModalVisible(false);
            Alert.alert('Success', 'Event scheduled successfully!');
          },
        },
      ]
    );
  };

  // ------------------- LOAD DATA -------------------
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const userData = await AsyncStorage.getItem('@sanaol/auth/user');
        const parsed = userData ? JSON.parse(userData) : null;

        if (!parsed || parsed.role !== 'faculty') {
          setAllowed(false);
          return;
        }
        setAllowed(true);

        const clientName = parsed.name?.trim() || '';
        setScheduleForm((prev) => ({ ...prev, client: clientName }));

        const items = await fetchMenuItems();
        setMenuItems(
          (items && Array.isArray(items) ? items : []).map((i) => ({
            ...i,
            selectedQuantity: 1,
          }))
        );

        const events = await fetchCateringEvents(clientName);
        const normalizedEvents = (events || []).map((ev) => ({
          ...ev,
          client_name: ev.client_name?.trim() || '',
          items: Array.isArray(ev.items) ? ev.items : [],
          total_price:
            ev.total_price ??
            (Array.isArray(ev.items)
              ? ev.items.reduce(
                  (sum, item) =>
                    sum +
                    (item.unit_price || item.price || 0) * (item.quantity || 1),
                  0
                )
              : 0),
          status: ev.status ?? 'Pending',
          paid_amount: ev.paid_amount ?? 0,
        }));

        setCateringEvents(normalizedEvents);
      } catch (err) {
        console.error('Error loading catering data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ------------------- HANDLE PAY -------------------
  const handlePayRemaining = (event) => {
    const remaining = event.total_price - (event.paid_amount || 0);
    if (remaining <= 0) return;

    Alert.alert(
      'Pay Remaining 50%',
      `Remaining payment: ₱${remaining.toLocaleString()}. Proceed to pay?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: async () => {
            try {
              await updateCateringEventPayment(event.id, remaining);
              setCateringEvents((prev) =>
                prev.map((ev) =>
                  ev.id === event.id
                    ? {
                        ...ev,
                        paid_amount: ev.total_price,
                        status: 'Confirmed',
                      }
                    : ev
                )
              );
              Alert.alert('Success', 'Full payment received! Event confirmed.');
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Payment failed.');
            }
          },
        },
      ]
    );
  };

  // ------------------- RENDER -------------------
  if (loading || allowed === null) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!allowed) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.notAllowedText}>
          You are not allowed to access Catering.
        </Text>
      </View>
    );
  }

  const today = new Date();
  const userEvents = cateringEvents.filter(
    (event) =>
      event.client_name.toLowerCase() ===
        scheduleForm.client.trim().toLowerCase() && event.status !== 'cancelled'
  );

  const upcomingEvents = userEvents.filter(
    (event) => new Date(event.event_date) >= today
  );
  const pastEvents = userEvents.filter(
    (event) => new Date(event.event_date) < today
  );
  const displayedEvents = eventTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/drop_1.png')}
        resizeMode="cover"
        style={styles.headerBackground}
      >
        <View style={styles.overlay} />
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() =>
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'home-dashboard' }],
                })
              }
            >
              <Ionicons name="arrow-back" size={26} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Catering Events</Text>
            <View style={{ width: 26 }} />
          </View>
        </View>
      </ImageBackground>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setEventTab('upcoming')}
          style={[styles.tab, eventTab === 'upcoming' && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabText,
              eventTab === 'upcoming' && styles.activeTabText,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setEventTab('past')}
          style={[styles.tab, eventTab === 'past' && styles.activeTab]}
        >
          <Text
            style={[
              styles.tabText,
              eventTab === 'past' && styles.activeTabText,
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 64 }}>
        {displayedEvents.length === 0 && (
          <Text style={styles.emptyText}>
            No {eventTab === 'upcoming' ? 'upcoming' : 'past'} events.
          </Text>
        )}

        {displayedEvents.map((event, index) => {
          const dynamicTotal = event.items.reduce(
            (sum, i) => sum + (i.unit_price || 0) * (i.quantity || 1),
            0
          );

          const eventColor = [
            '#FF8C00',
            '#f97316',
            '#27ae60',
            '#3498db',
            '#9b59b6',
            '#e74c3c',
            '#1abc9c',
          ][index % 7];

          return (
            <View
              key={event.id}
              style={[
                styles.eventCard,
                { borderTopColor: eventColor, borderTopWidth: 5 },
              ]}
            >
              {event.status === 'Pending Payment' && event.paid_amount > 0 && (
                <View style={styles.paidBadge}>
                  <Text style={styles.paidBadgeText}>50% Paid</Text>
                </View>
              )}

              <View style={styles.eventContent}>
                <Text style={styles.eventTitle}>{event.name}</Text>
                <View style={styles.eventRow}>
                  <Text style={styles.eventLabel}>Status:</Text>
                  <Text style={styles.eventValue}>{event.status}</Text>
                </View>
                <View style={styles.eventRow}>
                  <Text style={styles.eventLabel}>Date:</Text>
                  <Text style={styles.eventValue}>{event.event_date}</Text>
                </View>
                <View style={styles.eventRow}>
                  <Text style={styles.eventLabel}>Time:</Text>
                  <Text style={styles.eventValue}>
                    {event.start_time} - {event.end_time}
                  </Text>
                </View>
                <View style={styles.eventRow}>
                  <Text style={styles.eventLabel}>Location:</Text>
                  <Text style={styles.eventValue}>{event.location}</Text>
                </View>
                <View style={styles.eventRow}>
                  <Text style={styles.eventLabel}>Attendees:</Text>
                  <Text style={styles.eventValue}>{event.guest_count}</Text>
                </View>
                <View style={styles.eventRow}>
                  <Text style={styles.eventLabel}>Total Price:</Text>
                  <Text style={styles.eventValue}>
                    ₱ {dynamicTotal.toLocaleString()}
                    {event.status === 'Pending Payment' &&
                      ` (Paid: ₱${event.paid_amount?.toLocaleString() || 0})`}
                  </Text>
                </View>
                {event.notes && (
                  <View style={styles.eventRow}>
                    <Text style={styles.eventLabel}>Notes:</Text>
                    <Text style={styles.eventValue}>{event.notes}</Text>
                  </View>
                )}

                <Text style={styles.menuTitle}>Menu Items:</Text>
                <View style={styles.menuGrid}>
                  {event.items?.map((item, idx) => (
                    <View key={idx} style={styles.menuCard}>
                      {item.image ? (
                        <Image
                          source={{ uri: item.image }}
                          style={styles.menuImage}
                        />
                      ) : (
                        <View style={styles.menuImagePlaceholder} />
                      )}
                      <Text style={styles.menuCardText}>
                        {item.name} x {item.quantity} — ₱
                        {(item.unit_price * item.quantity).toLocaleString()}
                      </Text>
                    </View>
                  ))}
                </View>

                {event.status === 'Pending Payment' && (
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => handlePayRemaining(event)}
                  >
                    <Text style={styles.payBtnText}>Pay Remaining 50%</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.floatingBtnText}>Schedule New Catering Event</Text>
      </TouchableOpacity>

      <ScheduleCateringModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        menuItems={menuItems}
        scheduleForm={scheduleForm}
        setScheduleForm={setScheduleForm}
        setCateringEvents={setCateringEvents}
        handleScheduleSubmit={handleScheduleSubmit}
      />
    </View>
  );
}

// ------------------- STYLES -------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE6C7' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notAllowedText: { color: 'red', fontSize: 16, fontFamily: 'Roboto' },
  headerBackground: {
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(254,192,117,0.5)',
  },
  headerContainer: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: 12 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 30,
    fontFamily: 'Roboto_700Bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 25,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 25, alignItems: 'center' },
  activeTab: { backgroundColor: '#FF8C00' },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
    fontFamily: 'Roboto_700Bold',
  },
  activeTabText: { color: '#fff', fontWeight: 'Roboto_700Bold' },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 40,
    fontFamily: 'Roboto',
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  eventContent: { padding: 14 },
  eventTitle: {
    fontSize: 18,
    marginBottom: 8,
    fontFamily: 'Roboto_700Bold',
    color: '#333',
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  eventLabel: { fontWeight: '600', fontFamily: 'Roboto', color: '#555' },
  eventValue: { fontWeight: '500', fontFamily: 'Roboto', color: '#333' },
  menuTitle: {
    fontWeight: '700',
    fontFamily: 'Roboto',
    marginTop: 10,
    marginBottom: 6,
    color: '#333',
  },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  menuCard: {
    width: '48%',
    margin: '1%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 6,
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  menuImage: { width: 80, height: 80, borderRadius: 8 },
  menuImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  menuCardText: { marginTop: 4, textAlign: 'center', fontFamily: 'Roboto' },
  payBtn: {
    backgroundColor: '#f97316',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontFamily: 'Roboto' },
  floatingBtn: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  floatingBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Roboto_700Bold',
  },
  paidBadge: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  paidBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Roboto_700Bold',
  },
});
