import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function BiometricFaceEnrollmentScreen() {
  const router = useRouter();
  const { autoPrompt } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (autoPrompt === 'true') {
      handleFaceScan();
    }
  }, []);

  const handleFaceScan = async () => {
    try {
      setLoading(true);

      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        setLoading(false);
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        setLoading(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify with fingerprint',
        fallbackLabel: 'Use Passcode',
      });

      if (result.success) {
        router.replace('/(tabs)/home-dashboard');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../assets/drop_3.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.7)', 'rgba(255,255,255,0.4)']}
          style={StyleSheet.absoluteFillObject}
        />

        <View style={styles.centerContainer}>
          <View style={styles.card}>
            <Ionicons
              name="finger-print-outline"
              size={70}
              color="#FF8C00"
              style={{ marginBottom: 15 }}
            />

            <Text style={styles.title}>Fingerprint Verification</Text>
            <Text style={styles.subtitle}>
              Verify your identity to continue
            </Text>

            <TouchableOpacity
              style={styles.scanButton}
              onPress={handleFaceScan}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.scanText}>Scan Fingerprint</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('/account-login')}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '6%',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    padding: 28,
    alignItems: 'center',
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  scanButton: {
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
  scanText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 15,
    color: '#999',
  },
});
