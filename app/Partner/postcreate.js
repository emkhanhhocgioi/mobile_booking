import { Picker } from '@react-native-picker/picker'; // Import from @react-native-picker/picker
import { useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

// Mock data for countries and destinations
const MOCK_COUNTRIES = [
  { name: 'Vietnam', code: 'VN' },
  { name: 'Thailand', code: 'TH' },
  { name: 'Singapore', code: 'SG' },
  { name: 'Malaysia', code: 'MY' },
  { name: 'Indonesia', code: 'ID' },
  { name: 'Philippines', code: 'PH' },
  { name: 'Cambodia', code: 'KH' },
  { name: 'Laos', code: 'LA' },
  { name: 'Myanmar', code: 'MM' },
  { name: 'Brunei', code: 'BN' },
  { name: 'Japan', code: 'JP' },
  { name: 'South Korea', code: 'KR' },
  { name: 'China', code: 'CN' },
  { name: 'Hong Kong', code: 'HK' },
  { name: 'Taiwan', code: 'TW' },
  { name: 'United States', code: 'US' },
  { name: 'United Kingdom', code: 'GB' },
  { name: 'France', code: 'FR' },
  { name: 'Germany', code: 'DE' },
  { name: 'Australia', code: 'AU' },
];

const MOCK_DESTINATIONS = {
  'Vietnam': [
    { destname: 'Ho Chi Minh City', region: 'South' },
    { destname: 'Hanoi', region: 'North' },
    { destname: 'Da Nang', region: 'Central' },
    { destname: 'Hoi An', region: 'Central' },
    { destname: 'Nha Trang', region: 'Central' },
    { destname: 'Phu Quoc', region: 'South' },
    { destname: 'Sapa', region: 'North' },
    { destname: 'Hue', region: 'Central' },
    { destname: 'Dalat', region: 'Central' },
    { destname: 'Can Tho', region: 'South' },
  ],
  'Thailand': [
    { destname: 'Bangkok', region: 'Central' },
    { destname: 'Phuket', region: 'South' },
    { destname: 'Chiang Mai', region: 'North' },
    { destname: 'Pattaya', region: 'East' },
    { destname: 'Krabi', region: 'South' },
    { destname: 'Koh Samui', region: 'South' },
    { destname: 'Hua Hin', region: 'Central' },
    { destname: 'Ayutthaya', region: 'Central' },
  ],
  'Singapore': [
    { destname: 'Central Singapore', region: 'Central' },
    { destname: 'Marina Bay', region: 'Central' },
    { destname: 'Orchard Road', region: 'Central' },
    { destname: 'Sentosa Island', region: 'South' },
    { destname: 'Chinatown', region: 'Central' },
    { destname: 'Little India', region: 'Central' },
  ],
  'Malaysia': [
    { destname: 'Kuala Lumpur', region: 'Central' },
    { destname: 'George Town', region: 'North' },
    { destname: 'Langkawi', region: 'North' },
    { destname: 'Malacca', region: 'South' },
    { destname: 'Kota Kinabalu', region: 'East' },
    { destname: 'Johor Bahru', region: 'South' },
  ],
  'Indonesia': [
    { destname: 'Jakarta', region: 'Java' },
    { destname: 'Bali', region: 'Bali' },
    { destname: 'Yogyakarta', region: 'Java' },
    { destname: 'Bandung', region: 'Java' },
    { destname: 'Lombok', region: 'West Nusa Tenggara' },
    { destname: 'Surabaya', region: 'Java' },
  ],
  'Japan': [
    { destname: 'Tokyo', region: 'Kanto' },
    { destname: 'Osaka', region: 'Kansai' },
    { destname: 'Kyoto', region: 'Kansai' },
    { destname: 'Hiroshima', region: 'Chugoku' },
    { destname: 'Nagoya', region: 'Chubu' },
    { destname: 'Fukuoka', region: 'Kyushu' },
  ],
  'United States': [
    { destname: 'New York', region: 'Northeast' },
    { destname: 'Los Angeles', region: 'West' },
    { destname: 'Chicago', region: 'Midwest' },
    { destname: 'Miami', region: 'Southeast' },
    { destname: 'Las Vegas', region: 'West' },
    { destname: 'San Francisco', region: 'West' },
  ],
  'United Kingdom': [
    { destname: 'London', region: 'England' },
    { destname: 'Edinburgh', region: 'Scotland' },
    { destname: 'Manchester', region: 'England' },
    { destname: 'Liverpool', region: 'England' },
    { destname: 'Cardiff', region: 'Wales' },
    { destname: 'Belfast', region: 'Northern Ireland' },
  ],
  'France': [
    { destname: 'Paris', region: 'Île-de-France' },
    { destname: 'Nice', region: 'Provence-Alpes-Côte d\'Azur' },
    { destname: 'Lyon', region: 'Auvergne-Rhône-Alpes' },
    { destname: 'Marseille', region: 'Provence-Alpes-Côte d\'Azur' },
    { destname: 'Bordeaux', region: 'Nouvelle-Aquitaine' },
    { destname: 'Cannes', region: 'Provence-Alpes-Côte d\'Azur' },
  ],
  'Australia': [
    { destname: 'Sydney', region: 'New South Wales' },
    { destname: 'Melbourne', region: 'Victoria' },
    { destname: 'Brisbane', region: 'Queensland' },
    { destname: 'Perth', region: 'Western Australia' },
    { destname: 'Adelaide', region: 'South Australia' },
    { destname: 'Gold Coast', region: 'Queensland' },
  ]
};

const HotelInputForm = () => {
  const route = useRoute();
  const uid = route.params.uid;
  const [hotelName, setHotelName] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [description, setDescription] = useState('');
  const [addon, setAddon] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get available destinations based on selected country
  const getAvailableDestinations = () => {
    return MOCK_DESTINATIONS[country] || [];
  };

  // Calculate form completion percentage
  const getFormCompletionPercentage = () => {
    const requiredFields = [hotelName, address, price, city, country, description];
    const filledFields = requiredFields.filter(field => field && field.trim()).length;
    const imageScore = selectedImages.length > 0 ? 1 : 0;
    return Math.round(((filledFields + imageScore) / (requiredFields.length + 1)) * 100);
  };

  const randomHotelid = () => {
    return 'hotel_' + Math.random().toString(36).substr(2, 9); 
  };

  const createNewPost = async () => {
    // Validation
    if (!hotelName.trim() || !address.trim() || !price.trim() || !city || !country || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Images Required', 'Please add at least one image of your hotel.');
      return;
    }

    setIsSubmitting(true);
    const postID = randomHotelid();
    const UID = uid;
    console.log(UID);

    const formData = new FormData();
    try {
      // Only use actual images, no placeholders
      let images = selectedImages.filter(img => img.uri && img.uri.trim() !== '');
      
      // Ensure we have at least one image (this should be caught by validation above)
      if (images.length === 0) {
        Alert.alert('Images Required', 'Please add at least one image of your hotel.');
        return;
      }

      formData.append('PostID', postID);
      formData.append('posterID', UID);
      formData.append('hotelname', hotelName.trim());
      formData.append('Address', address.trim());
      formData.append('Price', price.trim());
      formData.append('city', city);
      formData.append('country', country);
      formData.append('describe', description.trim());
      formData.append('Addon', addon.trim());
      
      // Add missing fields expected by backend
      formData.append('posterName', ''); // Add empty posterName or get from user profile
      formData.append('freewifi', 'false'); // Default value
      formData.append('freefood', 'false'); // Default value

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
        let fileName = image.fileName || `upload_${index}_${Date.now()}.jpg`;
        let mimeType = image.mimeType || 'image/jpeg';
        if (Platform.OS === 'web' && image.uri.startsWith('data:')) {
          // Web: convert base64 to Blob
          const blob = base64ToBlob(image.uri, mimeType);
          formData.append('file', blob, fileName);
        } else {
          // Mobile: use uri directly
          formData.append('file', {
            uri: image.uri,
            name: fileName,
            type: mimeType,
          });
        }
      });

      console.log('Selected images:', selectedImages);
      console.log('Form data fields before sending:', {
        PostID: postID,
        posterID: UID,
        hotelname: hotelName.trim(),
        Address: address.trim(),
        Price: price.trim(),
        city: city,
        country: country,
        describe: description.trim(),
        Addon: addon.trim(),
        imageCount: images.length
      });

      // Debug: Log FormData contents
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      // Use axios for FormData upload
      const axios = require('axios');
      const response = await axios.post(
        `${baseUrl}/api/createpost`,
        formData,
        {
          // KHÔNG set Content-Type, để axios tự set boundary
        }
      );

      if (response.status === 201) {
        Alert.alert(
          "🎉 Success!", 
          "Your hotel has been created successfully and is now available for booking!",
          [
            {
              text: "Create Another",
              onPress: () => {
                // Reset form
                setHotelName('');
                setAddress('');
                setCity('');
                setPrice('');
                setCountry('');
                setDescription('');
                setAddon('');
                setSelectedImages([]);
              }
            },
            {
              text: "Done",
              style: "default"
            }
          ]
        );
      } else {
        console.log('Error creating post', response.status);
        console.log('Error response:', response.data);
        Alert.alert('Error', response.data?.message || 'Failed to create hotel. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading:', error.message);
      console.error('Full error object:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      if (error.response) {
        // Server responded with error status
        console.log('Server error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        
        // Handle specific error cases
        if (error.response.status === 400) {
          if (error.response.data?.message?.includes('No files uploaded')) {
            errorMessage = 'Please ensure at least one image is selected and uploaded.';
          } else if (error.response.data?.message?.includes('already exists')) {
            errorMessage = 'This hotel ID already exists. Please try again.';
          }
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Check your internet connection.';
        console.log('No response received:', error.request);
      } else {
        console.log('Error in setup:', error.message);
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pickImageAsyncMutilple = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const remainingSlots = 4 - selectedImages.length;
      if (remainingSlots <= 0) {
        Alert.alert('Limit reached', 'You can only add up to 4 images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS !== 'web', // Disable editing on web for better UX
        aspect: Platform.OS !== 'web' ? [16, 9] : undefined,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset, index) => ({
          uri: asset.uri,
          fileName: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          mimeType: asset.type || 'image/jpeg',
        }));
        
        setSelectedImages(prev => [...prev, ...newImages].slice(0, 4));
        
        // Show success message
        if (newImages.length > 0) {
          Alert.alert(
            'Images Added', 
            `Successfully added ${newImages.length} image${newImages.length > 1 ? 's' : ''}.`
          );
        }
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not pick images. Please try again.');
    }
  };

  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera permissions to make this work!');
        return;
      }

      if (selectedImages.length >= 4) {
        Alert.alert('Limit reached', 'You can only add up to 4 images.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImage = {
          uri: result.assets[0].uri,
          fileName: result.assets[0].fileName || `camera_${Date.now()}.jpg`,
          mimeType: result.assets[0].type || 'image/jpeg',
        };
        setSelectedImages(prev => [...prev, newImage]);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Could not take photo.');
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const renderImagePicker = () => {
    const isWeb = Platform.OS === 'web';
    
    return (
      <View style={styles.imagePickerContainer}>
        <View style={styles.imagePickerHeader}>
          <Text style={styles.label}>Hotel Images</Text>
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{selectedImages.length}/4</Text>
          </View>
        </View>
        
        {selectedImages.length === 0 ? (
          <View style={styles.emptyImageState}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="cloud-upload-outline" size={60} color="#3498db" />
            </View>
            <Text style={styles.emptyImageText}>Upload Hotel Photos</Text>
            <Text style={styles.emptyImageSubtext}>Add up to 4 high-quality images of your hotel</Text>
            
            <View style={styles.uploadButtonsContainer}>
              {!isWeb && (
                <TouchableOpacity 
                  style={[styles.uploadButton, styles.cameraButton]} 
                  onPress={pickImageFromCamera}
                >
                  <Ionicons name="camera" size={20} color="white" />
                  <Text style={styles.uploadButtonText}>Camera</Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={[styles.uploadButton, styles.galleryButton]} 
                onPress={pickImageAsyncMutilple}
              >
                <Ionicons name="images" size={20} color="white" />
                <Text style={styles.uploadButtonText}>
                  {isWeb ? 'Choose Files' : 'Gallery'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <View style={[styles.imageGrid, isWeb && styles.imageGridWeb]}>
              {selectedImages.map((image, index) => (
                <View key={index} style={[styles.imagePreview, isWeb && styles.imagePreviewWeb]}>
                  <Image source={{ uri: image.uri }} style={[styles.previewImage, isWeb && styles.previewImageWeb]} />
                  <TouchableOpacity 
                    style={styles.removeImageButton} 
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                  <View style={styles.imageIndex}>
                    <Text style={styles.imageIndexText}>{index + 1}</Text>
                  </View>
                </View>
              ))}
              
              {selectedImages.length < 4 && (
                <TouchableOpacity 
                  style={[styles.addImagePlaceholder, isWeb && styles.addImagePlaceholderWeb]} 
                  onPress={() => {
                    if (isWeb) {
                      pickImageAsyncMutilple();
                    } else {
                      Alert.alert(
                        'Add Image',
                        'Choose an option',
                        [
                          { text: 'Camera', onPress: pickImageFromCamera },
                          { text: 'Gallery', onPress: pickImageAsyncMutilple },
                          { text: 'Cancel', style: 'cancel' }
                        ]
                      );
                    }
                  }}
                >
                  <Ionicons name="add" size={30} color="#3498db" />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.imageActions}>
              <TouchableOpacity 
                style={styles.clearAllButton} 
                onPress={() => {
                  Alert.alert(
                    'Clear All Images',
                    'Are you sure you want to remove all images?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Clear All', style: 'destructive', onPress: () => setSelectedImages([]) }
                    ]
                  );
                }}
              >
                <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.imageUploadTips}>
          <Text style={styles.tipsTitle}>📷 Photo Tips:</Text>
          <Text style={styles.tipsText}>• Use high-resolution images (minimum 1200x800)</Text>
          <Text style={styles.tipsText}>• Show different angles and amenities</Text>
          <Text style={styles.tipsText}>• Ensure good lighting for best results</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create New Hotel</Text>
        <Text style={styles.headerSubtitle}>Fill in the details below to list your property</Text>
        
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${getFormCompletionPercentage()}%` }]} />
          </View>
          <Text style={styles.progressText}>{getFormCompletionPercentage()}% Complete</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="business-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Hotel Name *</Text>
        </View>
        <TextInput
          style={[styles.input, hotelName && styles.inputFilled]}
          placeholder="Enter your hotel name"
          placeholderTextColor="#a0aec0"
          value={hotelName}
          onChangeText={setHotelName}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="location-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Address *</Text>
        </View>
        <TextInput
          style={[styles.input, address && styles.inputFilled]}
          placeholder="Enter complete address with street, city details"
          placeholderTextColor="#a0aec0"
          value={address}
          onChangeText={setAddress}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="card-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Price per night *</Text>
        </View>
        <TextInput
          style={[styles.input, price && styles.inputFilled]}
          placeholder="Enter price in USD (e.g., 150)"
          placeholderTextColor="#a0aec0"
          value={price}
          keyboardType="numeric"
          onChangeText={setPrice}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="flag-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Country *</Text>
        </View>
        <View style={[styles.pickerContainer, country && styles.inputFilled]}>
          <Picker
            selectedValue={country}
            onValueChange={(value) => {
              setCountry(value);
              setCity(''); // Reset city when country changes
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select a country" value="" />
            {MOCK_COUNTRIES.map((ctry, index) => (
              <Picker.Item
                key={index}
                label={ctry.name} 
                value={ctry.name} 
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="navigate-outline" size={20} color="#3498db" />
          <Text style={styles.label}>City/Destination *</Text>
        </View>
        {country ? (
          getAvailableDestinations().length > 0 ? (
            <View style={[styles.pickerContainer, city && styles.inputFilled]}>
              <Picker
                selectedValue={city}
                onValueChange={(value) => setCity(value)}
                style={styles.picker}
              >
                <Picker.Item label={`Select a destination in ${country}`} value="" />
                {getAvailableDestinations().map((dest, index) => (
                  <Picker.Item
                    key={index}
                    label={`${dest.destname} (${dest.region})`}
                    value={dest.destname}
                  />
                ))}
              </Picker>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>No destinations available for {country}</Text>
            </View>
          )
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Please select a country first</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="document-text-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Description *</Text>
        </View>
        <TextInput
          style={[styles.input, styles.multiline, description && styles.inputFilled]}
          placeholder="Describe your hotel, amenities, location highlights, and what makes it special..."
          placeholderTextColor="#a0aec0"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="star-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Additional Services</Text>
        </View>
        <TextInput
          style={[styles.input, addon && styles.inputFilled]}
          placeholder="WiFi, Pool, Gym, Spa, Airport Transfer, etc..."
          placeholderTextColor="#a0aec0"
          value={addon}
          onChangeText={setAddon}
        />
      </View>

      {renderImagePicker()}

      <TouchableOpacity 
        style={[
          styles.createButton, 
          (!hotelName || !address || !price || !city || !country || !description || isSubmitting) && styles.disabledButton
        ]} 
        onPress={createNewPost}
        disabled={!hotelName || !address || !price || !city || !country || !description || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Ionicons name="hourglass-outline" size={24} color="white" />
            <Text style={styles.createButtonText}>Creating Hotel...</Text>
          </>
        ) : (
          <>
            <Ionicons name="checkmark-circle-outline" size={24} color="white" />
            <Text style={styles.createButtonText}>Create Hotel</Text>
          </>
        )}
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Platform.OS === 'web' ? 40 : 20,
    backgroundColor: '#f8fafe',
    paddingBottom: 40,
    minHeight: '100%',
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 28,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginLeft: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputFilled: {
    borderColor: '#68d391',
    backgroundColor: '#f0fff4',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  loadingText: {
    color: '#718096',
    fontSize: 14,
    fontStyle: 'italic',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2d3748',
    transition: 'border-color 0.2s',
  },
  inputFocused: {
    borderColor: '#3498db',
    shadowColor: '#3498db',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  multiline: {
    height: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#2d3748',
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
  imagePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  imageCounter: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  imageCounterText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ebf3fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonsContainer: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  cameraButton: {
    backgroundColor: '#e74c3c',
  },
  galleryButton: {
    backgroundColor: '#3498db',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'flex-start',
  },
  imageGridWeb: {
    gap: 20,
  },
  imagePreview: {
    position: 'relative',
    width: (width - 70) / 2,
    aspectRatio: 16/10,
  },
  imagePreviewWeb: {
    width: 180,
    height: 120,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  previewImageWeb: {
    width: 180,
    height: 120,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  imageIndex: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndexText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  addImagePlaceholder: {
    width: (width - 70) / 2,
    aspectRatio: 16/10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fcff',
  },
  addImagePlaceholderWeb: {
    width: 180,
    height: 120,
  },
  addImageText: {
    fontSize: 12,
    color: '#3498db',
    marginTop: 5,
    fontWeight: '600',
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#fecaca',
    gap: 5,
  },
  clearAllText: {
    color: '#e74c3c',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyImageState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ebf3fd',
    borderStyle: 'dashed',
  },
  emptyImageText: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: '600',
  },
  emptyImageSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  imageUploadTips: {
    backgroundColor: '#f8fcff',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    lineHeight: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    padding: 18,
    borderRadius: 16,
    marginTop: 30,
    marginBottom: 20,
    shadowColor: '#3498db',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 56,
  },
  disabledButton: {
    backgroundColor: '#cbd5e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
    letterSpacing: 0.5,
  },
});

export default HotelInputForm;
