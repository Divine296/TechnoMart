import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  View,
} from 'react-native';
import {
  Roboto_400Regular,
  Roboto_700Bold,
  useFonts,
} from '@expo-google-fonts/roboto';
import RecommendedItem from './RecommendedItem';
import { cn } from '../styles/cn';

const { width } = Dimensions.get('window');

export default function Recommended({ items = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusedItem, setFocusedItem] = useState(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef(null);
  const autoSlideRef = useRef(null);

  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  const data = useMemo(() => {
    return items
      .filter((entry) => entry && !entry.archived && entry.available !== false)
      .map((item, index) => {
        const ratingValue =
          item.rating != null && Number.isFinite(Number(item.rating))
            ? Number(item.rating)
            : null;
        const reviewsValue =
          item.reviews != null && Number.isFinite(Number(item.reviews))
            ? Number(item.reviews)
            : null;

        return {
          id: item.id || `recommended-${index}`,
          image: item.image || item.thumbnail || null,
          title: item.name || item.title || 'Menu Item',
          price: Number(item.price ?? item.amount ?? 0),
          rating: ratingValue,
          reviews: reviewsValue,
          description: item.description || '',
        };
      });
  }, [items]);

  useEffect(() => {
    if (focusedItem || data.length <= 1) return;

    autoSlideRef.current = setInterval(() => {
      setActiveIndex((current) => {
        const nextIndex = (current + 1) % data.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [data.length, focusedItem]);

  useEffect(
    () => () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    },
    []
  );

  if (!fontsLoaded || data.length === 0) return null;

  const handleLongPress = (item) => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    setFocusedItem(item);

    scaleAnim.setValue(0);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClosePopup = () => setFocusedItem(null);

  return (
    <View className="mt-4 px-2">
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToAlignment="start"
        snapToInterval={width * 0.7 + 16}
        decelerationRate="fast"
        contentContainerClassName="px-2 mt-3"
        onScroll={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (width * 0.7 + 16)
          );
          if (Number.isFinite(index)) setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => handleLongPress(item)}>
            <RecommendedItem food={item} />
          </Pressable>
        )}
        keyExtractor={(item) => item.id}
      />

      <View className="flex-row items-center justify-center">
        {Array.from({ length: data.length }).map((_, index) => (
          <View
            key={`indicator-${index}`}
            className={cn(
              'mx-1 mt-2.5 h-2 w-2 self-center rounded-full bg-neutral-300',
              index === activeIndex && 'w-4 bg-primary-500'
            )}
          />
        ))}
      </View>

      {focusedItem && (
        <Modal transparent visible animationType="fade">
          <Pressable
            className="flex-1 items-center justify-center bg-[rgba(0,0,0,0.4)]"
            onPress={handleClosePopup}
          >
            <Animated.View
              className="items-center rounded-2xl bg-white p-4 shadow-xl"
              style={[
                { width: width * 0.8, elevation: 10 },
                { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
              ]}
            >
              <RecommendedItem food={focusedItem} />
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
