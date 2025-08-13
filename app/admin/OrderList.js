import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const baseUrl = "http://localhost:5000"; // Update with your actual base URL

const OrderList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Function to fetch order data
  const getOrderData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/api/admin/getorder`);
      if (response.data) {
        setData(response.data);
        setFilteredData(response.data);
      }
    } catch (error) {
      console.error(error);
      // Check if running on web platform for error display
      const isWeb = typeof window !== 'undefined';
      if (isWeb) {
        window.alert('Failed to fetch order data');
      } else {
        Alert.alert('Error', 'Failed to fetch order data');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getOrderData();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applyFilters(query, statusFilter);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    applyFilters(searchQuery, status);
  };

  const applyFilters = (search, status) => {
    let filtered = data;

    // Apply search filter
    if (search.trim() !== '') {
      filtered = filtered.filter(order => 
        order.Customerid?.toString().includes(search) ||
        order.Hotelid?.toString().includes(search) ||
        order.id?.toString().includes(search)
      );
    }

    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === status);
    }

    setFilteredData(filtered);
  };

  // Function to delete an order
  const deleteData = async (oid) => {
    // Check if running on web platform
    const isWeb = typeof window !== 'undefined';
    
    if (isWeb) {
      // Web platform confirmation
      const confirmed = window.confirm('Are you sure you want to delete this order? This action cannot be undone.');
      if (!confirmed) return;
      
      try {
        const res = await axios.post(
          `${baseUrl}/api/admin/deleteorder`,
          { id: oid },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (res.status === 200) {
          window.alert('Order deleted successfully');
          setData(prevData => prevData.filter(item => item.id !== oid));
          setFilteredData(prevData => prevData.filter(item => item.id !== oid));
        }
      } catch (error) {
        console.error(error);
        window.alert('Failed to delete order');
      }
    } else {
      // Mobile platform confirmation
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this order?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                const res = await axios.post(
                  `${baseUrl}/api/admin/deleteorder`,
                  { id: oid },
                  {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );
                if (res.status === 200) {
                  Alert.alert('Success', 'Order deleted successfully');
                  setData(prevData => prevData.filter(item => item.id !== oid));
                  setFilteredData(prevData => prevData.filter(item => item.id !== oid));
                }
              } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to delete order');
              }
            }
          }
        ]
      );
    }
  };

  // Function to count orders by orderStatus
  const countOrders = () => {
    return filteredData.reduce((acc, order) => {
      acc[order.orderStatus] = acc[order.orderStatus] ? acc[order.orderStatus] + 1 : 1;
      return acc;
    }, {});
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#4CAF50';
      case 'cancelled': return '#f44336';
      case 'completed': return '#2196F3';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'schedule';
      case 'confirmed': return 'check-circle';
      case 'cancelled': return 'cancel';
      case 'completed': return 'done-all';
      default: return 'help-outline';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderIconContainer}>
          <Icon name="receipt" size={24} color="#fff" />
        </View>
        <View style={styles.orderMainInfo}>
          <Text style={styles.orderId}>Order #{item.id}</Text>
          <Text style={styles.orderDate}>Order Date: {formatDate(item.orderDay)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) }]}>
          <Icon name={getStatusIcon(item.orderStatus)} size={16} color="#fff" />
          <Text style={styles.statusText}>{item.orderStatus}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => deleteData(item.id)}
        >
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.orderDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.detailText}>Customer: {item.Customerid}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="hotel" size={16} color="#666" />
            <Text style={styles.detailText}>Hotel: {item.Hotelid}</Text>
          </View>
        </View>
        
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Icon name="login" size={16} color="#4CAF50" />
            <Text style={styles.dateLabel}>Check-in</Text>
            <Text style={styles.dateText}>{formatDate(item.Checkindate)}</Text>
          </View>
          <Icon name="arrow-forward" size={20} color="#666" style={styles.arrowIcon} />
          <View style={styles.dateItem}>
            <Icon name="logout" size={16} color="#f44336" />
            <Text style={styles.dateLabel}>Check-out</Text>
            <Text style={styles.dateText}>{formatDate(item.Checkoutdate)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Fetch order data when component mounts
  useEffect(() => {
    getOrderData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  const orderCounts = countOrders();
  const statusOptions = ['all', ...Object.keys(orderCounts)];

  return (
    <View style={styles.container}>
      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Icon name="receipt" size={32} color="#2196F3" />
          <Text style={styles.statNumber}>{filteredData.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        {Object.entries(orderCounts).map(([status, count]) => (
          <View key={status} style={styles.statCard}>
            <Icon name={getStatusIcon(status)} size={32} color={getStatusColor(status)} />
            <Text style={styles.statNumber}>{count}</Text>
            <Text style={styles.statLabel}>{status}</Text>
          </View>
        ))}
      </View>

      {/* Search and Filter Section */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Order ID, Customer ID, or Hotel ID..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
            <Icon name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter Buttons */}
      <View style={styles.filterContainer}>
        {statusOptions.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              statusFilter === status && styles.activeFilterButton,
              { backgroundColor: status === 'all' ? '#666' : getStatusColor(status) }
            ]}
            onPress={() => handleStatusFilter(status)}
          >
            <Text style={styles.filterButtonText}>
              {status === 'all' ? 'All' : status}
              {status !== 'all' && ` (${orderCounts[status] || 0})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="receipt" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No orders found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Orders will appear here'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  statsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statCard: {
    alignItems: 'center',
    padding: 16,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    elevation: 1,
  },
  activeFilterButton: {
    elevation: 3,
    transform: [{ scale: 1.05 }],
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  orderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orderMainInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  orderDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  dateItem: {
    alignItems: 'center',
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  arrowIcon: {
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default OrderList;
