// context/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchNotifications, ACCESS_TOKEN_KEY } from '../api/api';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      // ✅ Check if user has a valid access token
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      if (!token) {
        setNotifications([]); // No token, empty notifications
        return;
      }

      // Fetch notifications only if token exists
      const data = await fetchNotifications();

      // Optional: filter only menu updates
      const menuUpdates = data.filter(
        (n) => n.type === 'new' || n.type === 'sold'
      );

      setNotifications(menuUpdates);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    // Optional: refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, loading, refresh: loadNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
