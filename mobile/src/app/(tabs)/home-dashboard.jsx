import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  Image,
  ImageBackground,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bell,
  Settings as Gear,
  Search,
  User,
  HelpCircle,
  MessageCircle,
  LogOut,
} from 'lucide-react-native';

import Recommended from '../../components/Recommended';
import { fetchMenuItems, fetchNotifications } from '../../api/api';
import { useCart } from '../../context/CartContext';

// Category images mapped by normalized category name
import comboImg from '../../../assets/choices/combo.png';
import snacksImg from '../../../assets/choices/snacks.png';
import drinksImg from '../../../assets/choices/drinks.png';
import mealsImg from '../../../assets/choices/meals.png';
import allImg from '../../../assets/choices/all.png';

const CATEGORY_IMAGES = {
  'combo meals': comboImg,
  snacks: snacksImg,
  drinks: drinksImg,
  meal: mealsImg,
};

export default function HomeDashboardScreen() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  const router = useRouter();
  const { cart } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [menuNotifications, setMenuNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Track new notifications that should be highlighted
  const [newNotifications, setNewNotifications] = useState([]);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const userData = await AsyncStorage.getItem('@sanaol/auth/user');
        setUserRole(userData ? JSON.parse(userData).role : 'student');
      } catch {
        setUserRole('student');
      }
    };
    getUserRole();
  }, []);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await fetchMenuItems();
      setMenuItems(items || []);
    } finally {
      setLoading(false);
    }
  };

  const loadBackendNotifications = async () => {
    try {
      const backend = await fetchNotifications();
      setMenuNotifications(backend || []);
      // Identify new notifications for highlighting
      const read = (await AsyncStorage.getItem('@read_notifications')) || '[]';
      const readIds = JSON.parse(read);
      const newIds = backend
        .filter((n) => !readIds.includes(n.id))
        .map((n) => n.id);
      setNewNotifications(newIds);
    } catch {}
  };

  const loadAllData = async () => {
    await loadMenuItems();
    await loadBackendNotifications();
  };

  // Refresh every 5 minutes (300000 ms)
  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadAllData, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAllData().finally(() => setRefreshing(false));
  }, []);

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

  // Filtered menu items for search
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    return menuItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [menuItems, searchQuery]);

  // Categories data
  const categoriesData = useMemo(() => {
    const map = {};
    menuItems.forEach((item) => {
      let cat = (item.category || 'Others').trim();
      const normalizedCat = cat.toLowerCase();
      if (!map[cat]) {
        map[cat] = {
          title: cat,
          image: CATEGORY_IMAGES[normalizedCat] || allImg,
        };
      }
    });
    return [{ title: 'All Items', image: allImg }, ...Object.values(map)];
  }, [menuItems]);

  const makeCategorySlug = (title) =>
    encodeURIComponent(title.replace(/\s+/g, ''));

  if (!fontsLoaded || loading || userRole === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FEC075" />
      </View>
    );
  }

  const markNotificationsRead = async () => {
    const allIds = menuNotifications.map((n) => n.id);
    await AsyncStorage.setItem('@read_notifications', JSON.stringify(allIds));
    setNewNotifications([]); // remove highlight
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFE6C7' }}>
      {/* HEADER */}
      <ImageBackground
        source={require('../../../assets/drop_1.png')}
        resizeMode="cover"
        style={styles.headerBackground}
      >
        <View style={styles.overlay} />
        <View style={{ zIndex: 2, paddingHorizontal: 16, paddingTop: 30 }}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>HOME</Text>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  setOpenDropdown(
                    openDropdown === 'notifications' ? null : 'notifications'
                  );
                  if (openDropdown !== 'notifications') {
                    markNotificationsRead(); // mark as read when opening dropdown
                  }
                }}
              >
                <View style={{ position: 'relative' }}>
                  <Bell size={24} color="#472E0A" />
                  {newNotifications.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {newNotifications.length}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  setOpenDropdown(
                    openDropdown === 'settings' ? null : 'settings'
                  )
                }
              >
                <Gear size={24} color="#472E0A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* SEARCH BAR */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#6B7280" style={{ marginLeft: 12 }} />
            <TextInput
              placeholder="Search Dish..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#6B7280"
              style={styles.searchBar}
            />
          </View>
        </View>
      </ImageBackground>

      {/* Notifications Dropdown */}
      {openDropdown === 'notifications' && (
        <View style={[styles.dropdownContainer, { top: 60, right: 40 }]}>
          <View style={styles.triangle} />
          <View style={styles.dropdown}>
            {menuNotifications.length === 0 ? (
              <Text
                style={{ color: '#6B7280', textAlign: 'center', padding: 8 }}
              >
                No updates
              </Text>
            ) : (
              <ScrollView
                style={{ maxHeight: 300 }}
                showsVerticalScrollIndicator
              >
                {menuNotifications.map((n, idx) => {
                  const isNew = newNotifications.includes(n.id);
                  return (
                    <View
                      key={idx}
                      style={[
                        styles.notificationItem,
                        isNew ? styles.newNotification : null,
                      ]}
                    >
                      <Text
                        style={{
                          color:
                            n.type === 'new'
                              ? '#16a34a'
                              : n.type === 'soldout'
                                ? '#ef4444'
                                : n.type === 'deleted'
                                  ? '#9ca3af'
                                  : '#374151',
                          fontWeight: '500',
                        }}
                      >
                        {n.type === 'new'
                          ? 'New:'
                          : n.type === 'soldout'
                            ? 'Sold Out:'
                            : n.type === 'deleted'
                              ? 'Removed:'
                              : ''}{' '}
                        {n.title}
                      </Text>
                      <Text
                        style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}
                      >
                        {new Date(n.created_at).toLocaleString()}
                      </Text>
                      {n.message && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: '#374151',
                            marginTop: 2,
                          }}
                        >
                          {n.message}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {/* Settings Dropdown */}
      {openDropdown === 'settings' && (
        <View style={[styles.dropdownContainer, { top: 60, right: 8 }]}>
          <View style={styles.triangle} />
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => router.push('/account-profile')}
            >
              <User size={16} color="#374151" />
              <Text style={styles.dropdownText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => router.push('/screens/Settings')}
            >
              <Gear size={16} color="#374151" />
              <Text style={styles.dropdownText}>App Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => router.push('/screens/FAQs')}
            >
              <HelpCircle size={16} color="#374151" />
              <Text style={styles.dropdownText}>Help</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => router.push('/screens/Feedback')}
            >
              <MessageCircle size={16} color="#374151" />
              <Text style={styles.dropdownText}>Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={handleLogout}
            >
              <LogOut size={16} color="red" />
              <Text style={[styles.dropdownText, { color: 'red' }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* CONTENT */}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#FEC075']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {searchQuery.trim() ? (
          <>
            <Text style={styles.sectionTitle}>Search Results</Text>
            <Recommended items={filteredMenuItems} />
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            <Recommended items={menuItems.slice(0, 6)} />

            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={{ paddingHorizontal: 16 }}>
              {categoriesData.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    router.push(`/categories/${makeCategorySlug(item.title)}`)
                  }
                  style={styles.categoryBox}
                >
                  {item.image && (
                    <Image source={item.image} style={styles.categoryImage} />
                  )}
                  <Text style={styles.categoryTitle}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {openDropdown && (
        <Pressable
          style={{ position: 'absolute', inset: 0 }}
          onPress={() => setOpenDropdown(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(254,192,117,0.5)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 30,
    color: '#472E0A',
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#FF3B30',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: 'Roboto_700Bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    height: 46,
    marginTop: 8,
  },
  searchBar: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    marginLeft: 8,
  },
  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
    fontFamily: 'Roboto_700Bold',
    fontSize: 20,
    color: '#472E0A',
  },
  categoryBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
    elevation: 2,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 14,
  },
  categoryTitle: {
    fontFamily: 'Roboto_700Bold',
    fontSize: 18,
    color: '#472E0A',
  },
  dropdownContainer: {
    position: 'absolute',
    zIndex: 150,
    width: 220,
    backgroundColor: 'transparent',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'white',
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
    maxHeight: 320,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    gap: 8,
  },
  dropdownText: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    color: '#374151',
  },
  notificationItem: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    marginBottom: 4,
  },
  newNotification: {
    backgroundColor: '#F3F4F6', // light gray for new
    borderRadius: 8,
  },
});
