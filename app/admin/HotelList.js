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

const baseUrl = "http://localhost:5000";

const HotelList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch hotel data
  const getHotelData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/api/admin/gethotel`);
      if (response.data) {
        setData(response.data);
        setFilteredData(response.data);
      }
    } catch (error) {
      console.error(error);
      // Check if running on web platform for error display
      const isWeb = typeof window !== 'undefined';
      if (isWeb) {
        window.alert('Failed to fetch hotel data');
      } else {
        Alert.alert('Error', 'Failed to fetch hotel data');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getHotelData();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(hotel => 
        hotel.HotelName?.toLowerCase().includes(query.toLowerCase()) ||
        hotel.city?.toLowerCase().includes(query.toLowerCase()) ||
        hotel.country?.toLowerCase().includes(query.toLowerCase()) ||
        hotel.Address?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  
  const deleteData = async (oid) => {
    // Check if running on web platform
    const isWeb = typeof window !== 'undefined';
    
    if (isWeb) {
      // Web platform confirmation
      const confirmed = window.confirm('Are you sure you want to delete this hotel? This action cannot be undone.');
      if (!confirmed) return;
      
      try {
        const res = await axios.post(
          `${baseUrl}/api/admin/deletehotel`,
          { id: oid }, 
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
  
        if (res.status === 200) {
          window.alert('Hotel deleted successfully');
          setData((prevData) => prevData.filter(item => item.PostID !== oid));
          setFilteredData((prevData) => prevData.filter(item => item.PostID !== oid));
        }
      } catch (error) {
        console.error(error);
        window.alert('Failed to delete hotel');
      }
    } else {
      // Mobile platform confirmation
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this hotel?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: async () => {
              try {
                const res = await axios.post(
                  `${baseUrl}/api/admin/deletehotel`,
                  { id: oid }, 
                  {
                    headers: {
                      'Content-Type': 'application/json',
                    },
                  }
                );
          
                if (res.status === 200) {
                  Alert.alert('Success', 'Hotel deleted successfully');
                  setData((prevData) => prevData.filter(item => item.PostID !== oid));
                  setFilteredData((prevData) => prevData.filter(item => item.PostID !== oid));
                }
              } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to delete hotel');
              }
            }
          }
        ]
      );
    }
  };

  const renderHotelItem = ({ item }) => (
    <View style={styles.hotelCard}>
      <View style={styles.hotelHeader}>
        <View style={styles.hotelIconContainer}>
          <Icon name="hotel" size={24} color="#fff" />
        </View>
        <View style={styles.hotelMainInfo}>
          <Text style={styles.hotelName}>{item.HotelName}</Text>
          <Text style={styles.hotelAddress}>{item.Address}</Text>
          <Text style={styles.hotelLocation}>{item.city}, {item.country}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => deleteData(item.PostID)}
        >
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.hotelDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="phone" size={16} color="#666" />
            <Text style={styles.detailText}>{item.PhoneNumber}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="attach-money" size={16} color="#4CAF50" />
            <Text style={styles.priceText}>${item.price}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.detailText}>Owner ID: {item.PosterID}</Text>
          </View>
          <View style={styles.detailItem}>
            <Icon name="badge" size={16} color="#666" />
            <Text style={styles.detailText}>Hotel ID: {item.PostID}</Text>
          </View>
        </View>
        
        {item.tkdetails && item.tkdetails.Username && (
          <View style={styles.ownerInfo}>
            <Icon name="account-circle" size={16} color="#2196F3" />
            <Text style={styles.ownerText}>Owner: {item.tkdetails.Username}</Text>
          </View>
        )}
      </View>
    </View>
  );
  useEffect(() => {
    getHotelData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Loading hotels...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Icon name="hotel" size={32} color="#2196F3" />
          <Text style={styles.statNumber}>{filteredData.length}</Text>
          <Text style={styles.statLabel}>Total Hotels</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="location-city" size={32} color="#4CAF50" />
          <Text style={styles.statNumber}>
            {new Set(filteredData.map(hotel => hotel.city)).size}
          </Text>
          <Text style={styles.statLabel}>Cities</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="public" size={32} color="#FF9800" />
          <Text style={styles.statNumber}>
            {new Set(filteredData.map(hotel => hotel.country)).size}
          </Text>
          <Text style={styles.statLabel}>Countries</Text>
        </View>
      </View>

      {/* Header with Refresh Button */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Hotel Management</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Icon 
            name="refresh" 
            size={24} 
            color={refreshing ? "#ccc" : "#fff"} 
          />
          {refreshing && (
            <ActivityIndicator 
              size="small" 
              color="#fff" 
              style={styles.refreshSpinner}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search hotels by name, city, country, or address..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
            <Icon name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Hotels List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.PostID.toString()}
        renderItem={renderHotelItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="hotel" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hotels found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Hotels will appear here'}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a237e',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    backgroundColor: '#3f51b5',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: 'relative',
  },
  refreshSpinner: {
    position: 'absolute',
  },
  statsSection: {
    flexDirection: 'row',
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
  },
  statNumber: {
    fontSize: 24,
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
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  hotelCard: {
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
  hotelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  hotelIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hotelMainInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hotelAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  hotelDetails: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
  },
  ownerText: {
    fontSize: 14,
    color: '#1976d2',
    marginLeft: 8,
    fontWeight: '500',
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

export default HotelList;
