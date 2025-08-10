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

const ReviewList = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const deleteData = async (oid) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this review?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await axios.post(
                `${baseUrl}/api/admin/deletereview`,
                { id: oid },
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
              if (res.status === 200) {
                Alert.alert('Success', 'Review deleted successfully');
                setData(prevData => prevData.filter(item => item.ReviewID !== oid));
                setFilteredData(prevData => prevData.filter(item => item.ReviewID !== oid));
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete review');
            }
          }
        }
      ]
    );
  };

  const getReviewData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/api/admin/getreview`);
      if (response.data) {
        setData(response.data);
        setFilteredData(response.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch review data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getReviewData();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(review => 
        review.ReviewID?.toString().includes(query) ||
        review.HotelID?.toString().includes(query) ||
        review.ReviewerID?.toString().includes(query) ||
        review.reviewcontent?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return '#FF9800';
      case 'approved': return '#4CAF50';
      case 'rejected': return '#f44336';
      default: return '#666';
    }
  };

  const renderReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewIconContainer}>
          <Icon name="rate-review" size={24} color="#fff" />
        </View>
        <View style={styles.reviewMainInfo}>
          <Text style={styles.reviewId}>Review #{item.ReviewID}</Text>
          <Text style={styles.reviewDate}>Date: {formatDate(item.orderDay)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.orderStatus) }]}>
          <Text style={styles.statusText}>{item.orderStatus || 'Pending'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => deleteData(item.ReviewID)}
        >
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.reviewContent}>
        <View style={styles.reviewMeta}>
          <View style={styles.metaItem}>
            <Icon name="hotel" size={16} color="#666" />
            <Text style={styles.metaText}>Hotel ID: {item.HotelID}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="person" size={16} color="#666" />
            <Text style={styles.metaText}>Reviewer ID: {item.ReviewerID}</Text>
          </View>
        </View>
        
        <View style={styles.reviewTextContainer}>
          <Text style={styles.reviewText}>
            {item.reviewcontent || 'No review content available'}
          </Text>
        </View>
      </View>
    </View>
  );

  const countReviews = () => {
    return filteredData.reduce((acc, review) => {
      const status = review.orderStatus || 'pending';
      acc[status] = acc[status] ? acc[status] + 1 : 1;
      return acc;
    }, {});
  };

  useEffect(() => {
    getReviewData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Loading reviews...</Text>
      </View>
    );
  }

  const reviewCounts = countReviews();

  return (
    <View style={styles.container}>
      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Icon name="rate-review" size={32} color="#9C27B0" />
          <Text style={styles.statNumber}>{filteredData.length}</Text>
          <Text style={styles.statLabel}>Total Reviews</Text>
        </View>
        {Object.entries(reviewCounts).map(([status, count]) => (
          <View key={status} style={styles.statCard}>
            <Icon name="assessment" size={32} color={getStatusColor(status)} />
            <Text style={styles.statNumber}>{count}</Text>
            <Text style={styles.statLabel}>{status}</Text>
          </View>
        ))}
      </View>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search reviews by ID, content, hotel, or reviewer..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
            <Icon name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Reviews List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.ReviewID.toString()}
        renderItem={renderReviewItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="rate-review" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No reviews found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Reviews will appear here'}
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
    minWidth: 100,
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
  reviewCard: {
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
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  reviewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  reviewMainInfo: {
    flex: 1,
  },
  reviewId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
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
  reviewContent: {
    padding: 16,
  },
  reviewMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  reviewTextContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#9C27B0',
  },
  reviewText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
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

export default ReviewList;
