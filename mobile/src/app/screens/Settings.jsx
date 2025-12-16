// app/appsettings.jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AppSettings() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>App Settings Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 18, fontWeight: 'bold' },
});
