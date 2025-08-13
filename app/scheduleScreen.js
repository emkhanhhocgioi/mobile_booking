import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Rating } from 'react-native-ratings';

var baseUrl = "http://localhost:5000";

if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
}
if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const ScheduleScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const uid = route.params.uid;

  const [selectedCheckin, setSelectedCheckin] = useState([]);
  const [selectedCheckout, setSelectedCheckout] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [review, setReview] = useState('');
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [markedDates, setMarkedDates] = useState({});
 
  const [rating, setRating] = useState(0);
  const [userID, setUserID] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);  
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false); 

  useEffect(() => {
    if (uid) {
      setUserID(uid);
    }
  }, [uid]);

  useEffect(() => {
    if (userID) {
      getSchedule();
    }
  }, [userID]);

  useEffect(() => {
    if (selectedHotel) {
      console.log(selectedHotel.HotelDetails.Address)
    }
  }, [selectedHotel]);
  useEffect(() => {
    if (scheduleData && Array.isArray(scheduleData)) {
      const dates = scheduleData.map(element => {
        const dateObj = new Date(element.checkinDate);
        return dateObj.toISOString().split('T')[0];
      });
      const dateout = scheduleData.map(element => {
        const dateObj = new Date(element.checkoutDate);
        return dateObj.toISOString().split('T')[0];
      });
      setSelectedCheckin(dates);
      setSelectedCheckout(dateout);
      
      // Create marked dates for the new calendar
      const marked = {};
      dates.forEach(date => {
        marked[date] = {
          selected: true,
          selectedColor: '#4285F4',
          selectedTextColor: 'white',
          customStyles: {
            container: {
              backgroundColor: '#4285F4',
              borderRadius: 16,
            },
            text: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
        };
      });
      dateout.forEach(date => {
        marked[date] = {
          selected: true,
          selectedColor: '#ea4335',
          selectedTextColor: 'white',
          customStyles: {
            container: {
              backgroundColor: '#ea4335',
              borderRadius: 16,
            },
            text: {
              color: 'white',
              fontWeight: 'bold',
            },
          },
        };
      });
      setMarkedDates(marked);
      
      console.log(scheduleData[0]);
      setLoading(false);
    }
  }, [scheduleData]);

  const pickImageAsyncMultiple = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const remainingSlots = 3 - selectedImages.length;
      if (remainingSlots <= 0) {
        Alert.alert('Limit Reached', 'You can only add up to 3 images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS !== 'web',
        aspect: Platform.OS !== 'web' ? [16, 9] : undefined,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.slice(0, remainingSlots);
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not pick images. Please try again.');
    }
  };

  const removeImage = (indexToRemove) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };
  

  const randomReviewID = () => {
    return 'rev_' + Math.random().toString(36).substr(2, 9); 
}

  const createReview = async (hotelid, reviewerId, reviewcontent, rating) => {
    if (!reviewcontent.trim()) {
      Alert.alert('Validation Error', 'Please write a review before submitting.');
      return;
    }

    if (rating === 0) {
      Alert.alert('Validation Error', 'Please provide a rating before submitting.');
      return;
    }

    setIsSubmittingReview(true);
  
    const reviewid = randomReviewID();
    const formData = new FormData();
    
    try {
      // Only use actual images, no placeholders
      let images = selectedImages.filter(img => img.uri && img.uri.trim() !== '');
      
      formData.append('reviewId', reviewid);
      formData.append('hotelid', hotelid);
      formData.append('reviewerId', reviewerId);
      formData.append('reviewcontent', reviewcontent.trim());
      formData.append('rating', Number(rating));

      // Helper: convert base64 to Blob (for web)
      function base64ToBlob(base64, mime) {
        const byteString = atob(base64.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mime });
      }

      images.forEach((image, index) => {
        console.log(`Adding image ${index}:`, image);
        let fileName = image.fileName || `review_${index}_${Date.now()}.jpg`;
        let mimeType = image.mimeType || 'image/jpeg';
        
        if (Platform.OS === 'web' && image.uri.startsWith('data:')) {
          // Web platform with base64 data
          const blob = base64ToBlob(image.uri, mimeType);
          formData.append('file', blob, fileName);
        } else {
          // Mobile platform or web with file URI
          formData.append('file', {
            uri: image.uri,
            name: fileName,
            type: mimeType,
          });
        }
      });

      console.log('Selected images:', selectedImages);
      console.log('Form data fields before sending:', {
        reviewId: reviewid,
        hotelid: hotelid,
        reviewerId: reviewerId,
        reviewcontent: reviewcontent.trim(),
        rating: Number(rating),
        imageCount: images.length
      });

      // Debug: Log FormData contents
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Use axios for FormData upload
      const res = await axios.post(`${baseUrl}/api/createReview`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      if (res.status === 201) {
        Alert.alert('Success', 'Review created successfully!');
        // Reset form
        setReview('');
        setRating(0);
        setSelectedImages([]);
        setModalVisible(false);
      } else {
        console.log('Error creating review:', res.data || res.statusText);
        Alert.alert('Error', 'Failed to create review. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading review:', error.message);
      console.error('Full error object:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.response) {
        console.log('Server responded with:', error.response.data?.message || error.response.statusText);
        errorMessage = error.response.data?.message || 'Server error occurred.';
      } else if (error.request) {
        console.log('No response received:', error.request);
        errorMessage = 'Unable to connect to the server. Please try again.';
      } else {
        console.log('Error in setup:', error.message);
        errorMessage = 'An unexpected error occurred. Please try again.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };
  

  const getSchedule = async () => {
    if (!userID) {
      console.log('UserID is missing:', userID);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl}/api/getSchedule`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          userID: userID,
        },
      });

      if (res.data && res.data.length > 0) {
        setScheduleData(res.data);
      } else {
        console.log('No schedule data found');
        setScheduleData([]);
      }
    } catch (error) {
      console.log('Error fetching schedule:', error);
      Alert.alert('Error', 'Failed to load schedule data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderScheduleItem = ({ item }) => (
    <TouchableOpacity style={styles.scheduleItem} onPress={() => {
      setModalVisible(true);
      setSelectedHotel(item);
    }}>
      {item.HotelDetails ? (
        <>
          <View style={styles.hotelInfo}>
            <Text style={styles.hotelName}>{item.HotelDetails.hotelName}</Text>
            <Text style={styles.hotelAddress}>{item.HotelDetails.Address}</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Check-in: </Text>
              <Text style={styles.dateText}>
                {new Date(item.checkinDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Check-out: </Text>
              <Text style={styles.dateText}>
                {new Date(item.checkoutDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <Text style={styles.hotelPrice}>${item.HotelDetails.price}</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#007BFF" />
        </>
      ) : (
        <Text style={styles.noDataText}>No hotel details available</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Schedule</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007BFF" />
          <Text style={styles.loadingText}>Loading your schedule...</Text>
        </View>
      ) : (
        <>
          <Calendar
            monthFormat={'MMMM yyyy'}
            onDayPress={(day) => {
              console.log('Selected date:', day.dateString);
            }}
            markedDates={markedDates}
            markingType={'custom'}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: '#00adf5',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#007BFF',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#00adf5',
              selectedDotColor: '#ffffff',
              arrowColor: '#007BFF',
              disabledArrowColor: '#d9e1e8',
              monthTextColor: '#2d4150',
              indicatorColor: '#007BFF',
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
            style={styles.calendar}
          />

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4285F4' }]} />
              <Text style={styles.legendText}>Check-in dates</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#ea4335' }]} />
              <Text style={styles.legendText}>Check-out dates</Text>
            </View>
          </View>

          <View style={styles.scheduleHeader}>
            <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
            <TouchableOpacity onPress={() => getSchedule()}>
              <Ionicons name="refresh" size={20} color="#007BFF" />
            </TouchableOpacity>
          </View>

          {scheduleData && scheduleData.length > 0 ? (
            <FlatList
              data={scheduleData}
              renderItem={renderScheduleItem}
              keyExtractor={item => item.orderid}
              contentContainerStyle={styles.scheduleList}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateText}>No bookings found</Text>
              <Text style={styles.emptyStateSubtext}>Your upcoming hotel reservations will appear here</Text>
            </View>
          )}
        </>
      )}

      {/* Enhanced Modal for Review Writing */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => {
                setModalVisible(false);
                setReview('');
                setRating(0);
                setSelectedImages([]);
              }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>

            {selectedHotel && (
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.hotelHeader}>
                  <Text style={styles.modalHotelName}>{selectedHotel.HotelDetails.hotelName}</Text>
                  <Text style={styles.modalHotelAddress}>{selectedHotel.HotelDetails.Address}</Text>
                  <View style={styles.modalDateContainer}>
                    <View style={styles.dateRow}>
                      <Ionicons name="calendar" size={16} color="#007BFF" />
                      <Text style={styles.modalDateText}>
                        {new Date(selectedHotel.checkinDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' - '}
                        {new Date(selectedHotel.checkoutDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.reviewSection}>
                  <Text style={styles.sectionLabel}>Write Your Review</Text>
                  <TextInput
                    style={styles.reviewInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Share your experience at this hotel..."
                    value={review}
                    onChangeText={setReview}
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.ratingSection}>
                  <Text style={styles.sectionLabel}>Rate Your Stay</Text>
                  <Rating
                    showRating
                    onFinishRating={(rating) => setRating(rating)}
                    startingValue={rating}
                    imageSize={30}
                    style={styles.rating}
                    ratingColor="#0a0a0aff"
                    tintColor="#fff"
                  />
                </View>

                <View style={styles.imageSection}>
                  <Text style={styles.sectionLabel}>Add Photos</Text>
                  <TouchableOpacity style={styles.imageButton} onPress={pickImageAsyncMultiple}>
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.imageButtonText}>
                      {selectedImages.length > 0 ? `${selectedImages.length} photo(s) selected` : 'Add Photos'}
                    </Text>
                  </TouchableOpacity>
                  
                  {selectedImages.length > 0 && (
                    <ScrollView horizontal style={styles.imagePreviewContainer} showsHorizontalScrollIndicator={false}>
                      {selectedImages.map((image, index) => (
                        <View key={index} style={styles.imagePreview}>
                          <Image source={{ uri: image.uri }} style={styles.previewImage} />
                          <TouchableOpacity
                            style={styles.removeImageButton}
                            onPress={() => removeImage(index)}
                          >
                            <Ionicons name="close-circle" size={20} color="#FF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>

                <TouchableOpacity 
                  style={[styles.submitButton, isSubmittingReview && styles.submitButtonDisabled]} 
                  onPress={() => createReview(selectedHotel.HotelDetails.hotelid, userID, review, rating)}
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.submitButtonText}>Submit Review</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  calendar: {
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    backgroundColor: '#fff',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#666',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scheduleList: {
    flexGrow: 0,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  hotelAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#555',
  },
  hotelPrice: {
    color: '#007BFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 4,
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeModal: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 8,
  },
  modalContent: {
    padding: 20,
    paddingTop: 50,
  },
  hotelHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  modalHotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalHotelAddress: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalDateContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDateText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  reviewSection: {
    marginBottom: 20,
  },
  ratingSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  imageSection: {
    marginBottom: 20,
  },
  sectionLabel: {
    
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: '#fafafa',
  },
  rating: {
    marginTop: 8,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  imageButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 14,
  },
  imagePreviewContainer: {
    marginTop: 12,
  },
  imagePreview: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#94d3a2',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ScheduleScreen;
