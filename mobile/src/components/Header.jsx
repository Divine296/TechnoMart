// app/components/Header.jsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Bell, Settings, Search } from 'lucide-react-native';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useNotifications } from '../context/NotificationContext';

export default function Header({ onToggleDropdown }) {
  const { notifications } = useNotifications();
  const [fontsLoaded] = useFonts({ Roboto_700Bold });
  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require('../../assets/drop_1.png')}
      resizeMode="cover"
      className="w-full overflow-hidden rounded-b-3xl pb-3"
    >
      <View className="absolute inset-0 bg-[rgba(254,192,117,0.5)]" />
      <View className="pb-4.5 pt-7.5">
        {/* Top row */}
        <View className="mx-3 mb-4.5 mt-4 flex-row items-center justify-between">
          <Text className="font-heading text-[30px] text-neutral-900">
            Home
          </Text>

          <View className="flex-row items-center">
            {/* 🔔 Notifications */}
            <TouchableOpacity
              className="ml-4"
              onPress={() => onToggleDropdown('notifications')}
            >
              <Bell size={26} color="black" />
              {notifications.length > 0 && (
                <View className="absolute -right-1 -top-1 h-[18px] w-[18px] items-center justify-center rounded-full bg-red-500">
                  <Text className="text-[10px] font-bold text-white">
                    {notifications.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* ⚙️ Settings */}
            <TouchableOpacity
              className="ml-4"
              onPress={() => onToggleDropdown('settings')}
            >
              <Settings size={26} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className="mx-[13px] flex-row items-center rounded-full bg-white px-4 py-1.5">
          <Search size={18} color="#6B7280" />
          <TextInput
            placeholder="Search Dish"
            placeholderTextColor="#9CA3AF"
            className="ml-2 flex-1 text-base text-neutral-700"
          />
        </View>
      </View>
    </ImageBackground>
  );
}
