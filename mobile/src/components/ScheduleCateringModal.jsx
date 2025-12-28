import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { createCateringEvent } from '../api/api';

export default function ScheduleCateringModal({
  visible,
  onClose,
  menuItems,
  scheduleForm,
  setScheduleForm,
  setCateringEvents,
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState({
    field: '',
    visible: false,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setScheduleForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleMenuItem = (itemId) => {
    setScheduleForm((prev) => {
      const exists = prev.selectedItems.includes(itemId);
      return {
        ...prev,
        selectedItems: exists
          ? prev.selectedItems.filter((id) => id !== itemId)
          : [...prev.selectedItems, itemId],
      };
    });
  };

  const handleQuantityChange = (itemId, qty) => {
    setScheduleForm((prev) => {
      const updatedItems = menuItems.map((i) =>
        i.id === itemId ? { ...i, selectedQuantity: qty } : i
      );
      return { ...prev, menuItems: updatedItems };
    });
  };

  const categorizedMenu = useMemo(() => {
    const groups = {};
    menuItems.forEach((item) => {
      const category = item.category || 'Others';
      if (!groups[category]) groups[category] = [];
      groups[category].push(item);
    });
    Object.keys(groups).forEach((cat) => {
      groups[cat].sort((a, b) => a.price - b.price);
    });
    return groups;
  }, [menuItems]);

  const handleSubmit = async () => {
    const required = [
      'eventName',
      'client',
      'date',
      'startTime24',
      'endTime24',
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
        quantity: item.selectedQuantity,
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
          onPress: async () => {
            try {
              setLoading(true);
              const payload = {
                name: scheduleForm.eventName,
                client_name: scheduleForm.client,
                event_date: scheduleForm.date,
                start_time: scheduleForm.startTime24, // 24h format
                end_time: scheduleForm.endTime24, // 24h format
                location: scheduleForm.location,
                guest_count: Number(scheduleForm.attendees),
                contact_name: scheduleForm.contactName,
                contact_phone: scheduleForm.contactPhone,
                notes: scheduleForm.notes,
                items: selectedItemsData,
                total_price: totalPrice,
                paid_amount: downPayment,
              };

              console.log('📤 Sending Catering Event payload:', payload);

              const result = await createCateringEvent(payload);

              if (result.success) {
                setCateringEvents((prev) => [...prev, result.data]);
                setLoading(false);
                onClose();
                setScheduleForm({
                  eventName: '',
                  client: scheduleForm.client,
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
                Alert.alert('Success', 'Event scheduled successfully!');
              } else {
                setLoading(false);
                Alert.alert('Error', result.message);
              }
            } catch (err) {
              setLoading(false);
              Alert.alert('Error', 'Something went wrong.');
              console.error('❌ createCateringEvent error:', err);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <ScrollView
          style={styles.modalContent}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.modalTitle}>Schedule Catering Event</Text>

          <Section title="Event Details" />

          <Field
            label="Event Name"
            value={scheduleForm.eventName}
            onChange={(v) => handleInputChange('eventName', v)}
          />
          <Field label="Client" value={scheduleForm.client} editable={false} />

          <DateField
            label="Event Date"
            value={scheduleForm.date}
            onPress={() => setShowDatePicker(true)}
          />

          {showDatePicker && (
            <DateTimePicker
              value={
                scheduleForm.date ? new Date(scheduleForm.date) : new Date()
              }
              mode="date"
              onChange={(e, selected) => {
                setShowDatePicker(false);
                if (selected)
                  handleInputChange(
                    'date',
                    selected.toISOString().split('T')[0]
                  );
              }}
            />
          )}

          <TimeField
            label="Start Time"
            value={scheduleForm.startTime}
            onPress={() =>
              setShowTimePicker({ field: 'startTime', visible: true })
            }
          />
          <TimeField
            label="End Time"
            value={scheduleForm.endTime}
            onPress={() =>
              setShowTimePicker({ field: 'endTime', visible: true })
            }
          />

          {showTimePicker.visible && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={(e, selected) => {
                if (!selected)
                  return setShowTimePicker({ field: '', visible: false });

                const hours = selected.getHours();
                const minutes = selected.getMinutes();
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 === 0 ? 12 : hours % 12;
                const displayTime = `${displayHours}:${minutes
                  .toString()
                  .padStart(2, '0')} ${ampm}`;
                const backendTime = `${hours.toString().padStart(2, '0')}:${minutes
                  .toString()
                  .padStart(2, '0')}`;

                handleInputChange(showTimePicker.field, displayTime);
                handleInputChange(`${showTimePicker.field}24`, backendTime);
                setShowTimePicker({ field: '', visible: false });
              }}
            />
          )}

          <Field
            label="Location"
            value={scheduleForm.location}
            onChange={(v) => handleInputChange('location', v)}
          />
          <Field
            label="Number of Attendees"
            value={scheduleForm.attendees}
            onChange={(v) => handleInputChange('attendees', v)}
            keyboardType="numeric"
          />
          <Field
            label="Contact Name"
            value={scheduleForm.contactName}
            onChange={(v) => handleInputChange('contactName', v)}
          />
          <Field
            label="Contact Phone"
            value={scheduleForm.contactPhone}
            onChange={(v) => handleInputChange('contactPhone', v)}
            keyboardType="phone-pad"
          />
          <Field
            label="Additional Notes"
            value={scheduleForm.notes}
            onChange={(v) => handleInputChange('notes', v)}
          />

          <Section title="Menu Selection" />

          {Object.keys(categorizedMenu).map((category) => (
            <View key={category} style={styles.categoryBlock}>
              <Text style={styles.categoryTitle}>{category}</Text>

              {categorizedMenu[category].map((item) => {
                const selected = scheduleForm.selectedItems.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.menuRow, selected && styles.menuRowSelected]}
                    onPress={() => toggleMenuItem(item.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={selected ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={selected ? '#f97316' : '#9ca3af'}
                      style={{ marginRight: 10 }}
                    />
                    <View style={styles.menuRowInfo}>
                      <View>
                        <Text
                          style={[
                            styles.menuRowText,
                            selected && styles.menuRowTextSelected,
                          ]}
                        >
                          {item.name}
                        </Text>
                        <Text style={styles.priceText}>₱{item.price}</Text>
                      </View>
                      {selected && (
                        <View style={styles.qtyInline}>
                          <Text style={styles.qtyLabel}>Qty</Text>
                          <TextInput
                            style={styles.qtyInput}
                            keyboardType="numeric"
                            value={item.inputQuantity?.toString() || '1'}
                            onChangeText={(val) => {
                              const inputVal = val.replace(/[^0-9]/g, '');
                              item.inputQuantity = inputVal;
                              setScheduleForm((prev) => ({ ...prev }));
                            }}
                            onBlur={() => {
                              const finalQty =
                                parseInt(item.inputQuantity) || 1;
                              item.selectedQuantity = finalQty;
                              item.inputQuantity = finalQty.toString();
                              setScheduleForm((prev) => ({ ...prev }));
                            }}
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          <Pressable
            onPress={handleSubmit}
            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Submitting...' : 'Submit'}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              onClose();
              setScheduleForm({
                eventName: '',
                client: scheduleForm.client,
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
            }}
            style={styles.cancelBtn}
          >
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ---------- Reusable Components ---------- */
const Field = ({ label, value, onChange, editable = true, ...props }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={`Enter ${label.toLowerCase()}`}
      style={styles.inputField}
      editable={editable}
      {...props}
    />
  </View>
);

const TimeField = ({ label, value, onPress }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TouchableOpacity onPress={onPress} style={styles.inputField}>
      <Text style={styles.valueText}>
        {value || `Select ${label.toLowerCase()}`}
      </Text>
    </TouchableOpacity>
  </View>
);

const DateField = ({ label, value, onPress }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TouchableOpacity onPress={onPress} style={styles.inputField}>
      <Text style={styles.valueText}>{value || 'Select date'}</Text>
    </TouchableOpacity>
  </View>
);

const Section = ({ title }) => (
  <View style={styles.section}>
    <Text style={styles.sectionText}>{title}</Text>
    <View style={styles.sectionDivider} />
  </View>
);

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    maxHeight: '90%',
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  modalTitle: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Roboto_700Bold',
  },
  section: { marginVertical: 12 },
  sectionText: { fontFamily: 'Roboto_700Bold', fontSize: 16 },
  sectionDivider: { height: 1, backgroundColor: '#e5e7eb', marginTop: 6 },
  inputLabel: { fontFamily: 'Roboto_500Medium', marginBottom: 6 },
  inputField: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  valueText: { fontFamily: 'Roboto_400Regular' },
  categoryBlock: { marginBottom: 16 },
  categoryTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 15,
    marginBottom: 8,
    color: '#374151',
  },
  menuRow: {
    flexDirection: 'row',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    marginBottom: 8,
  },
  menuRowSelected: { borderColor: '#f97316', backgroundColor: '#fff7f0' },
  menuRowInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuRowText: { fontFamily: 'Roboto_500Medium' },
  menuRowTextSelected: { fontFamily: 'Roboto_700Bold', color: '#f97316' },
  priceText: {
    fontFamily: 'Roboto_400Regular',
    color: '#6b7280',
    fontSize: 13,
  },
  qtyInline: { flexDirection: 'row', alignItems: 'center' },
  qtyLabel: { marginRight: 6 },
  qtyInput: {
    width: 44,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    textAlign: 'center',
    paddingVertical: 4,
  },
  submitBtn: {
    backgroundColor: '#f97316',
    padding: 14,
    borderRadius: 14,
    marginTop: 20,
    alignItems: 'center',
  },
  submitBtnText: { color: '#fff', fontFamily: 'Roboto_700Bold', fontSize: 16 },
  cancelBtn: {
    backgroundColor: '#d1d5db',
    padding: 14,
    borderRadius: 14,
    marginTop: 12,
    alignItems: 'center',
  },
  cancelBtnText: { fontFamily: 'Roboto_500Medium' },
});
