import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  ImageBackground,
  Modal,
  TouchableOpacity,
  ScrollView,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchUserOrders } from '../../api/api';
import { useRouter } from 'expo-router';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import { LinearGradient } from 'expo-linear-gradient';

const statusSteps = [
  'Pending',
  'Accepted',
  'In Progress',
  'Ready',
  'Completed',
];
const statusColors = ['#f39c12', '#3498db', '#8e44ad', '#27ae60', '#2ecc71'];
const statusMapping = {
  pending: 0,
  accepted: 1,
  in_progress: 2,
  ready: 3,
  completed: 4,
  cancelled: 0,
};

export default function OrderTrackingScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [cancelledOrders, setCancelledOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const translateY = useRef(new Animated.Value(0)).current;
  const panResponderRef = useRef(null);

  const loadOrders = async () => {
    try {
      const data = await fetchUserOrders();
      const list = Array.isArray(data) ? data : [];
      setOrders(
        list.filter(
          (o) =>
            (o.status ?? '').toLowerCase() !== 'completed' &&
            (o.status ?? '').toLowerCase() !== 'cancelled'
        )
      );
      setCompletedOrders(
        list.filter((o) => (o.status ?? '').toLowerCase() === 'completed')
      );
      setCancelledOrders(
        list.filter((o) => (o.status ?? '').toLowerCase() === 'cancelled')
      );
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
      setCompletedOrders([]);
      setCancelledOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!panResponderRef.current) {
    panResponderRef.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dy > 0) translateY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 120) {
          Animated.timing(translateY, {
            toValue: 1000,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            closeDetailModal(); // first close the modal
            translateY.setValue(0); // then reset position
          });
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    });
  }

  const openDetailModal = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const closeDetailModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  const renderStatusBar = (order) => {
    const statusIndex = statusMapping[(order.status || '').toLowerCase()] ?? 0;
    return (
      <View style={styles.statusContainer}>
        {statusSteps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                {
                  backgroundColor:
                    index <= statusIndex ? statusColors[index] : '#ccc',
                },
              ]}
            />
            {index < statusSteps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor:
                      index < statusIndex ? statusColors[index] : '#ccc',
                  },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderOrderItem = (order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    const totalAmount = items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    return (
      <LinearGradient
        key={order.id ?? order.order_number}
        colors={['#fff7f0', '#fff']}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.orderCard}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Order #{order.order_number}</Text>
          <View style={styles.statusTextContainer}>
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    statusColors[
                      statusMapping[(order.status || '').toLowerCase()] ?? 0
                    ],
                },
              ]}
            >
              {(order.status || '')
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </Text>
          </View>
        </View>

        <Text style={styles.dateText}>
          Ordered on: {new Date(order.created_at).toLocaleString()}
        </Text>

        {renderStatusBar(order)}

        {items.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.itemImage} />
            ) : (
              <View style={[styles.itemImage, styles.noImage]}>
                <Text style={{ color: '#aaa' }}>No Image</Text>
              </View>
            )}
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name || 'Unnamed Item'}</Text>
              {item.size && (
                <Text style={styles.itemDetail}>Size: {item.size}</Text>
              )}
              {item.customize && (
                <Text style={styles.itemDetail}>
                  Customize: {item.customize}
                </Text>
              )}
              <Text style={styles.itemDetail}>Qty: {item.quantity ?? 0}</Text>
            </View>
            <View style={styles.itemPriceContainer}>
              <Text style={styles.itemPrice}>
                ₱{(item.price || 0).toFixed(2)} × {item.quantity ?? 0}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalAmount}>₱{totalAmount.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => openDetailModal(order)}
        >
          <Text style={styles.viewMoreText}>View Details</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/drop_1.png')}
        resizeMode="cover"
        style={styles.headerBackground}
      >
        <View style={styles.overlay} pointerEvents="none" />
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.push('/home-dashboard')}>
              <Ionicons name="arrow-back" size={26} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={() => setShowCompleted(true)}>
                <Ionicons name="list-outline" size={26} color="black" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowCancelled(true)}>
                <Ionicons name="trash-outline" size={26} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ImageBackground>

      {orders.length ? (
        <FlatList
          data={orders}
          keyExtractor={(order) =>
            (order.order_number ?? order.id ?? Math.random()).toString()
          }
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => renderOrderItem(item)}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No orders found</Text>
        </View>
      )}

      {/* ---------------- REDESIGNED ORDER DETAILS MODAL ---------------- */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={closeDetailModal}
      >
        <View style={styles.modalBackground}>
          <Animated.View
            {...panResponderRef.current.panHandlers}
            style={[styles.modalContainer, { transform: [{ translateY }] }]}
          >
            <ScrollView
              contentContainerStyle={{ paddingBottom: 120 }} // extra space for sticky button
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Order Details</Text>
                <TouchableOpacity onPress={closeDetailModal}>
                  <Ionicons name="close" size={26} color="#333" />
                </TouchableOpacity>
              </View>

              {selectedOrder ? (
                <>
                  {/* Order Info */}
                  <View style={styles.modalCard}>
                    <Text style={styles.modalCardTitle}>
                      Order #{selectedOrder.order_number}
                    </Text>
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color:
                            statusColors[
                              statusMapping[
                                (selectedOrder.status || '').toLowerCase()
                              ] ?? 0
                            ],
                        },
                      ]}
                    >
                      {(selectedOrder.status || '')
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Text>
                    <Text style={styles.modalSmallText}>
                      Ordered on:{' '}
                      {new Date(selectedOrder.created_at).toLocaleString()}
                    </Text>
                    <View style={{ marginVertical: 8 }}>
                      {renderStatusBar(selectedOrder)}
                    </View>
                  </View>

                  {/* Items List */}
                  <View style={styles.modalCard}>
                    <Text style={styles.modalCardTitle}>Items</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {Array.isArray(selectedOrder.items) &&
                        selectedOrder.items.map((it, idx) => (
                          <View
                            key={idx}
                            style={{
                              flexDirection: 'column',
                              alignItems: 'center',
                              marginRight: 12,
                            }}
                          >
                            {it.image ? (
                              <Image
                                source={{ uri: it.image }}
                                style={styles.modalItemImage}
                              />
                            ) : (
                              <View
                                style={[styles.modalItemImage, styles.noImage]}
                              >
                                <Text style={{ color: '#aaa' }}>No Image</Text>
                              </View>
                            )}
                            <Text style={styles.modalItemName}>{it.name}</Text>
                            <Text style={styles.modalItemSmall}>
                              Qty: {it.quantity ?? 0}
                            </Text>
                            {it.size && (
                              <Text style={styles.modalItemSmall}>
                                Size: {it.size}
                              </Text>
                            )}
                            {it.customize && (
                              <Text style={styles.modalItemSmall}>
                                Customize: {it.customize}
                              </Text>
                            )}
                            <Text style={styles.modalItemPrice}>
                              ₱
                              {((it.price || 0) * (it.quantity || 1)).toFixed(
                                2
                              )}
                            </Text>
                          </View>
                        ))}
                    </ScrollView>
                  </View>

                  {/* Payment & Totals */}
                  <View style={styles.modalCard}>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Payment Method</Text>
                      <Text style={styles.modalValue}>
                        {selectedOrder.payment_method ||
                          selectedOrder.payment ||
                          'N/A'}
                      </Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={styles.modalLabel}>Order Date</Text>
                      <Text style={styles.modalValue}>
                        {selectedOrder.created_at
                          ? new Date(selectedOrder.created_at).toLocaleString()
                          : 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.modalTotals}>
                      <Text style={styles.modalTotalLabel}>Total</Text>
                      <Text style={styles.modalTotalValue}>
                        ₱
                        {(Array.isArray(selectedOrder.items)
                          ? selectedOrder.items.reduce(
                              (s, it) =>
                                s + (it.price || 0) * (it.quantity || 1),
                              0
                            )
                          : 0
                        ).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={{ padding: 20 }}>
                  <Text style={{ textAlign: 'center', color: '#555' }}>
                    No order selected
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Sticky Cancel Button */}
            {selectedOrder &&
              selectedOrder.status &&
              !['completed', 'cancelled'].includes(
                selectedOrder.status.toLowerCase()
              ) && (
                <View style={styles.stickyButtonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: '#d9534f' },
                    ]}
                    onPress={() => cancelOrder(selectedOrder.order_number)}
                  >
                    <Text style={styles.actionButtonText}>Cancel Order</Text>
                  </TouchableOpacity>
                </View>
              )}
          </Animated.View>
        </View>
      </Modal>

      {/* Completed Orders Modal */}
      <Modal visible={showCompleted} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Completed Orders</Text>
              <TouchableOpacity onPress={() => setShowCompleted(false)}>
                <Ionicons name="close" size={26} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {completedOrders.length ? (
                completedOrders.map((order) => (
                  <View
                    key={order.id ?? order.order_number}
                    style={styles.modalOrderWrapper}
                  >
                    {renderOrderItem(order)}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No completed orders found.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Cancelled Orders Modal */}
      <Modal visible={showCancelled} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cancelled Orders</Text>
              <TouchableOpacity onPress={() => setShowCancelled(false)}>
                <Ionicons name="close" size={26} color="black" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              {cancelledOrders.length ? (
                cancelledOrders.map((order) => (
                  <View
                    key={order.id ?? order.order_number}
                    style={styles.modalOrderWrapper}
                  >
                    {renderOrderItem(order)}
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>No cancelled orders found.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFE6C7' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: {
    marginTop: 5,
    fontSize: 18,
    fontFamily: 'Roboto_400Regular',
    color: '#999',
    textAlign: 'center',
  },
  headerBackground: {
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(254,192,117,0.5)',
    zIndex: 0,
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 14,
    zIndex: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 30, fontFamily: 'Roboto_700Bold', color: 'black' },

  orderCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#f97316',
    shadowOpacity: 0.1,
  },
  orderHeader: { marginBottom: 8, position: 'relative' },
  orderId: { fontSize: 20, fontFamily: 'Roboto_700Bold', color: '#111' },
  statusTextContainer: {
    position: 'absolute',
    top: -10,
    right: -10,
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#fef6f0',
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: { fontSize: 16, fontFamily: 'Roboto_500Medium' },
  dateText: {
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    color: '#555',
    marginBottom: 8,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    paddingVertical: 6,
    backgroundColor: '#fef6f0',
    borderRadius: 12,
  },
  stepContainer: { flexDirection: 'row', alignItems: 'center' },
  stepCircle: { width: 14, height: 14, borderRadius: 7 },
  stepLine: { width: 28, height: 3, marginHorizontal: 3, borderRadius: 2 },

  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  itemImage: { width: 60, height: 60, borderRadius: 12, marginRight: 12 },
  noImage: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontFamily: 'Roboto_700Bold', color: '#333' },
  itemDetail: { fontSize: 14, fontFamily: 'Roboto_400Regular', color: '#555' },
  itemPriceContainer: { alignItems: 'flex-end' },
  itemPrice: { fontSize: 14, fontFamily: 'Roboto_400Regular', color: '#888' },

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  totalText: { fontSize: 16, fontFamily: 'Roboto_700Bold', color: '#111' },
  totalAmount: { fontSize: 18, fontFamily: 'Roboto_700Bold', color: '#f97316' },

  viewMoreButton: {
    marginTop: 10,
    padding: 8,
    borderRadius: 10,
    backgroundColor: '#f97316',
    width: '48%',
    alignSelf: 'center',
  },
  viewMoreText: {
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'Roboto_700Bold',
  },

  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    maxHeight: '80%',
    backgroundColor: '#FFE6C7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalLabel: { fontSize: 16, fontFamily: 'Roboto_500Medium', color: '#333' },
  modalValue: { fontSize: 16, fontFamily: 'Roboto_400Regular', color: '#555' },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalItemImage: { width: 60, height: 60, borderRadius: 12 },
  modalItemName: { fontSize: 16, fontFamily: 'Roboto_700Bold', color: '#333' },
  modalItemSmall: {
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    color: '#555',
  },
  modalItemPrice: {
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    color: '#888',
    marginLeft: 10,
  },
  modalTotals: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  modalTotalLabel: {
    fontSize: 16,
    fontFamily: 'Roboto_700Bold',
    color: '#111',
  },
  modalTotalValue: {
    fontSize: 18,
    fontFamily: 'Roboto_700Bold',
    color: '#f97316',
  },
  actionButton: { padding: 10, borderRadius: 12 },
  actionButtonText: {
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    textAlign: 'center',
  },

  stickyButtonContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    backgroundColor: '#FFE6C7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  modalScrollContent: { paddingBottom: 20 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: { fontSize: 20, fontFamily: 'Roboto_700Bold', color: '#111' },
  modalOrderWrapper: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#FEC075',
    backgroundColor: '#fff',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  modalCardTitle: {
    fontSize: 18,
    fontFamily: 'Roboto_700Bold',
    color: '#111',
    marginBottom: 6,
  },
  modalSmallText: {
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    color: '#555',
    marginBottom: 4,
  },
});
