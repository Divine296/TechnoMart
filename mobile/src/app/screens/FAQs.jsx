// screens/FAQsScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import {
  useFonts,
  Roboto_700Bold,
  Roboto_500Medium,
  Roboto_400Regular,
} from '@expo-google-fonts/roboto';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const QAItem = ({ id, question, answer, expanded, onToggle }) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.qHeader}
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle?.(id);
        }}
      >
        <Text style={styles.questionText}>{question}</Text>
        <Feather
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#f97316"
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.answerWrapper}>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

const DEFAULT_FAQS = [
  // Orders
  {
    id: 'order-tracking',
    q: 'How do I track my order?',
    a: 'Go to Profile → Orders to see real-time status. Tap an order to view courier details and a live map when available.',
  },
  {
    id: 'order-cancel',
    q: 'Can I cancel my order?',
    a: 'Orders can be canceled before preparation starts. Once the order is confirmed, it cannot be canceled.',
  },
  {
    id: 'order-modify',
    q: 'Can I modify my order after placing it?',
    a: 'Unfortunately, modifications aren’t possible after an order is placed. You can place a new order instead.',
  },

  // Payments
  {
    id: 'payment-methods',
    q: 'What payment methods are supported?',
    a: 'You can pay using cash on delivery, GCash, Maya, or credit/debit cards.',
  },

  // Refunds
  {
    id: 'refunds',
    q: 'How do refunds work?',
    a: 'Refunds are issued back to your original payment method within 3–5 business days after approval. You’ll get an email once processed.',
  },

  // Delivery
  {
    id: 'delivery-time',
    q: 'How long does delivery take?',
    a: 'Delivery usually takes 30–60 minutes depending on your location and order volume.',
  },

  // Account
  {
    id: 'account-change',
    q: 'Can I change my account details?',
    a: 'Yes! Go to Profile → Personal Information to update your name, phone number, and email.',
  },

  // Notifications
  {
    id: 'notifications',
    q: 'I’m not receiving notifications. What should I check?',
    a: 'In Profile → Notifications, ensure the toggle is on. Then, enable notifications for this app in your device Settings.',
  },

  // Promotions
  {
    id: 'promo-apply',
    q: 'How do I apply promo codes?',
    a: 'At checkout, enter your promo code in the designated field to apply discounts.',
  },
];

export default function FAQsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);

  const [fontsLoaded] = useFonts({
    Roboto_700Bold,
    Roboto_500Medium,
    Roboto_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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
              <Feather name="chevron-left" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>FAQs</Text>
            <View style={{ width: 28 }} />
          </View>
        </View>
      </ImageBackground>

      {/* FAQ List */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}>
        {DEFAULT_FAQS.map((item) => (
          <QAItem
            key={item.id}
            id={item.id}
            question={item.q}
            answer={item.a}
            expanded={expandedId === item.id}
            onToggle={(id) =>
              setExpandedId((prev) => (prev === id ? null : id))
            }
          />
        ))}

        {/* Contact Support */}
        <TouchableOpacity
          style={styles.contactBtn}
          onPress={() => Linking.openURL('https://t.me/TechnoMartSupport')}
        >
          <Text
            style={[styles.contactText, { fontFamily: 'Roboto_500Medium' }]}
          >
            Contact Support
          </Text>
        </TouchableOpacity>
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
    paddingVertical: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(254,192,117,0.5)',
  },
  headerContainer: { paddingHorizontal: 16 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 32,
    fontFamily: 'Roboto_700Bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  qHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
    color: '#0f172a',
    flex: 1,
    paddingRight: 8,
  },
  answerWrapper: { marginTop: 8 },
  answerText: {
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    color: '#4b5563',
    lineHeight: 20,
  },
  contactBtn: {
    backgroundColor: '#f97316',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  contactText: { color: '#fff', fontSize: 16 },
});
