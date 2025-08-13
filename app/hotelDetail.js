import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert, Animated, Dimensions, Image, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
let baseUrl = 'http://localhost:5000'
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const HotelDetailScreen = ({ hotelData, uid, onClose }) => {
  const [isModalVisible, setModalVisible] = useState(false);  
  const [date, setDate] = useState(new Date());
  const [date2, setDate2] = useState(new Date());
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [note,setNote] = useState('');
  const [reviewData ,setReviewData] = useState([])
  const [rating,SetRating] = useState(0);
  const [scrollY] = useState(new Animated.Value(0));
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Helper function to get valid image URI
  const getValidImageUri = (imageUrl) => {
    if (!imageUrl || imageUrl.length === 0) {
      return null;
    }
    return imageUrl.startsWith('http') ? imageUrl : `${baseUrl}${imageUrl}`;
  };

  // Safe Image Component
  const SafeImage = ({ source, style, ...props }) => {
    const [imageError, setImageError] = useState(false);
    const uri = source?.uri;
    
    if (!uri || imageError) {
      return (
        <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="image-outline" size={24} color="#ccc" />
        </View>
      );
    }

    return (
      <Image
        source={source}
        style={style}
        onError={() => {
          console.log('Image failed to load:', uri);
          setImageError(true);
        }}
        {...props}
      />
    );
  };

  // Safety check for hotel data
  if (!hotelData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Hotel data not available</Text>
      </View>
    );
  }

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false);
    setDate(currentDate);
  };
  const onChange2 = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow2(false);
    setDate2(currentDate);
  };

const createOrders = async () => {
    if (!date || !date2) {
      Alert.alert('Error', 'Please select both check-in and check-out dates');
      return;
    }
    
    if (date >= date2) {
      Alert.alert('Error', 'Check-out date must be after check-in date');
      return;
    }

    setLoading(true);
    console.log(date, date2);
    console.log(note);

    const payload = {
        HotelID: hotelData.PostID || '',
        UserID: uid?.uid || '',
        OwnerID: hotelData.PosterID || '',
        checkin: date.toISOString(),
        checkout: date2.toISOString(),  
        note: note || 'No additional notes'
    };

    console.log(payload);  

    try {
        const res = await axios.post(`${baseUrl}/api/createorder`, payload, {
            headers: {
                'Content-Type': 'application/json',  
            },
        });

        if (res.status === 201) {
            Alert.alert('Success!', 'Your booking has been created successfully', [
              { text: 'OK', onPress: () => {
                setModalVisible(false);
                if (onClose) onClose();
              }}
            ]);
        }
    } catch (error) {
        console.error('Error uploading:', error);
        Alert.alert('Error', 'Failed to create booking. Please try again.');
        if (error.response) {
            console.log('Server responded with:', error.response.data.message);
        } else if (error.request) {
            console.log('No response received:', error.request);
        } else {
            console.log('Error in setup:', error.message);
        }
    } finally {
        setLoading(false);
    }
};
const renderReview = async () => {
  try {
    const res = await axios.get(`${baseUrl}/api/renderReview`, {
      headers: { 'Content-Type': 'application/json' },
      params: { hotelid: hotelData.PostID || '' },
    });
    console.log(res.data[0]);
    setReviewData(res.data); 
  } catch (error) {
    console.log(error);
  }
};
const getReviewrating = async ()=>{
     try {
      const res = await axios.get(`${baseUrl}/api/review/getAverageRating`, {
        headers: { 'Content-Type': 'application/json' },
        params: { hotelid: hotelData.PostID || '' },
      });
      console.log(res.data)
      SetRating(res.data.averageRating || 0)
     } catch (error) {
      console.log(error);
     }
}

