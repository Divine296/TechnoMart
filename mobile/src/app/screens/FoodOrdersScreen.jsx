// app/screens/FoodOrdersScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FoodOrdersScreen() {
  const [currentOrders, setCurrentOrders] = useState([
    {
      id: '101',
      date: '2025-08-28',
      status: 'Preparing',
      items: ['Chicken Meal', 'Rice', 'Iced Tea'],
      total: 180,
    },
  ]);

  const [pastOrders, setPastOrders] = useState([
    {
      id: '099',
      date: '2025-08-25',
      status: 'Delivered',
      items: ['Burger', 'Fries', 'Coke'],
      total: 250,
    },
    {
      id: '098',
      date: '2025-08-20',
      status: 'Delivered',
      items: ['Pizza', 'Iced Tea'],
      total: 320,
    },
  ]);

  const renderOrderCard = (order) => (
    <View key={order.id} style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.date}>{order.date}</Text>
        <Text
          style={[
            styles.status,
            order.status === 'Delivered' ? styles.delivered : styles.pending,
          ]}
        >
          {order.status}
        </Text>
      </View>

      <Text style={styles.items}>{order.items.join(', ')}</Text>

      <View style={styles.row}>
        <Text style={styles.total}>₱{order.total}</Text>
        <TouchableOpacity>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Food Orders</Text>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Current Orders */}
        <Text style={styles.sectionHeader}>Current Orders</Text>
        {currentOrders.length > 0 ? (
          currentOrders.map(renderOrderCard)
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="time-outline" size={40} color="#999" />
            <Text style={styles.emptyText}>No current orders</Text>
          </View>
        )}

        {/* Past Orders */}
        <Text style={styles.sectionHeader}>Past Orders</Text>
        {pastOrders.length > 0 ? (
          pastOrders.map(renderOrderCard)
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={40} color="#999" />
            <Text style={styles.emptyText}>No past orders</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 20,
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 20,
    color: '#444',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 14,
    color: '#555',
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
  },
  delivered: {
    color: 'green',
  },
  pending: {
    color: 'orange',
  },
  items: {
    marginTop: 6,
    fontSize: 14,
    color: '#333',
  },
  total: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111',
  },
  emptyBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  emptyText: {
    marginTop: 6,
    color: '#777',
  },
});
