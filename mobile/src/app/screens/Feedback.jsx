// screens/ShareFeedbackScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sendFeedback } from '../../api/api';
import {
  useFonts,
  Roboto_700Bold,
  Roboto_500Medium,
  Roboto_400Regular,
} from '@expo-google-fonts/roboto';

const MAX = 500;
const MIN = 10;
const ORANGE = '#f97316';

const Chip = ({ label, active, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      {
        backgroundColor: active ? '#FFF3E9' : '#fff',
        borderColor: active ? ORANGE : '#E5E7EB',
      },
    ]}
  >
    <Text style={[styles.chipText, { color: active ? ORANGE : '#6B7280' }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function ShareFeedbackScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [text, setText] = useState('');
  const [category, setCategory] = useState('Other');
  const [loading, setLoading] = useState(false);

  const remaining = MAX - text.length;
  const isValid = text.trim().length >= MIN && text.length <= MAX;

  const onSend = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      await sendFeedback({ category, message: text.trim() });
      Alert.alert('Thanks!', 'Your feedback was sent. We appreciate it.');
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Error',
        'There was a problem sending your feedback. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

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
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="chevron-left" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Share Feedback</Text>
            <View style={{ width: 28 }} />
          </View>
        </View>
      </ImageBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Intro Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>We value your feedback</Text>
            <Text style={styles.cardText}>
              Tell us what’s working well or what we can improve. Every message
              is read carefully.
            </Text>
          </View>

          {/* Category Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Category</Text>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}
            >
              {[
                'App Experience',
                'Food Quality',
                'Customer Service',
                'Pricing / Offers',
                'Menu / Variety',
                'Payment / Checkout',
                'Other',
              ].map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={category === c}
                  onPress={() => setCategory(c)}
                />
              ))}
            </View>
          </View>

          {/* Feedback Input */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Feedback</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type your feedback here..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={MAX}
              textAlignVertical="top"
              style={styles.textInput}
              editable={!loading}
            />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: text.trim().length < MIN ? '#EF4444' : '#6B7280',
                }}
              >
                {text.trim().length < MIN
                  ? `At least ${MIN} characters (${MIN - text.trim().length} more)`
                  : 'Looks good'}
              </Text>
              <Text style={{ fontSize: 12, color: '#6B7280' }}>
                {remaining}
              </Text>
            </View>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.contactBtn,
              { opacity: isValid && !loading ? 1 : 0.6 },
            ]}
            onPress={onSend}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.contactText}>Send Feedback</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            By sending, you agree that your feedback may be used to improve the
            app experience.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingVertical: 30,
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
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
    color: '#0f172a',
    marginBottom: 8,
  },
  cardText: { fontSize: 14, fontFamily: 'Roboto_400Regular', color: '#4b5563' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 13, fontFamily: 'Roboto_500Medium' },
  textInput: {
    minHeight: 120,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    color: '#0f172a',
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    backgroundColor: '#f9fafb',
  },
  contactBtn: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  contactText: { color: '#fff', fontSize: 16, fontFamily: 'Roboto_500Medium' },
  disclaimer: {
    marginTop: 12,
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});
