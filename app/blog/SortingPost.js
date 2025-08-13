import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import HotelDetailScreen from '../hotelDetail';

let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const { width: screenWidth } = Dimensions.get('window');

const SortingScreen = () => {
  const [meetups, setMeetsup] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hotelData, setHotelData] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMeetups, setFilteredMeetups] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchStats, setSearchStats] = useState({ total: 0, filtered: 0 });

  const fetch10Post = async () => {
    try {
      setLoading(true); 
      const res = await axios.get(`${baseUrl}/api/getpost`);
      setMeetsup(res.data); 
      setFilteredMeetups(res.data);
      console.log('Fetched posts:', res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetch10Post();
    setRefreshing(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    
    if (!meetups || !meetups.posts) return;

    // Generate search suggestions as user types
    if (text.trim().length > 0) {
      generateSearchSuggestions(text);
      setShowSearchSuggestions(true);
    } else {
      setShowSearchSuggestions(false);
      setSearchSuggestions([]);
    }

    // Filter results
    if (text.trim() === '') {
      setFilteredMeetups(meetups);
    } else {
      const searchTerms = text.toLowerCase().split(' ').filter(term => term.length > 0);
      
      const filtered = {
        ...meetups,
        posts: meetups.posts.filter(item => {
          return searchTerms.some(term => {
            return (
              (item.HotelName && item.HotelName.toLowerCase().includes(term)) ||
              (item.city && item.city.toLowerCase().includes(term)) ||
              (item.country && item.country.toLowerCase().includes(term)) ||
              (item.Address && item.Address.toLowerCase().includes(term)) ||
              (item.describe && item.describe.toLowerCase().includes(term)) ||
              (item.addon && item.addon.toLowerCase().includes(term))
            );
          });
        })
      };
      setFilteredMeetups(filtered);
      setSearchStats({ 
        total: meetups.posts.length, 
        filtered: filtered.posts.length 
      });
    }
  };

  const generateSearchSuggestions = (query) => {
    if (!meetups || !meetups.posts) return;

    const suggestions = new Set();
    const queryLower = query.toLowerCase();

    meetups.posts.forEach(item => {
      // Add hotel names
      if (item.HotelName && item.HotelName.toLowerCase().includes(queryLower)) {
        suggestions.add(item.HotelName);
      }
      
      // Add cities
      if (item.city && item.city.toLowerCase().includes(queryLower)) {
        suggestions.add(item.city);
      }
      
      // Add countries
      if (item.country && item.country.toLowerCase().includes(queryLower)) {
        suggestions.add(item.country);
      }
      
      // Add price ranges
      if (queryLower.includes('$') || queryLower.includes('price')) {
        suggestions.add(`Under $100`);
        suggestions.add(`$100-200`);
        suggestions.add(`Over $200`);
      }
      
      // Add rating suggestions
      if (queryLower.includes('star') || queryLower.includes('rating')) {
        suggestions.add('5 star hotels');
        suggestions.add('4+ star hotels');
        suggestions.add('Top rated');
      }
    });

    // Add search history matches
    searchHistory.forEach(historyItem => {
      if (historyItem.toLowerCase().includes(queryLower)) {
        suggestions.add(historyItem);
      }
    });

    setSearchSuggestions(Array.from(suggestions).slice(0, 5));
  };

  const selectSearchSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
    setShowSearchSuggestions(false);
    addToSearchHistory(suggestion);
  };

  const addToSearchHistory = async (query) => {
    if (query.trim() && !searchHistory.includes(query)) {
      const newHistory = [query, ...searchHistory.slice(0, 4)]; // Keep last 5 searches
      setSearchHistory(newHistory);
      
      // Save to AsyncStorage
      try {
        await AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
      } catch (error) {
        console.log('Error saving search history:', error);
      }
    }
  };

  const clearSearchHistory = async () => {
    setSearchHistory([]);
    try {
      await AsyncStorage.removeItem('searchHistory');
    } catch (error) {
      console.log('Error clearing search history:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('searchHistory');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.log('Error loading search history:', error);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery.trim());
      setShowSearchSuggestions(false);
    }
  };

  useEffect(() => {
    fetch10Post();
    loadSearchHistory(); // Load search history on app start
    
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []); 

  useEffect(() => {
    if (meetups && meetups.posts && meetups.posts.length > 0) {
      console.log('Updated meetups:', meetups.posts[0].PostID);
      // Update filtered meetups when search query is empty
      if (!searchQuery.trim()) {
        setFilteredMeetups(meetups);
      }
    }
  }, [meetups]);

  const handleButtonPress = (data) => {
    setModalVisible(true); 
    console.log(data);
    setHotelData(data);
  };
  const renderMeetups = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Icon name="hourglass-outline" size={48} color="#007BFF" />
          </Animated.View>
          <Text style={styles.loadingText}>Đang tải khách sạn...</Text>
        </View>
      );
    }

    const dataToRender = filteredMeetups || meetups;
    
    if (!dataToRender || !dataToRender.posts || dataToRender.posts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="business-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>
            {searchQuery ? 'Không tìm thấy khách sạn' : 'Chưa có khách sạn nào'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {searchQuery 
              ? 'Thử tìm kiếm với từ khóa khác' 
              : 'Hãy quay lại sau để xem thêm khách sạn mới'
            }
          </Text>
          {searchQuery && (
            <TouchableOpacity 
              style={styles.clearSearchButton}
              onPress={() => handleSearch('')}
            >
              <Text style={styles.clearSearchText}>Xóa tìm kiếm</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    
    return (
      <FlatList
        data={dataToRender.posts}
        renderItem={({ item, index }) => (
          <Animated.View 
            style={[
              styles.cardContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.meetupCard}
              onPress={() => handleButtonPress(item)}
            >
              <View style={styles.imageContainer}>
                {item.imgArr && item.imgArr.length > 0 && (
                  <Image
                    source={{ uri: item.imgArr[0].startsWith('http') ? item.imgArr[0] : `${baseUrl}${item.imgArr[0]}` }}
                    style={styles.meetupImage}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.imageOverlay}>
                  <View style={styles.priceTag}>
                    <Text style={styles.priceText}>
                      ${item.price ? item.price : '99'}/đêm
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.favoriteButton}>
                    <Icon name="heart-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                
                {item.city && (
                  <View style={styles.cityBadge}>
                    <Text style={styles.cityText}>{item.city}</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.hotelInfo}>
                <View style={styles.locationContainer}>
                  <Icon name="location-outline" size={14} color="#999" />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {item.Address}
                    {item.country && `, ${item.country}`}
                  </Text>
                </View>
                
                <Text style={styles.titleText} numberOfLines={2}>{item.HotelName}</Text>
                
                {item.describe && (
                  <Text style={styles.descriptionText} numberOfLines={2}>
                    {item.describe}
                  </Text>
                )}
                
                <View style={styles.detailsRow}>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>
                      {item.rating > 0 ? item.rating.toFixed(1) : 'Mới'}
                    </Text>
                    <Text style={styles.reviewsText}>
                      {item.totalReviews > 0 ? `(${item.totalReviews} đánh giá)` : '(Chưa có đánh giá)'}
                    </Text>
                  </View>
                  
                  {item.host && (
                    <View style={styles.hostContainer}>
                      <Icon name="person-outline" size={12} color="#666" />
                      <Text style={styles.hostText}>Host: {item.host}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.amenitiesContainer}>
                  {item.addon && item.addon.split(',').slice(0, 3).map((amenity, index) => (
                    <View key={index} style={styles.amenityTag}>
                      <Icon name="checkmark-circle" size={12} color="#007BFF" />
                      <Text style={styles.amenityText}>{amenity.trim()}</Text>
                    </View>
                  ))}
                  
                  {!item.addon && (
                    <>
                      <View style={styles.amenityTag}>
                        <Icon name="wifi" size={12} color="#007BFF" />
                        <Text style={styles.amenityText}>WiFi</Text>
                      </View>
                      <View style={styles.amenityTag}>
                        <Icon name="car" size={12} color="#007BFF" />
                        <Text style={styles.amenityText}>Parking</Text>
                      </View>
                      <View style={styles.amenityTag}>
                        <Icon name="restaurant" size={12} color="#007BFF" />
                        <Text style={styles.amenityText}>Restaurant</Text>
                      </View>
                    </>
                  )}
                </View>
                
                <View style={styles.additionalInfoRow}>
                  <View style={styles.infoItem}>
                    <Icon name="bed-outline" size={14} color="#666" />
                    <Text style={styles.infoText}>Khách sạn</Text>
                  </View>
                  
                  {item.PostID && (
                    <View style={styles.infoItem}>
                      <Icon name="document-text-outline" size={14} color="#666" />
                      <Text style={styles.infoText}>ID: {item.PostID.slice(-6)}</Text>
                    </View>
                  )}
                  
                  <View style={styles.infoItem}>
                    <Icon name="time-outline" size={14} color="#666" />
                    <Text style={styles.infoText}>Có sẵn</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item, idx) => item?.PostID ? item.PostID : idx.toString()}
        contentContainerStyle={styles.meetupList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#007BFF']} />
        }
      />
    );
  };

  const renderSearchSuggestions = () => {
    if (!showSearchSuggestions || (!searchSuggestions.length && !searchHistory.length)) {
      return null;
    }

    return (
      <View style={styles.searchSuggestionsContainer}>
        {searchSuggestions.length > 0 && (
          <>
            <Text style={styles.suggestionHeader}>Gợi ý</Text>
            {searchSuggestions.map((suggestion, index) => (
              <TouchableOpacity
                key={`suggestion-${index}`}
                style={styles.suggestionItem}
                onPress={() => selectSearchSuggestion(suggestion)}
              >
                <Icon name="search-outline" size={16} color="#666" />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </TouchableOpacity>
            ))}
          </>
        )}

        {searchHistory.length > 0 && (
          <>
            <View style={styles.historyHeader}>
              <Text style={styles.suggestionHeader}>Tìm kiếm gần đây</Text>
              <TouchableOpacity onPress={clearSearchHistory}>
                <Text style={styles.clearHistoryText}>Xóa</Text>
              </TouchableOpacity>
            </View>
            {searchHistory.map((historyItem, index) => (
              <TouchableOpacity
                key={`history-${index}`}
                style={styles.suggestionItem}
                onPress={() => selectSearchSuggestion(historyItem)}
              >
                <Icon name="time-outline" size={16} color="#666" />
                <Text style={styles.suggestionText}>{historyItem}</Text>
                <TouchableOpacity
                  onPress={() => {
                    const newHistory = searchHistory.filter((_, i) => i !== index);
                    setSearchHistory(newHistory);
                    AsyncStorage.setItem('searchHistory', JSON.stringify(newHistory));
                  }}
                  style={styles.removeHistoryButton}
                >
                  <Icon name="close" size={14} color="#999" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Tìm kiếm khách sạn</Text>
            <Text style={styles.headerTitle}>Tìm nơi lưu trú hoàn hảo</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Icon name="search-circle-outline" size={32} color="#007BFF" />
          </TouchableOpacity>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Icon name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm khách sạn, địa điểm, thành phố..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => handleSearch('')}
                style={styles.clearButton}
              >
                <Icon name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Search Suggestions */}
        {renderSearchSuggestions()}
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Stats Bar for hotel listings */}
        {(meetups && meetups.posts) && (
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                {filteredMeetups ? 
                  `${filteredMeetups.posts?.length || 0} trong số ${meetups.posts?.length || 0} khách sạn` :
                  `${meetups.posts?.length || 0} khách sạn có sẵn`
                }
              </Text>
              {searchQuery && (
                <View style={styles.searchStatsContainer}>
                  <Text style={styles.searchQueryText}>
                    cho "{searchQuery}"
                  </Text>
                  {searchStats.filtered === 0 && searchStats.total > 0 && (
                    <Text style={styles.noResultsHint}>
                      Thử từ khóa đơn giản hơn
                    </Text>
                  )}
                </View>
              )}
            </View>
            
            {/* Search result summary */}
            {searchQuery && filteredMeetups && filteredMeetups.posts && (
              <View style={styles.searchSummary}>
                <Text style={styles.searchSummaryText}>
                  {filteredMeetups.posts.length === 0 ? 
                    "Không tìm thấy kết quả" : 
                    filteredMeetups.posts.length === 1 ? 
                    "1 khách sạn phù hợp" :
                    `${filteredMeetups.posts.length} khách sạn phù hợp`
                  }
                </Text>
              </View>
            )}
          </View>
        )}
        
        {renderMeetups()}
      </View>

      {/* Full Screen Hotel Detail Modal */}
      <Modal
        data={hotelData}
        visible={isModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.fullScreenModal}>
          <HotelDetailScreen 
            hotelData={hotelData} 
            onClose={() => setModalVisible(false)}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFF',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 0 : 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  headerGreeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  profileButton: {
    padding: 5,
  },
  mainContent: {
    flex: 1,
    paddingTop: 10,
  },
  statsContainer: {
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  searchStatsContainer: {
    flex: 1,
    marginLeft: 10,
  },
  searchQueryText: {
    fontSize: 14,
    color: '#007BFF',
    fontStyle: 'italic',
  },
  noResultsHint: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 2,
  },
  searchSummary: {
    marginTop: 4,
  },
  searchSummaryText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  searchSuggestionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: -10,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingVertical: 10,
    maxHeight: 300,
  },
  suggestionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: '600',
  },
  removeHistoryButton: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearSearchText: {
    color: '#fff',
    fontWeight: '600',
  },
  meetupList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 20,
  },
  meetupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    borderWidth: 0.5,
    borderColor: '#f0f0f0',
  },
  imageContainer: {
    position: 'relative',
  },
  meetupImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    padding: 15,
  },
  priceTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 123, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  favoriteButton: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 20,
    marginTop: 'auto',
  },
  cityBadge: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  hotelInfo: {
    padding: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  hostContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  hostText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  amenityText: {
    fontSize: 11,
    color: '#007BFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  additionalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  fullScreenModal: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default SortingScreen;
