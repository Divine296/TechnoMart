import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
  Roboto_900Black,
} from '@expo-google-fonts/roboto';
import { registerAccount, loginWithGoogle } from '../api/api';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import DropDownPicker from 'react-native-dropdown-picker';

WebBrowser.maybeCompleteAuthSession();

export default function AccountRegistrationScreen() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    role: '',
    email: '',
    password: '',
    confirm: '',
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Dropdown states
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleValue, setRoleValue] = useState(null);
  const [roleItems, setRoleItems] = useState([
    { label: 'Student', value: 'student' },
    { label: 'Faculty', value: 'faculty' },
  ]);

  // Google Auth setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId:
      '286008841345-05ir6hhh63hhktol4qpo9hqnvlqpl4v7.apps.googleusercontent.com',
    androidClientId:
      '286008841345-05ir6hhh63hhktol4qpo9hqnvlqpl4v7.apps.googleusercontent.com',
    webClientId:
      '286008841345-05ir6hhh63hhktol4qpo9hqnvlqpl4v7.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      handleGoogleLogin(authentication.accessToken);
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken) => {
    try {
      const result = await loginWithGoogle({ accessToken });
      if (result.success) {
        Alert.alert('Success', 'Logged in with Google!', [
          { text: 'OK', onPress: () => router.replace('/dashboard') },
        ]);
      } else {
        Alert.alert('Error', result.message || 'Google login failed.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Unable to login with Google.');
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.role) errs.role = 'Please select a role';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email))
      errs.email = 'Valid email is required';
    if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    if (form.confirm !== form.password) errs.confirm = 'Passwords do not match';
    return errs;
  };

  const handleRegister = async () => {
    const errs = validateForm();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      try {
        const result = await registerAccount({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          password: form.password,
          confirm: form.confirm,
          role: form.role,
        });
        if (result.success) {
          Alert.alert('Success', 'Account created successfully!', [
            { text: 'OK', onPress: () => router.push('/AccountCreatedScreen') },
          ]);
          setForm({
            firstName: '',
            lastName: '',
            role: '',
            email: '',
            password: '',
            confirm: '',
          });
        } else if (result.errors) {
          setErrors(result.errors);
        } else {
          Alert.alert('Error', result.message);
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Password strength helper
  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    if (strength <= 1) return { label: 'Weak', color: 'red' };
    if (strength === 2) return { label: 'Medium', color: 'orange' };
    if (strength >= 3) return { label: 'Strong', color: 'green' };
  };

  // Password match helper
  const getConfirmMatch = () => {
    if (form.confirm.length === 0) return null;
    return form.password === form.confirm
      ? { label: 'Passwords match', color: 'green' }
      : { label: 'Passwords do not match', color: 'red' };
  };

  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold,
    Roboto_900Black,
  });
  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require('../../assets/drop_3.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Fill in the details to register</Text>

        <View style={styles.card}>
          {/* First Name */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#AAA" />
            <TextInput
              placeholder="First Name"
              placeholderTextColor="#AAA"
              value={form.firstName}
              onChangeText={(text) => handleChange('firstName', text)}
              style={styles.input}
            />
          </View>
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}

          {/* Last Name */}
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#AAA" />
            <TextInput
              placeholder="Last Name"
              placeholderTextColor="#AAA"
              value={form.lastName}
              onChangeText={(text) => handleChange('lastName', text)}
              style={styles.input}
            />
          </View>
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}

          {/* Role Dropdown */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 12,
              paddingHorizontal: 10,
              backgroundColor: '#F5F5F5',
              marginBottom: 10,
              height: 50,
              zIndex: 1000,
            }}
          >
            <MaterialCommunityIcons
              name="account-badge-outline"
              size={22}
              color="#AAA"
              style={{ marginRight: 10 }}
            />

            <DropDownPicker
              open={roleOpen}
              value={roleValue}
              items={roleItems}
              setOpen={setRoleOpen}
              setValue={(callback) => {
                const value =
                  typeof callback === 'function'
                    ? callback(roleValue)
                    : callback;
                setRoleValue(value);
                handleChange('role', value);
              }}
              setItems={setRoleItems}
              placeholder="Select Role"
              placeholderStyle={{ color: '#AAA', fontSize: 16 }}
              style={{
                flex: 1,
                borderWidth: 0,
                backgroundColor: 'transparent',
                height: '100%',
                justifyContent: 'center',
                paddingLeft: 0,
                paddingRight: 30,
              }}
              textStyle={{ color: '#222', fontSize: 18 }}
              dropDownContainerStyle={{
                borderColor: '#ddd',
                borderRadius: 12,
                backgroundColor: '#fff',
                width: '100%',
                marginLeft: -20,
              }}
              listMode="SCROLLVIEW"
              showArrow={true}
            />
          </View>
          {errors.role && <Text style={styles.errorText}>{errors.role}</Text>}

          {/* Email */}
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="email-outline"
              size={20}
              color="#AAA"
            />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#AAA"
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              style={styles.input}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          {/* Password */}
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={20}
              color="#AAA"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#AAA"
              secureTextEntry={!passwordVisible}
              value={form.password}
              onChangeText={(text) => handleChange('password', text)}
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
            >
              <Ionicons
                name={passwordVisible ? 'eye' : 'eye-off'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {form.password.length > 0 && (
            <Text
              style={{
                color: getPasswordStrength(form.password).color,
                marginLeft: 5,
                marginBottom: 10,
              }}
            >
              {getPasswordStrength(form.password).label} password
            </Text>
          )}
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}

          {/* Confirm Password */}
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons
              name="lock-check-outline"
              size={20}
              color="#AAA"
            />
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor="#AAA"
              secureTextEntry={!confirmVisible}
              value={form.confirm}
              onChangeText={(text) => handleChange('confirm', text)}
              style={[styles.input, { flex: 1 }]}
            />
            <TouchableOpacity
              onPress={() => setConfirmVisible(!confirmVisible)}
            >
              <Ionicons
                name={confirmVisible ? 'eye' : 'eye-off'}
                size={20}
                color="#888"
              />
            </TouchableOpacity>
          </View>
          {form.confirm.length > 0 && (
            <Text
              style={{
                color: getConfirmMatch().color,
                marginLeft: 5,
                marginBottom: 10,
              }}
            >
              {getConfirmMatch().label}
            </Text>
          )}
          {errors.confirm && (
            <Text style={styles.errorText}>{errors.confirm}</Text>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Registering...' : 'Register'}
            </Text>
          </TouchableOpacity>

          {/* Google Sign-Up */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => promptAsync()}
            disabled={!request}
          >
            <Image
              source={require('../../assets/google.png')}
              style={styles.googleIcon}
            />
            <Text style={styles.googleText}>Sign up with Google</Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <View style={styles.loginRow}>
            <Text style={{ color: '#666' }}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/account-login')}>
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Roboto_900Black',
    color: '#333',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Roboto_400Regular',
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 5,
    fontSize: 18,
    color: '#222',
    fontFamily: 'Roboto_400Regular',
  },
  errorText: { color: 'red', marginBottom: 5, marginLeft: 5 },
  button: {
    backgroundColor: '#FF8C00',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontFamily: 'Roboto_700Bold', fontSize: 16 },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
  },
  googleIcon: { width: 22, height: 22, marginRight: 10 },
  googleText: { fontSize: 16, fontFamily: 'Roboto_700Bold', color: '#333' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { color: '#FF8C00', fontFamily: 'Roboto_700Bold' },
});
