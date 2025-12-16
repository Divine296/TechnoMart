import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function RecommendationItem({ food }) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleLongPress = () => {
    // Show floating popup
    setModalVisible(true);
  };

  return (
    <View>
      <Pressable onLongPress={handleLongPress} delayLongPress={300}>
        <Image source={food.image} style={styles.foodImage} />
      </Pressable>

      {/* Popup Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.popupCard}>
            <Image source={food.image} style={styles.popupImage} />
            <View style={styles.popupDetails}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodPrice}>₱{food.price}</Text>
              <Text style={styles.foodRating}>
                ⭐ {food.rating} ({food.reviews} reviews)
              </Text>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  foodImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    margin: 8,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  popupImage: {
    width: '100%',
    height: width * 0.5,
    borderRadius: 16,
    marginBottom: 16,
  },
  popupDetails: {
    alignItems: 'center',
  },
  foodName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  foodPrice: {
    fontSize: 18,
    color: '#f59e0b',
    marginBottom: 4,
  },
  foodRating: {
    fontSize: 16,
    color: '#6b7280',
  },
});
