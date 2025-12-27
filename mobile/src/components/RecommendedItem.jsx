import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  Pressable,
  Dimensions,
  StyleSheet,
} from 'react-native';

const { width } = Dimensions.get('window');

// Default images array
const defaultImages = [
  require('../../assets/reco1.jpg'),
  require('../../assets/reco2.jpg'),
  require('../../assets/reco3.jpg'),
];

export default function RecommendedItem({ food }) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = () => setModalVisible(true);

  // Pick a random default image if food.image is missing
  const getDefaultImage = () =>
    defaultImages[Math.floor(Math.random() * defaultImages.length)];

  const imageSrc = !food.image
    ? getDefaultImage()
    : typeof food.image === 'string'
      ? { uri: food.image }
      : food.image;

  return (
    <View>
      <Pressable onLongPress={handleLongPress} delayLongPress={300}>
        <Image source={imageSrc} style={styles.foodImage} />
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.popupCard}>
            <Image source={imageSrc} style={styles.popupImage} />
            <View style={styles.popupDetails}>
              <Text style={styles.foodName}>{food.title}</Text>
              <Text style={styles.foodPrice}>₱{food.price.toFixed(2)}</Text>
              {food.rating != null && (
                <Text style={styles.foodRating}>
                  ⭐ {food.rating} ({food.reviews ?? 0} reviews)
                </Text>
              )}
              {food.description && (
                <Text style={styles.foodDescription}>{food.description}</Text>
              )}
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  foodImage: { width: 140, height: 140, borderRadius: 12, margin: 8 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    width: width * 0.8,
    alignItems: 'center',
    elevation: 10,
  },
  popupImage: {
    width: '100%',
    height: width * 0.5,
    borderRadius: 16,
    marginBottom: 16,
  },
  popupDetails: { alignItems: 'center' },
  foodName: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  foodPrice: { fontSize: 18, color: '#f59e0b', marginBottom: 4 },
  foodRating: { fontSize: 16, color: '#6b7280' },
  foodDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 4,
  },
});