useEffect(() => {
  renderReview();
  getReviewrating();
}, []);
   
  



  const renderUserPost = () => {
    if (Array.isArray(reviewData) && reviewData.length === 0) {
      return (
        <View style={styles.emptyReviewContainer}>
          <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
          <Text style={styles.emptyReviewText}>No reviews yet</Text>
          <Text style={styles.emptyReviewSubtext}>Be the first to share your experience!</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.meetupList}>
        {reviewData.slice(0, 3).map((item) => (
          <View
            key={item.rvid}
            style={styles.postContainer}
          >
            <View style={styles.reviewerInfo}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.reviewerName ? item.reviewerName.charAt(0).toUpperCase() : item.ReviewerID.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.reviewerDetails}>
                <Text style={styles.reviewerName}>{item.reviewerName || item.ReviewerID}</Text>
                <View style={styles.ratingStars}>
                  {[1,2,3,4,5].map((star) => (
                    <Ionicons 
                      key={star}
                      name={star <= item.rating ? "star" : "star-outline"} 
                      size={14} 
                      color={star <= item.rating ? "#FFD700" : "#ddd"} 
                    />
                  ))}
                  <Text style={styles.ratingNumber}>({item.rating})</Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewContent}>{item.reviewcontent}</Text>
            {item.imgArr && item.imgArr.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewImages}>
                {item.imgArr.slice(0, 3).map((img, index) => (
                  <SafeImage
                    key={index}
                    source={{
                      uri: getValidImageUri(img)
                    }}
                    style={styles.reviewImage}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        ))}
        {reviewData.length > 3 && (
          <TouchableOpacity style={styles.viewAllReviews}>
            <Text style={styles.viewAllText}>View all {reviewData.length} reviews</Text>
            <Ionicons name="chevron-forward" size={16} color="#007BFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
 

  // Responsive width for images
  const screenWidth = Dimensions.get('window').width;
  const mainImageWidth = Math.min(screenWidth - 16, 420);
  const mainImageHeight = Math.max(220, Math.floor(mainImageWidth * 0.6));

  // Calculate nights between dates
  const calculateNights = () => {
    if (date && date2) {
      const timeDiff = date2.getTime() - date.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff > 0 ? daysDiff : 1;
    }
    return 1;
  };

  const totalPrice = (hotelData.price || 0) * calculateNights();

  // Animated header opacity
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image with Overlay */}
        {hotelData.imgArr && hotelData.imgArr.length > 0 && (
          <View style={styles.heroContainer}>
            <SafeImage
              source={{ 
                uri: getValidImageUri(hotelData.imgArr && hotelData.imgArr[currentImageIndex])
              }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <View style={styles.heroGradient} />
            
            {/* Image Indicators */}
            {hotelData.imgArr.length > 1 && (
              <View style={styles.imageIndicators}>
                {hotelData.imgArr.map((_, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={[
                      styles.indicator,
                      { opacity: index === currentImageIndex ? 1 : 0.5 }
                    ]}
                    onPress={() => setCurrentImageIndex(index)}
                  />
                ))}
              </View>
            )}

            {/* Hotel Name Overlay */}
            <View style={styles.heroTextOverlay}>
              <Text style={styles.heroTitle}>{hotelData.HotelName || 'Unknown Hotel'}</Text>
              <View style={styles.heroLocationRow}>
                <Ionicons name="location-outline" size={16} color="#fff" />
                <Text style={styles.heroLocation}>{(hotelData.city || 'Unknown')} , {(hotelData.country || 'Unknown')}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Animated Header */}
        <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => { onClose ? onClose() : (typeof navigation !== 'undefined' && navigation.goBack && navigation.goBack()); }}>
            <Ionicons name="arrow-back" size={24} color="#222" />
          </TouchableOpacity>
          <Text style={styles.animatedHeaderTitle} numberOfLines={1}>{hotelData.HotelName || 'Unknown Hotel'}</Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#222" />
          </TouchableOpacity>
        </Animated.View>

        {/* Fixed Header with Back Button */}
        <View style={styles.fixedHeader}>
          <TouchableOpacity style={styles.headerBackButton} onPress={() => { onClose ? onClose() : (typeof navigation !== 'undefined' && navigation.goBack && navigation.goBack()); }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerFavoriteButton}>
            <Ionicons name="heart-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Hotel Info */}
        <View style={styles.infoContainer}>
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.statText}>{rating > 0 ? rating : 'New'}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble-outline" size={18} color="#666" />
              <Text style={styles.statText}>
                {reviewData.length > 0 ? `${reviewData.length} reviews` : 'No reviews yet'}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="restaurant-outline" size={18} color="#666" />
              <Text style={styles.statText}>{hotelData.addon || 'No amenities'}</Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#666" style={styles.addressIcon} />
            <Text style={styles.locationText}>
              {`${hotelData.Address || 'Unknown Address'}, ${hotelData.city || 'Unknown City'}, ${hotelData.country || 'Unknown Country'}`}
            </Text>
          </View>

          {/* Price Section */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceText}>${hotelData.price || 0}</Text>
              <Text style={styles.perNight}>/night</Text>
            </View>
            <View style={styles.totalPriceHint}>
              <Text style={styles.totalPriceText}>Total: ${totalPrice} for {calculateNights()} night(s)</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About this place</Text>
            <View style={styles.descriptionBox}>
              <Text 
                style={styles.descriptionText}
                numberOfLines={showFullDescription ? undefined : 3}
              >
                {hotelData.describe || 'No description available.'}
              </Text>
              {hotelData.describe && hotelData.describe.length > 150 && (
                <TouchableOpacity 
                  onPress={() => setShowFullDescription(!showFullDescription)}
                  style={styles.showMoreButton}
                >
                  <Text style={styles.showMoreText}>
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Gallery */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Photo Gallery</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.previewContainer}
              contentContainerStyle={{ paddingHorizontal: 10 }}
            >
              {hotelData.imgArr && hotelData.imgArr.length > 1 ? (
                hotelData.imgArr.slice(1).map((img, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.galleryImageWrapper}
                    onPress={() => setCurrentImageIndex(idx + 1)}
                  >
                    <SafeImage
                      source={{ 
                        uri: getValidImageUri(img)
                      }}
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noImagesText}>No additional photos</Text>
              )}
            </ScrollView>
          </View>

          {/* Reviews */}
          <View style={styles.sectionContainer}>
            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Guest Reviews</Text>
              {rating > 0 && (
                <View style={styles.overallRating}>
                  <Ionicons name="star" size={18} color="#FFD700" />
                  <Text style={styles.overallRatingText}>{rating}</Text>
                </View>
              )}
            </View>
            <View style={styles.reviewsBox}>
              {reviewData.length > 0 ? renderUserPost() : (
                <View style={styles.emptyReviewContainer}>
                  <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyReviewText}>No reviews yet</Text>
                  <Text style={styles.emptyReviewSubtext}>Be the first to share your experience!</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Booking Bar */}
      <View style={styles.floatingBookingBar}>
        <View style={styles.bookingBarContent}>
          <View style={styles.bookingPriceInfo}>
            <Text style={styles.bookingPrice}>${hotelData.price || 0}</Text>
            <Text style={styles.bookingPriceLabel}>per night</Text>
          </View>
          <TouchableOpacity 
            style={styles.bookingButton} 
            onPress={() => setModalVisible(true)} 
            activeOpacity={0.85}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.bookingButtonText}>Reserve</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reserve Your Stay</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {/* Hotel Summary */}
              <View style={styles.hotelSummary}>
                <Text style={styles.summaryHotelName}>{hotelData.HotelName || 'Unknown Hotel'}</Text>
                <Text style={styles.summaryLocation}>{(hotelData.city || 'Unknown')}, {(hotelData.country || 'Unknown')}</Text>
              </View>

              {/* Date Selection */}
              <View style={styles.dateSection}>
                <Text style={styles.dateSectionTitle}>Select Dates</Text>
                
                <View style={styles.dateRow}>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>Check-in</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        value={date.toISOString().slice(0, 10)}
                        onChange={e => setDate(new Date(e.target.value))}
                        style={styles.webDateInput}
                      />
                    ) : (
                      <>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShow(true)}>
                          <Ionicons name="calendar-outline" size={18} color="#007BFF" />
                          <Text style={styles.dateButtonText}>{date.toDateString()}</Text>
                        </TouchableOpacity>
                        {show && (
                          <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onChange}
                            minimumDate={new Date()}
                          />
                        )}
                      </>
                    )}
                  </View>

                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>Check-out</Text>
                    {Platform.OS === 'web' ? (
                      <input
                        type="date"
                        value={date2.toISOString().slice(0, 10)}
                        onChange={e => setDate2(new Date(e.target.value))}
                        style={styles.webDateInput}
                      />
                    ) : (
                      <>
                        <TouchableOpacity style={styles.dateButton} onPress={() => setShow2(true)}>
                          <Ionicons name="calendar-outline" size={18} color="#007BFF" />
                          <Text style={styles.dateButtonText}>{date2.toDateString()}</Text>
                        </TouchableOpacity>
                        {show2 && (
                          <DateTimePicker
                            value={date2}
                            mode="date"
                            display="default"
                            onChange={onChange2}
                            minimumDate={new Date(date.getTime() + 24 * 60 * 60 * 1000)}
                          />
                        )}
                      </>
                    )}
                  </View>
                </View>
              </View>

              {/* Price Summary */}
              <View style={styles.priceSummary}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>${hotelData.price || 0} × {calculateNights()} nights</Text>
                  <Text style={styles.priceValue}>${totalPrice}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>${totalPrice}</Text>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.notesSection}>
                <Text style={styles.notesLabel}>Special requests (optional)</Text>
                <TextInput
                  placeholder="Any special requests or notes..."
                  style={styles.noteInput}
                  value={note}
                  onChangeText={setNote}
                  placeholderTextColor="#aaa"
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, loading && styles.confirmButtonDisabled]}
                onPress={createOrders}
                activeOpacity={0.8}
                disabled={loading}
              >
                {loading ? (
                  <Text style={styles.confirmButtonText}>Booking...</Text>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="white" style={{ marginRight: 6 }} />
                    <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafd',
  },
  
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 50,
  },
  
  // Hero Section
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroTextOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroLocation: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 6,
    opacity: 0.9,
  },
  
  // Image Indicators
  imageIndicators: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
  
  // Fixed Header
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerFavoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Animated Header
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    zIndex: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  
  // Info Container
  infoContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    paddingTop: 20,
    paddingHorizontal: 20,
    minHeight: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    paddingVertical: 15,
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  
  // Address
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  addressIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 15,
    color: '#666',
    lineHeight: 20,
  },
  
  // Price
  priceContainer: {
    marginBottom: 25,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  perNight: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
    marginLeft: 4,
  },
  totalPriceHint: {
    marginTop: 5,
  },
  totalPriceText: {
    fontSize: 14,
    color: '#888',
  },
  
  // Sections
  sectionContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  
  // Description
  descriptionBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  descriptionText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  showMoreButton: {
    marginTop: 10,
  },
  showMoreText: {
    color: '#007BFF',
    fontWeight: '600',
    fontSize: 14,
  },
  
  // Gallery
  previewContainer: {
    marginVertical: 10,
  },
  galleryImageWrapper: {
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  previewImage: {
    width: 120,
    height: 90,
    backgroundColor: '#f5f5f5',
  },
  noImagesText: {
    color: '#aaa',
    fontStyle: 'italic',
    padding: 20,
    textAlign: 'center',
  },
  
  // Reviews
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  overallRatingText: {
    marginLeft: 4,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
  },
  reviewsBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  meetupList: {
    gap: 15,
  },
  postContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
 
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewerDetails: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumber: {
    marginLeft: 6,
    fontSize: 12,
    color: '#666',
  },
  reviewContent: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewImages: {
    marginTop: 8,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  viewAllReviews: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
  },
  viewAllText: {
    color: '#007BFF',
    fontWeight: '600',
    marginRight: 4,
  },
  emptyReviewContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyReviewText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyReviewSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  
  // Floating Booking Bar
  floatingBookingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  bookingBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookingPriceInfo: {
    flex: 1,
  },
  bookingPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  bookingPriceLabel: {
    fontSize: 14,
    color: '#666',
  },
  bookingButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#007BFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Bottom Spacing
  bottomSpacing: {
    height: 100,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  
  // Hotel Summary in Modal
  hotelSummary: {
    marginBottom: 25,
  },
  summaryHotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  summaryLocation: {
    fontSize: 14,
    color: '#666',
  },
  
  // Date Section
  dateSection: {
    marginBottom: 25,
  },
  dateSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 15,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  webDateInput: {
    padding: 12,
    borderRadius: 10,
    border: '1px solid #e9ecef',
    backgroundColor: '#f8f9fa',
    fontSize: 14,
  },
  
  // Price Summary
  priceSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  
  // Notes Section
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  noteInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  
  // Modal Footer
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007BFF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HotelDetailScreen;