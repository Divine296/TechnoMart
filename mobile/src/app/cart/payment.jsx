import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Modal,
  Animated,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import { getGcashLink, confirmPayment } from '../../api/api';

export default function PaymentPage() {
  const router = useRouter();
  const { orderType, total, selectedTime, orderId, items } =
    useLocalSearchParams();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const orderedItems = items ? JSON.parse(items) : [];

  useEffect(() => {
    if (showSuccess) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else fadeAnim.setValue(0);
  }, [showSuccess]);

  let [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });
  if (!fontsLoaded) return null;

  const closeCounterModal = () => {
    setShowCounterModal(false);
    router.push({
      pathname: '/(tabs)/order-tracking',
      params: { orderId },
    });
  };

  const handlePaymentSelect = async (method) => {
    setSelectedPayment(method);

    if (method === 'gcash') {
      try {
        const { gcash_url } = await getGcashLink(orderId, total);
        const supported = await Linking.canOpenURL(gcash_url);
        if (!supported) {
          Alert.alert('GCash not installed', 'Please install GCash.');
          return;
        }
        await Linking.openURL(gcash_url);
        setLoading(true);

        setTimeout(async () => {
          const res = await confirmPayment(orderId, method);
          setLoading(false);
          if (res.success) {
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              router.push({
                pathname: '/(tabs)/order-tracking',
                params: { orderId },
              });
            }, 4000);
          } else {
            Alert.alert('Payment Failed', res.message);
          }
        }, 6000);
      } catch {
        setLoading(false);
        Alert.alert('Error', 'GCash payment failed.');
      }
    } else {
      // Pay at Counter
      setShowCounterModal(true);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <ImageBackground
        source={require('../../../assets/drop_1.png')}
        style={styles.headerBackground}
      >
        <View style={styles.overlay} />
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Page</Text>
            <Ionicons name="card-outline" size={26} color="black" />
          </View>
        </View>
      </ImageBackground>

      {/* RECEIPT */}
      <View style={styles.receiptCard}>
        <Text style={styles.receiptHeader}>Order Receipt</Text>
        <View style={styles.line} />

        <ScrollView style={{ maxHeight: 200 }}>
          {orderedItems.length > 0 ? (
            orderedItems.map((item) => (
              <View key={item.id} style={styles.receiptRow}>
                <Text style={styles.label}>
                  {item.name} x {item.quantity}
                </Text>
                <Text style={styles.value}>
                  ₱{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))
          ) : (
            <Text
              style={{ textAlign: 'center', marginVertical: 10, color: '#777' }}
            >
              No items found.
            </Text>
          )}
        </ScrollView>

        <View style={styles.line} />
        <View style={styles.receiptRow}>
          <Text style={styles.label}>Order Type</Text>
          <Text style={styles.value}>{orderType}</Text>
        </View>
        <View style={styles.receiptRow}>
          <Text style={styles.label}>Pickup Time</Text>
          <Text style={styles.value}>{selectedTime}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.receiptRow}>
          <Text style={[styles.label, { fontFamily: 'Roboto_700Bold' }]}>
            Total
          </Text>
          <Text style={[styles.value, { fontFamily: 'Roboto_700Bold' }]}>
            ₱{parseFloat(total).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* PAYMENT OPTIONS */}
      <TouchableOpacity
        style={[
          styles.paymentCard,
          selectedPayment === 'counter' && styles.selectedCard,
        ]}
        onPress={() => handlePaymentSelect('counter')}
      >
        <Image
          source={require('../../../assets/cash.png')}
          style={styles.paymentIcon}
        />
        <View>
          <Text style={styles.paymentTitle}>Pay at the Counter</Text>
          <Text style={styles.paymentSubtitle}>
            Place your order now and pay at pickup
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentCard,
          selectedPayment === 'gcash' && styles.selectedCard,
        ]}
        onPress={() => handlePaymentSelect('gcash')}
      >
        <Image
          source={require('../../../assets/gcash.png')}
          style={styles.paymentIcon}
        />
        <View>
          <Text style={styles.paymentTitle}>GCash</Text>
          <Text style={styles.paymentSubtitle}>Make payment via GCash app</Text>
        </View>
      </TouchableOpacity>

      {loading && (
        <Text style={{ textAlign: 'center', marginTop: 10 }}>
          Waiting for confirmation...
        </Text>
      )}

      {/* GCash SUCCESS MODAL */}
      <Modal transparent visible={showSuccess}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.successBox, { opacity: fadeAnim }]}>
            <Ionicons name="checkmark-circle" size={80} color="#22c55e" />
            <Text style={styles.successTitle}>Payment Successful!</Text>
          </Animated.View>
        </View>
      </Modal>

      {/* COUNTER PAYMENT MODAL */}
      <Modal transparent visible={showCounterModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.counterModalBox}>
            <Ionicons
              name="checkmark-circle-outline"
              size={80}
              color="#f97316"
            />
            <Text style={styles.counterModalTitle}>
              Order Placed Successfully
            </Text>
            <Text style={styles.counterModalMessage}>
              Your order has been placed. Please pay at the counter upon pickup.
            </Text>
            <TouchableOpacity
              style={styles.counterModalButton}
              onPress={closeCounterModal}
            >
              <Text style={styles.counterModalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE6C7' },
  headerBackground: { paddingBottom: 8 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(254,192,117,0.5)',
  },
  headerContainer: { paddingTop: 50, paddingHorizontal: 12, paddingBottom: 12 },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 26, fontFamily: 'Roboto_700Bold' },

  receiptCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignSelf: 'center',
    marginVertical: 20,
  },
  receiptHeader: {
    fontSize: 18,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 6,
  },
  line: { borderBottomWidth: 1, borderBottomColor: '#eee', marginVertical: 8 },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: { fontSize: 15 },
  value: { fontSize: 15 },

  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 16,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  selectedCard: { borderWidth: 2, borderColor: '#f97316' },
  paymentIcon: {
    width: 55,
    height: 55,
    marginRight: 20,
    resizeMode: 'contain',
  },
  paymentTitle: {
    fontSize: 20,
    fontFamily: 'Roboto_700Bold',
    color: '#3b2a1a',
  },
  paymentSubtitle: {
    fontSize: 13,
    fontFamily: 'Roboto_400Regular',
    color: '#777',
    marginTop: 2,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 18,
    alignItems: 'center',
  },
  successTitle: {
    marginTop: 10,
    fontSize: 20,
    fontFamily: 'Roboto_700Bold',
    color: '#16a34a',
  },

  counterModalBox: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  counterModalTitle: {
    marginTop: 15,
    fontSize: 20,
    fontFamily: 'Roboto_700Bold',
    color: '#333',
    textAlign: 'center',
  },
  counterModalMessage: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: 'Roboto_400Regular',
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },
  counterModalButton: {
    marginTop: 20,
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 12,
  },
  counterModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto_700Bold',
    textAlign: 'center',
  },
});
