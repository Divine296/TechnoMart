import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import api, { getValidToken } from '../../api/api';
import {
  useFonts,
  Roboto_700Bold,
  Roboto_500Medium,
  Roboto_400Regular,
} from '@expo-google-fonts/roboto';

const { width } = Dimensions.get('window');
const CARD_WIDTH = 160;
const SPACING = 16;

export default function AccountProfile() {
  const { cart, clearCart } = useCart();
  const [profile, setProfile] = useState(null);
  const [creditPoints, setCreditPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creditModal, setCreditModal] = useState(false);
  const [specialOffers, setSpecialOffers] = useState([]);
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const creditScale = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Roboto_700Bold,
    Roboto_500Medium,
    Roboto_400Regular,
  });

  const safeString = (val) => (val != null ? String(val) : 'N/A');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('@sanaol/auth/user');
      if (!userData) {
        setProfile(null);
        setCreditPoints(0);
        return;
      }
      const parsed = JSON.parse(userData);
      setProfile(parsed);

      const token = await getValidToken();
      if (!token) throw new Error('No access token');

      let points = 0;
      try {
        const res = await api.get('/orders/user-credit-points/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (
          res.data &&
          typeof res.data === 'object' &&
          'credit_points' in res.data
        ) {
          points = res.data.credit_points ?? 0;
        }
      } catch {
        points = 0;
      }

      setCreditPoints(points);
    } catch (err) {
      console.error(err);
      setProfile((prev) => prev ?? null);
      setCreditPoints(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSpecialOffers = useCallback(async () => {
    try {
      const token = await getValidToken();
      if (!token) throw new Error('No access token');
      const res = await api.get('/offers/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const offers = res.data.offers.map((o) => ({
        ...o,
        points: o.required_points,
      }));
      setSpecialOffers(offers);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load special offers.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadSpecialOffers();
    }, [loadProfile, loadSpecialOffers])
  );

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace('/account-login');
        },
      },
    ]);
  };

  const redeemOffer = async (offer) => {
    const points = Number(creditPoints) || 0;
    if (points < offer.points) {
      Alert.alert(
        'Not enough points',
        `You need ${offer.points} points but have ${points.toFixed(2)}.`
      );
      return;
    }
    try {
      const token = await getValidToken();
      const res = await api.post(
        '/orders/redeem-offer/',
        { offer_id: offer.id, points_used: offer.points },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreditPoints(res.data.remaining_points ?? points);
      clearCart();
      Alert.alert(
        'Success',
        `You redeemed ${offer.name} for ${offer.points} points!`
      );
      setCreditModal(false);
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to redeem the offer.';
      Alert.alert('Error', message);
    }
  };

  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.cancelled) return;
      const token = await getValidToken();
      const formData = new FormData();
      formData.append('image', {
        uri: result.uri,
        name: `avatar_${profile.id}.jpg`,
        type: 'image/jpeg',
      });
      await api.patch('/accounts/update-avatar/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfile((prev) => ({ ...prev, image: result.uri }));
      Alert.alert('Success', 'Avatar updated!');
    } catch {
      Alert.alert('Error', 'Failed to update avatar.');
    }
  };

  const handleCreditPress = () => {
    Animated.sequence([
      Animated.timing(creditScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(creditScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => setCreditModal(true));
  };

  if (!fontsLoaded) return null;

  if (loading)
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );

  if (!profile)
    return (
      <View style={styles.centered}>
        <Text style={[styles.message, { fontFamily: 'Roboto_400Regular' }]}>
          No profile data available.
        </Text>
      </View>
    );

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri:
                profile.image ||
                'https://cdn-icons-png.flaticon.com/512/847/847969.png',
            }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.plusIcon} onPress={pickAvatar}>
            <Ionicons name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { fontFamily: 'Roboto_700Bold' }]}>
          {safeString(profile.name)}
        </Text>
      </View>

      {/* Credit Points */}
      <TouchableWithoutFeedback onPress={handleCreditPress}>
        <Animated.View
          style={[styles.creditCard, { transform: [{ scale: creditScale }] }]}
        >
          <Ionicons name="cash-outline" size={24} color="#fff" />
          <Text style={[styles.creditText, { fontFamily: 'Roboto_500Medium' }]}>
            {Number(creditPoints).toFixed(2)} Points
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* Info Cards */}
      <View style={styles.infoContainer}>
        {[
          { icon: 'id-card-outline', label: 'ID', value: profile.id },
          { icon: 'person-outline', label: 'Role', value: profile.role },
          {
            icon: 'checkmark-circle-outline',
            label: 'Status',
            value: profile.status,
          },
          { icon: 'mail-outline', label: 'Email', value: profile.email },
        ].map((item, idx) => (
          <View key={idx} style={styles.infoCard}>
            <View style={styles.infoIconWrapper}>
              <Ionicons name={item.icon} size={22} color="#fff" />
            </View>
            <Text
              style={[styles.infoText, { fontFamily: 'Roboto_400Regular' }]}
            >
              {item.label}: {safeString(item.value)}
            </Text>
          </View>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={[styles.logoutText, { fontFamily: 'Roboto_700Bold' }]}>
          Logout
        </Text>
      </TouchableOpacity>

      {/* Special Offers Modal */}
      <Modal visible={creditModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, { fontFamily: 'Roboto_700Bold' }]}>
              Special Offers
            </Text>
            <Animated.FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={specialOffers}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={{
                paddingHorizontal: (width - CARD_WIDTH) / 2,
              }}
              snapToInterval={CARD_WIDTH + SPACING}
              decelerationRate="fast"
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                { useNativeDriver: true }
              )}
              renderItem={({ item, index }) => {
                const inputRange = [
                  (index - 1) * (CARD_WIDTH + SPACING),
                  index * (CARD_WIDTH + SPACING),
                  (index + 1) * (CARD_WIDTH + SPACING),
                ];
                const scale = scrollX.interpolate({
                  inputRange,
                  outputRange: [0.85, 1, 0.85],
                  extrapolate: 'clamp',
                });
                return (
                  <Animated.View
                    style={[styles.offerCard, { transform: [{ scale }] }]}
                  >
                    <Image
                      source={{ uri: item.image }}
                      style={styles.offerImage}
                    />
                    <Text
                      style={[
                        styles.offerName,
                        { fontFamily: 'Roboto_500Medium' },
                      ]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.offerPoints,
                        { fontFamily: 'Roboto_500Medium' },
                      ]}
                    >
                      {item.points} pts
                    </Text>
                    <TouchableOpacity
                      style={styles.redeemBtn}
                      onPress={() => redeemOffer(item)}
                    >
                      <Text
                        style={[
                          styles.redeemText,
                          { fontFamily: 'Roboto_700Bold' },
                        ]}
                      >
                        Redeem
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              }}
            />
            <TouchableOpacity
              style={[styles.modalBtn, styles.saveBtn]}
              onPress={() => setCreditModal(false)}
            >
              <Text style={{ color: '#fff', fontFamily: 'Roboto_700Bold' }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#FFE6C7', flexGrow: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE6C7',
  },
  avatarContainer: { alignItems: 'center', marginBottom: 24, marginTop: 50 },
  avatarWrapper: { position: 'relative' },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#f97316',
    backgroundColor: '#fff',
  },
  plusIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#f97316',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 5,
  },
  name: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 12 },
  creditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    padding: 14,
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  creditText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 10,
  },
  infoContainer: { marginVertical: 12 },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#f97316',
  },
  infoIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: { marginLeft: 12, fontSize: 16, color: '#111827' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f97316',
    padding: 14,
    borderRadius: 20,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logoutText: { color: '#fff', marginLeft: 10, fontWeight: '700' },
  message: { fontSize: 16, color: '#555' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 18,
    width: '95%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
  },
  saveBtn: { backgroundColor: '#f97316' },
  offerCard: {
    backgroundColor: '#fff',
    marginHorizontal: SPACING / 2,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    width: CARD_WIDTH,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  offerImage: { width: 80, height: 80, marginBottom: 8, borderRadius: 12 },
  offerName: {
    fontWeight: '700',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  offerPoints: { color: '#f97316', marginBottom: 6 },
  redeemBtn: {
    backgroundColor: '#f97316',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  redeemText: { color: '#fff', fontWeight: '700' },
});
