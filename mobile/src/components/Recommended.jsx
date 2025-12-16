import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  Roboto_400Regular,
  Roboto_700Bold,
  useFonts,
} from '@expo-google-fonts/roboto';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '../styles/cn';

const { width } = Dimensions.get('window');

const formatCurrency = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 'PHP --';
  }
  return `PHP ${numeric.toFixed(2)}`;
};

const imageSource = (image) => {
  if (!image) {
    return require('../../assets/reco1.jpg');
  }
  if (typeof image === 'string') {
    return { uri: image };
  }
  return image;
};

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
    if (focusedItem || data.length <= 1) {
      return undefined;
    }

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
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    };
  }, [data.length, focusedItem]);

  useEffect(
    () => () => {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current);
      }
    },
    []
  );

  if (!fontsLoaded || data.length === 0) {
    return null;
  }

  const handleLongPress = (item) => {
    if (autoSlideRef.current) {
      clearInterval(autoSlideRef.current);
    }
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

  const handleClosePopup = () => {
    setFocusedItem(null);
  };

  return (
    <View className="mt-4 px-2">
      <Text className="font-heading text-xl text-neutral-900">
        Recommended For You
      </Text>
      <View className="mt-1 h-1 w-14 rounded-full bg-primary-500" />
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
          if (Number.isFinite(index)) {
            setActiveIndex(index);
          }
        }}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => handleLongPress(item)}>
            <View
              className="mx-2 overflow-hidden rounded-2xl shadow-lg"
              style={{
                width: width * 0.7,
                height: width * 0.45,
                elevation: 5,
              }} // NativeWind: dynamic card sizing & Android elevation require inline style
            >
              <Image
                source={imageSource(item.image)}
                className="h-full w-full"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: '40%',
                }} // NativeWind: expo-linear-gradient requires style prop
              />
              <Text className="absolute bottom-3 left-3 font-heading text-lg text-white">
                {item.title}
              </Text>
            </View>
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
                {
                  width: width * 0.8,
                  elevation: 10,
                }, // NativeWind: popup sizing & Android elevation require inline style
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <Image
                source={imageSource(focusedItem.image)}
                className="mb-4 w-full rounded-xl"
                style={{ height: width * 0.5 }} // NativeWind: dynamic image height requires inline style
              />
              <View className="items-center">
                <Text className="mb-1.5 font-heading text-xl text-neutral-900">
                  {focusedItem.title}
                </Text>
                <Text className="mb-1 text-lg text-warning-500">
                  {formatCurrency(focusedItem.price)}
                </Text>
                {Number.isFinite(focusedItem.rating) ? (
                  <Text className="text-sm text-neutral-500">
                    Rating: {focusedItem.rating.toFixed(1)}
                    {Number.isFinite(focusedItem.reviews)
                      ? ` (${focusedItem.reviews} reviews)`
                      : ''}
                  </Text>
                ) : null}
                {focusedItem.description ? (
                  <Text className="mt-1.5 text-center text-sm text-neutral-600">
                    {focusedItem.description}
                  </Text>
                ) : null}
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}
