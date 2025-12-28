import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  useFonts,
  Roboto_700Bold,
  Roboto_500Medium,
  Roboto_400Regular,
} from '@expo-google-fonts/roboto';

export default function AppSettings() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Roboto_700Bold,
    Roboto_500Medium,
    Roboto_400Regular,
  });

  if (!fontsLoaded) return null;

  const settingsOptions = [
    { icon: 'notifications-outline', title: 'Notifications' },
    { icon: 'lock-closed-outline', title: 'Privacy & Security' },
    { icon: 'color-palette-outline', title: 'Appearance' },
    { icon: 'information-circle-outline', title: 'About' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require('../../../assets/drop_1.png')}
        resizeMode="cover"
        style={styles.headerBackground}
      >
        <View style={styles.overlay} />
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/home-dashboard')}
            >
              <Ionicons name="arrow-back" size={26} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <Ionicons name="settings-outline" size={26} color="black" />
          </View>
        </View>
      </ImageBackground>

      {/* Settings List */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity key={index} style={styles.optionCard}>
            <View style={styles.iconWrapper}>
              <Ionicons name={option.icon} size={22} color="#fff" />
            </View>
            <Text
              style={[styles.optionText, { fontFamily: 'Roboto_500Medium' }]}
            >
              {option.title}
            </Text>
            <Ionicons
              name="chevron-forward-outline"
              size={20}
              color="#ccc"
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE6C7' },
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
  scrollContainer: { padding: 16 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97316',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
  },
});
