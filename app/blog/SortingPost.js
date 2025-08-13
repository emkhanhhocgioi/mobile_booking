import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, Image, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HotelDetailScreen from '../hotelDetail';
let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const { width } = Dimensions.get('window');
const SortingScreen = () => {
  const [sortByCountry, setSortByCountry] = useState('');
  const [sortByCity, setSortByCity] = useState('');
  const [countries, setCountries] = useState([]);
  const [destination, setDestination] = useState([]);
  const [modalvis, setmodalvis] = useState(false);
  const [data, setData] = useState([]);
  const [viewdata, setViewdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
 

  const sortingtest = async () => {
    if (!sortByCity && !sortByCountry) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một tiêu chí tìm kiếm!');
      return;
    }

    setLoading(true);
    setSearchPerformed(true);
    
    let fieldsort = [];
    if (sortByCity) fieldsort.push('city');
    if (sortByCountry) fieldsort.push('country');

    await getsortingdata(fieldsort);
    setLoading(false);
  };
  
  
  const getsortingdata = async (fieldsort) => {
    let requestData = {};

    if (fieldsort.length === 0) {
      console.log('No valid sorting criteria provided');
      return;
    }

    if (fieldsort.length === 1 && fieldsort[0] === 'city') {
      requestData = {
        postSelectedValue: fieldsort,
        selectedvldata: [sortByCity],
      };
    } else if (fieldsort.length === 1 && fieldsort[0] === 'country') {
      requestData = {
        postSelectedValue: fieldsort,
        selectedvldata: [sortByCountry],
      };
    } else {
      requestData = {
        postSelectedValue: fieldsort,
        selectedvldata: [sortByCity, sortByCountry],
      };
    }

    try {
      const res = await axios.post(`${baseUrl}/api/getpost/sorted`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setData(res.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tìm kiếm dữ liệu. Vui lòng thử lại!');
    }
  };
  const renderoutcomedata = () => {
    return (
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.hotelCard} onPress={() => openhotel(item)}>
            <Image 
              source={{ uri: item.imgArr && item.imgArr[0] ? item.imgArr[0] : 'https://via.placeholder.com/300x200' }} 
              style={styles.hotelImage} 
            />
            <View style={styles.cardContent}>
              <Text style={styles.hotelName} numberOfLines={2}>{item.HotelName}</Text>
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.addressText} numberOfLines={2}>{item.Address}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Giá từ:</Text>
                <Text style={styles.priceValue}>${item.price}/đêm</Text>
              </View>
              {item.rating > 0 && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                  <Text style={styles.reviewCount}>({item.totalReviews} đánh giá)</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    );
  };
  const openhotel = (data) => {
    setViewdata(data);
    setmodalvis(true);
  };

  const clearFilters = () => {
    setSortByCountry('');
    setSortByCity('');
    setData([]);
    setSearchPerformed(false);
  };


  const getDestinationData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/getDestination`);
      if (response.data) {
        setDestination(response.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu điểm đến');
    }
  };
  useEffect(() => {
    getDestinationData();
  }, []);

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data) => {
        const sortedCountries = data.sort((a, b) => 
          a.name.common.localeCompare(b.name.common)
        );
        setCountries(sortedCountries);
      })
      .catch((error) => console.error(error));
  }, []);
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tìm kiếm khách sạn</Text>
          <Text style={styles.headerSubtitle}>Tìm khách sạn theo quốc gia và thành phố</Text>
        </View>

        {/* Search Filters */}
        <View style={styles.filtersContainer}>
          {/* Country Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Quốc gia</Text>
            <View style={styles.pickerWrapper}>
              <Ionicons name="flag-outline" size={20} color="#666" style={styles.pickerIcon} />
              {countries && countries.length > 0 ? (
                <Picker
                  selectedValue={sortByCountry}
                  onValueChange={(value) => setSortByCountry(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Chọn quốc gia" value="" />
                  {countries.map((ctry, index) => (
                    <Picker.Item 
                      key={index} 
                      label={ctry.name.common} 
                      value={ctry.name.common} 
                    />
                  ))}
                </Picker>
              ) : (
                <Text style={styles.noDataText}>Đang tải quốc gia...</Text>
              )}
            </View>
          </View>

          {/* City Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Thành phố</Text>
            <View style={styles.pickerWrapper}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.pickerIcon} />
              {destination && destination.length > 0 ? (
                <Picker
                  selectedValue={sortByCity}
                  onValueChange={(value) => setSortByCity(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Chọn thành phố" value="" />
                  {destination.map((city, index) => (
                    <Picker.Item 
                      key={index} 
                      label={city.destname} 
                      value={city.destname} 
                    />
                  ))}
                </Picker>
              ) : (
                <Text style={styles.noDataText}>Đang tải thành phố...</Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.clearButton]} 
              onPress={clearFilters}
            >
              <Ionicons name="refresh-outline" size={20} color="#666" />
              <Text style={styles.clearButtonText}>Xóa lọc</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.searchButton]} 
              onPress={sortingtest}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="search-outline" size={20} color="#fff" />
                  <Text style={styles.searchButtonText}>Tìm kiếm</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Results */}
        <View style={styles.resultsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
            </View>
          ) : searchPerformed ? (
            Array.isArray(data) && data.length > 0 ? (
              <>
                <View style={styles.resultsHeader}>
                  <Text style={styles.resultsCount}>Tìm thấy {data.length} khách sạn</Text>
                </View>
                {renderoutcomedata()}
              </>
            ) : (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={64} color="#ccc" />
                <Text style={styles.noResultsTitle}>Không tìm thấy kết quả</Text>
                <Text style={styles.noResultsText}>Thử thay đổi tiêu chí tìm kiếm của bạn</Text>
              </View>
            )
          ) : (
            <View style={styles.welcomeContainer}>
              <Ionicons name="bed-outline" size={64} color="#ccc" />
              <Text style={styles.welcomeTitle}>Chào mừng đến với tìm kiếm khách sạn</Text>
              <Text style={styles.welcomeText}>Chọn quốc gia hoặc thành phố để bắt đầu tìm kiếm</Text>
            </View>
          )}
        </View>

        {/* Modal */}
        <Modal
          transparent={true}
          visible={modalvis}
          animationType="slide" 
          onRequestClose={() => setmodalvis(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              onPress={() => setmodalvis(false)}
            />
            <View style={styles.modalContent}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setmodalvis(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
              {viewdata ? (
                <HotelDetailScreen hotelData={viewdata} />
              ) : (
                <Text>Không có dữ liệu</Text>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    minHeight: 50,
  },
  pickerIcon: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  noDataText: {
    color: '#999',
    fontStyle: 'italic',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  clearButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007bff',
    elevation: 2,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsHeader: {
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    paddingBottom: 20,
  },
  hotelCard: {
    backgroundColor: '#fff',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  hotelImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 16,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    lineHeight: 26,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 6,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
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
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1000,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default SortingScreen;
