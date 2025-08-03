import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

var baseUrl = "http://localhost:5000";

if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
}
if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const { width } = Dimensions.get('window');

const Orderlist = () => {
  const route = useRoute();
  const uid = route.params.uid;

  const [UserID, setUserId] = useState('');
  const [Orderdata, setData] = useState(null);
  const [orderStatuses, setOrderStatuses] = useState({}); 
  const [isModalVisible, setModalVisible] = useState(false); 
  const [selectedOrder, setSelectedOrder] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const fadeAnim = new Animated.Value(0); 


  useEffect(() => {
    if (uid) {
      setUserId(uid); 
    }
  }, []);

  useEffect(() => {
    if (UserID) {
      getincomingBooked();
    }
  }, [UserID]);
  
  useEffect(() => {
    if (selectedOrder) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedOrder]);

  const setActionLoadingState = (orderId, isLoading) => {
    setActionLoading(prev => ({ ...prev, [orderId]: isLoading }));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getincomingBooked();
    setRefreshing(false);
  };


  const AcceptedBooked = async (id) => {
    if (!id) {
      console.log('No order ID');
      return;
    }
    
    setActionLoadingState(id, true);
    console.log(id); 
    try {
      const res = await axios.post(
        `${baseUrl}/api/accpetorder`,
        { orderid: id },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert('Success', 'Order has been accepted!', [
        { text: 'OK', onPress: () => setModalVisible(false) }
      ]);
      setOrderStatuses((prev) => ({ ...prev, [id]: 'Accepted' })); 
      await getincomingBooked();
    } catch (error) {
      console.log('Error accepting order:', error);
      Alert.alert('Error', 'Failed to accept order. Please try again.');
    } finally {
      setActionLoadingState(id, false);
    }
  };
  

  const DeniedBooked = async (id) => {
    if (!id) {
      console.log('No order ID');
      return;
    }
    
    setActionLoadingState(id, true);
    console.log(id); 
    try {
      const res = await axios.post(
        `${baseUrl}/api/deniedOrder`,
        { orderid: id },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert('Success', 'Order has been denied!', [
        { text: 'OK', onPress: () => setModalVisible(false) }
      ]);
      setOrderStatuses((prev) => ({ ...prev, [id]: 'Denied' })); 
      await getincomingBooked();
    } catch (error) {
      console.log('Error denying order:', error);
      Alert.alert('Error', 'Failed to deny order. Please try again.');
    } finally {
      setActionLoadingState(id, false);
    }
  };
  const CheckinOrder = async (id) => {
    if (!id) {
      console.log('No order ID');
      return;
    }
    
    setActionLoadingState(id, true);
    console.log(id); 
    try {
      const res = await axios.post(
        `${baseUrl}/api/checkin`,
        { orderid: id },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert('Success', 'Guest has been checked in!', [
        { text: 'OK', onPress: () => setModalVisible(false) }
      ]);
      setOrderStatuses((prev) => ({ ...prev, [id]: 'Check in' })); 
      await getincomingBooked();
    } catch (error) {
      console.log('Error checking in order:', error);
      Alert.alert('Error', 'Failed to check in. Please try again.');
    } finally {
      setActionLoadingState(id, false);
    }
  };
  const CheckoutOrder = async (id) => {
    if (!id) {
      console.log('No order ID');
      return;
    }
    
    setActionLoadingState(id, true);
    console.log(id); 
    try {
      const res = await axios.post(
        `${baseUrl}/api/checkout`,
        { orderid: id },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      Alert.alert('Success', 'Guest has been checked out!', [
        { text: 'OK', onPress: () => setModalVisible(false) }
      ]);
      setOrderStatuses((prev) => ({ ...prev, [id]: 'Check out' })); 
      await getincomingBooked();
    } catch (error) {
      console.log('Error checking out order:', error);
      Alert.alert('Error', 'Failed to check out. Please try again.');
    } finally {
      setActionLoadingState(id, false);
    }
  };
  


  

  const getincomingBooked = async () => {
    if (!UserID) {
      console.log('UserID is missing:', UserID);
      return;
    }
    
    setLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/api/getbooked`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          userID: UserID,
        },
      });

      if (res.data && res.data.length > 0) {
        setData(res.data);

        const updatedStatuses = {};
        res.data.forEach((order) => {
          updatedStatuses[order.OrderID] = order.orderStatus; 
        });

        setOrderStatuses(updatedStatuses); 
      } else {
        setData([]);
        console.log('No orders found');
      }
    } catch (error) {
      console.log('Error fetching booked orders:', error);
      Alert.alert('Error', 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return '#FFA500';
      case 'Accepted': return '#4CAF50';
      case 'Denied': return '#F44336';
      case 'Check in': return '#2196F3';
      case 'Check out': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return 'time-outline';
      case 'Accepted': return 'checkmark-circle-outline';
      case 'Denied': return 'close-circle-outline';
      case 'Check in': return 'log-in-outline';
      case 'Check out': return 'log-out-outline';
      default: return 'help-circle-outline';
    }
  };

  const renderUserOrder = () => (
    <View style={styles.meetupList}>
      {Orderdata && Array.isArray(Orderdata) && Orderdata.length > 0 ? (
        Orderdata.map((item) => (
          <TouchableOpacity 
            key={item.OrderID} 
            style={[
              styles.postContainer,
              { borderLeftColor: getStatusColor(item.orderStatus) }
            ]}
            onPress={() => {
              setSelectedOrder(item); 
              setModalVisible(true); 
            }}
            activeOpacity={0.7}
          >
            <View style={styles.postDetails}>
              <View style={styles.orderHeader}>
                <Text style={styles.postTitleText}>Order #{item.OrderID}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) }]}>
                  <Icon 
                    name={getStatusIcon(item.orderStatus)} 
                    size={12} 
                    color="white" 
                    style={styles.statusIcon}
                  />
                  <Text style={styles.statusText}>{orderStatuses[item.OrderID] || 'Unknown'}</Text>
                </View>
              </View>
              
              <View style={styles.dateContainer}>
                <View style={styles.dateRow}>
                  <Icon name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.dateLabel}>Check-in:</Text>
                  <Text style={styles.dateValue}>
                    {new Date(item.Checkindate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.dateRow}>
                  <Icon name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.dateLabel}>Check-out:</Text>
                  <Text style={styles.dateValue}>
                    {new Date(item.Checkoutdate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              {item.tkDetails && (
                <View style={styles.guestInfo}>
                  <Icon name="person-outline" size={14} color="#666" />
                  <Text style={styles.guestName}>{item.tkDetails.name}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.chevronContainer}>
              <Icon name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="receipt-outline" size={64} color="#ccc" />
          <Text style={styles.noDataText}>No orders found</Text>
          <Text style={styles.noDataSubtext}>New bookings will appear here</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headers}>
        <View style={styles.headerContent}>
          <Text style={styles.headersText}>Order Notifications</Text>
          <Text style={styles.headerSubtext}>
            {Orderdata ? `${Orderdata.length} orders` : 'Loading...'}
          </Text>
        </View>
        <View style={styles.headerIcon}>
          <Icon style={styles.iconStyle} name="notifications" size={24} />
        </View>
      </View>
  
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#4CAF50']}
              tintColor="#4CAF50"
            />
          }
        >
          {Orderdata ? renderUserOrder() : (
            <View style={styles.emptyContainer}>
              <Icon name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.noDataText}>No orders yet</Text>
              <Text style={styles.noDataSubtext}>Pull down to refresh</Text>
            </View>
          )}
        </ScrollView>
      )}
  
      {selectedOrder && (
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalContent, { opacity: fadeAnim }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderText}>Booking Details</Text>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.orderInfoCard}>
                  <Text style={styles.orderIdText}>Order #{selectedOrder.OrderID}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.orderStatus) }]}>
                    <Icon 
                      name={getStatusIcon(selectedOrder.orderStatus)} 
                      size={12} 
                      color="white" 
                    />
                    <Text style={styles.statusText}>{selectedOrder.orderStatus}</Text>
                  </View>
                </View>

                <View style={styles.detailsGrid}>
                  <View style={styles.detailCard}>
                    <Text style={styles.cardTitle}>Booking Information</Text>
                    <View style={styles.detailRow}>
                      <Icon name="business-outline" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Hotel ID:</Text>
                      <Text style={styles.detailValue}>{selectedOrder.HotelID}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Check-in:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedOrder.Checkindate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="calendar-outline" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Check-out:</Text>
                      <Text style={styles.detailValue}>
                        {new Date(selectedOrder.Checkoutdate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailCard}>
                    <Text style={styles.cardTitle}>Guest Information</Text>
                    <View style={styles.detailRow}>
                      <Icon name="person-outline" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Name:</Text>
                      <Text style={styles.detailValue}>
                        {selectedOrder.tkDetails?.name || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="mail-outline" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailValue}>
                        {selectedOrder.tkDetails?.email || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Icon name="call-outline" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Phone:</Text>
                      <Text style={styles.detailValue}>
                        {selectedOrder.tkDetails?.phoneNumber || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                {selectedOrder.orderStatus === 'Accepted' ? (
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.checkinButton]}
                      onPress={() => CheckinOrder(selectedOrder.OrderID)}
                      disabled={actionLoading[selectedOrder.OrderID]}
                    >
                      {actionLoading[selectedOrder.OrderID] ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Icon name="log-in-outline" size={20} color="white" />
                          <Text style={styles.actionButtonText}>Check In</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.checkoutButton]}
                      onPress={() => CheckoutOrder(selectedOrder.OrderID)}
                      disabled={actionLoading[selectedOrder.OrderID]}
                    >
                      {actionLoading[selectedOrder.OrderID] ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Icon name="log-out-outline" size={20} color="white" />
                          <Text style={styles.actionButtonText}>Check Out</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : selectedOrder.orderStatus === 'Pending' ? (
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => AcceptedBooked(selectedOrder.OrderID)}
                      disabled={actionLoading[selectedOrder.OrderID]}
                    >
                      {actionLoading[selectedOrder.OrderID] ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Icon name="checkmark-outline" size={20} color="white" />
                          <Text style={styles.actionButtonText}>Accept</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.denyButton]}
                      onPress={() => DeniedBooked(selectedOrder.OrderID)}
                      disabled={actionLoading[selectedOrder.OrderID]}
                    >
                      {actionLoading[selectedOrder.OrderID] ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Icon name="close-outline" size={20} color="white" />
                          <Text style={styles.actionButtonText}>Deny</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : selectedOrder.orderStatus === 'Checkin' ? (
                  <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.checkoutButton]}
                      onPress={() => CheckoutOrder(selectedOrder.OrderID)}
                      disabled={actionLoading[selectedOrder.OrderID]}
                    >
                      {actionLoading[selectedOrder.OrderID] ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <>
                          <Icon name="log-out-outline" size={20} color="white" />
                          <Text style={styles.actionButtonText}>Check Out</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.noActionsContainer}>
                    <Icon name="information-circle-outline" size={24} color="#666" />
                    <Text style={styles.noActionsText}>
                      No actions available for this order status
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  headers: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerContent: {
    flex: 1,
  },
  headersText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
  },
  iconStyle: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  meetupList: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  postDetails: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  dateContainer: {
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '500',
  },
  dateValue: {
    fontSize: 14,
    color: '#333',
  },
  guestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  guestName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    fontStyle: 'italic',
  },
  chevronContainer: {
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    fontWeight: '600',
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  orderInfoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  orderIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsGrid: {
    gap: 16,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '500',
    minWidth: 70,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  modalActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minHeight: 48,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  denyButton: {
    backgroundColor: '#F44336',
  },
  checkinButton: {
    backgroundColor: '#2196F3',
  },
  checkoutButton: {
    backgroundColor: '#9C27B0',
  },
  noActionsContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noActionsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default Orderlist;
