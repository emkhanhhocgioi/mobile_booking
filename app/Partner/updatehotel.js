import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const UpdatePost = ({ data, navigation, onClose }) => {
  const [hotelName, setHotelName] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [addon, setAddon] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [countries, setCountries] = useState([]);
  const [destination, setDestination] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  // Ảnh gốc của post (imgArr)
  const [originalImages, setOriginalImages] = useState([]);
  // Modal xem ảnh lớn
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImageUri, setModalImageUri] = useState('');
  const [loading, setLoading] = useState(false);
  const postid = data.PostID;
  
  // Calculate form completion percentage
  const getFormCompletionPercentage = () => {
    const requiredFields = [hotelName, address, price, city, country, description];
    const filledFields = requiredFields.filter(field => field && field.trim()).length;
    // Chỉ tính ảnh mới được chọn, không tính ảnh cũ
    const imageScore = selectedImages.length > 0 ? 1 : 0;
    return Math.round(((filledFields + imageScore) / (requiredFields.length + 1)) * 100);
  };
  
  // countries và destination đã lấy từ API và lưu vào state: countries, destination
  let baseUrl = "http://localhost:5000";
  if (Platform.OS === "android") {
    baseUrl = "http://10.0.2.2:5000";
  } else if (Platform.OS === "ios") {
    baseUrl = "http://172.20.10.9:5000";
  }
  
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
  

  useEffect(() => {
    setCountries(MOCK_COUNTRIES);
    setDestination(Object.entries(MOCK_DESTINATIONS).flatMap(([country, cities]) =>
      cities.map(city => ({ country, ...city }))
    ));
    loadExistingData();
  }, []);

  const loadExistingData = () => {
    console.log('📂 LOADING EXISTING DATA');
    console.log('Input data:', data);
    
    if (data) {
      console.log('📋 Setting form fields from existing data...');
      
      const hotelNameValue = data.HotelName || '';
      const addressValue = data.Address || '';
      const priceValue = data.price?.toString() || '';
      const descriptionValue = data.describe || '';
      const addonValue = data.addon || '';
      const countryValue = data.country || '';
      const cityValue = data.city || '';
      
      console.log('📝 Form field values:', {
        hotelName: hotelNameValue,
        address: addressValue,
        price: priceValue,
        description: descriptionValue.substring(0, 50) + '...',
        addon: addonValue.substring(0, 30) + '...',
        country: countryValue,
        city: cityValue
      });
      
      setHotelName(hotelNameValue);
      setAddress(addressValue);
      setPrice(priceValue);
      setDescription(descriptionValue);
      setAddon(addonValue);
      setCountry(countryValue);
      setCity(cityValue);
      
      // Processing existing images
      console.log('🖼️ Processing existing images...');
      console.log('Raw imgArr:', data.imgArr);
      console.log('imgArr type:', typeof data.imgArr);
      console.log('imgArr isArray:', Array.isArray(data.imgArr));
      
      if (Array.isArray(data.imgArr) && data.imgArr.length > 0) {
        console.log('📸 Found existing images:', data.imgArr.length);
        
        // Filter out invalid images
        const validImages = data.imgArr.filter(uri => {
          const isValid = uri && 
                         uri !== 'null' && 
                         uri !== 'undefined' && 
                         uri.trim() !== '' &&
                         uri !== '""' &&
                         uri !== "''";
          console.log(`Image validation - URI: ${uri?.substring(0, 30)}..., Valid: ${isValid}`);
          return isValid;
        });
        
        console.log('✅ Valid images after filtering:', validImages.length);
        
        // Convert imgArr to object format
        const imgs = validImages.map((uri, idx) => {
          const fullUri = uri.startsWith('http') ? uri : `${baseUrl}${uri}`;
          const imageObj = {
            uri: fullUri,
            fileName: `old_image_${idx}.jpg`,
            mimeType: 'image/jpeg',
            isOld: true
          };
          
          console.log(`📷 Processing existing image ${idx + 1}:`, {
            originalUri: uri,
            fullUri: fullUri.substring(0, 50) + '...',
            fileName: imageObj.fileName,
            isOld: imageObj.isOld
          });
          
          return imageObj;
        });
        
        console.log('📝 Setting originalImages with', imgs.length, 'images');
        setOriginalImages(imgs);
      } else {
        console.log('❌ No valid existing images found');
        setOriginalImages([]);
      }
      
      console.log('✅ Existing data loaded successfully');
    } else {
      console.log('❌ No data provided to load');
    }
  };

  // Đã chuyển sang dùng mock data, không cần gọi API lấy destination/countries

  const pickImageAsyncMultiple = async () => {
    console.log('📷 PICK MULTIPLE IMAGES STARTED');
    try {
      console.log('🔐 Requesting media library permissions...');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        console.log('❌ Permission denied');
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      // Chỉ tính ảnh mới, không tính ảnh cũ
      const totalImages = selectedImages.length;
      const remainingSlots = 4 - totalImages;
      console.log('📊 Image slots calculation:', {
        selectedImages: selectedImages.length,
        totalImages: totalImages,
        remainingSlots: remainingSlots
      });
      
      if (remainingSlots <= 0) {
        console.log('❌ Image limit reached');
        Alert.alert('Limit reached', 'You can only select up to 4 new images.');
        return;
      }

      console.log('🖼️ Launching image picker with config:', {
        mediaTypes: 'Images',
        allowsEditing: Platform.OS !== 'web',
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots
      });

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: Platform.OS !== 'web',
        aspect: Platform.OS !== 'web' ? [16, 9] : undefined,
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: remainingSlots,
      });

      console.log('📱 Image picker result:', {
        canceled: result.canceled,
        assetsCount: result.assets?.length || 0
      });

      if (!result.canceled) {
        const newImages = result.assets.map((asset, index) => {
          console.log(`📸 Processing asset ${index + 1}:`, {
            uri: asset.uri?.substring(0, 50) + '...',
            fileName: asset.fileName,
            type: asset.type,
            width: asset.width,
            height: asset.height,
            fileSize: asset.fileSize
          });
          
          return {
            uri: asset.uri,
            fileName: asset.fileName || `new_image_${Date.now()}_${index}.jpg`,
            mimeType: asset.type || 'image/jpeg',
            type: asset.type || 'image/jpeg', // Add this for consistency
            isOld: false
          };
        });
        
        console.log('✅ New images processed:', newImages.length);
        setSelectedImages(prev => {
          const updated = [...prev, ...newImages];
          console.log('📝 Updated selectedImages count:', updated.length);
          return updated;
        });
        
        if (newImages.length > 0) {
          console.log('🎉 Images successfully added to selection');
          Alert.alert(
            'Images Added', 
            `Successfully added ${newImages.length} image${newImages.length > 1 ? 's' : ''}.`
          );
        }
      } else {
        console.log('❌ User canceled image selection');
      }
    } catch (error) {
      console.log('💥 Error in pickImageAsyncMultiple:', error);
      Alert.alert('Error', 'Could not pick images. Please try again.');
    }
  };

  const pickImageFromCamera = async () => {
    console.log('📷 PICK IMAGE FROM CAMERA STARTED');
    try {
      console.log('🔐 Requesting camera permissions...');
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission status:', status);
      
      if (status !== 'granted') {
        console.log('❌ Camera permission denied');
        Alert.alert('Permission required', 'Sorry, we need camera permissions to make this work!');
        return;
      }

      // Chỉ tính ảnh mới, không tính ảnh cũ
      const totalImages = selectedImages.length;
      console.log('📊 Image count check:', {
        selectedImages: selectedImages.length,
        totalImages: totalImages,
        limitReached: totalImages >= 4
      });
      
      if (totalImages >= 4) {
        console.log('❌ Image limit reached');
        Alert.alert('Limit reached', 'You can only select up to 4 new images.');
        return;
      }

      console.log('📸 Launching camera with config:', {
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8
      });

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      console.log('📱 Camera result:', {
        canceled: result.canceled,
        hasAssets: !!result.assets?.[0]
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        console.log('📸 Processing camera image:', {
          uri: asset.uri?.substring(0, 50) + '...',
          fileName: asset.fileName,
          type: asset.type,
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize
        });
        
        const newImage = {
          uri: asset.uri,
          fileName: asset.fileName || `camera_${Date.now()}.jpg`,
          mimeType: asset.type || 'image/jpeg',
          type: asset.type || 'image/jpeg', // Add this for consistency
          isOld: false
        };
        
        console.log('✅ Camera image processed, adding to selectedImages');
        setSelectedImages(prev => {
          const updated = [...prev, newImage];
          console.log('📝 Updated selectedImages count:', updated.length);
          return updated;
        });
        
        console.log('🎉 Camera image successfully added');
      } else {
        console.log('❌ User canceled camera');
      }
    } catch (error) {
      console.log('💥 Error in pickImageFromCamera:', error);
      Alert.alert('Error', 'Could not take photo.');
    }
  };


  // Xóa ảnh mới chọn
  const removeImage = (index) => {
    console.log('🗑️ REMOVING NEW IMAGE');
    console.log('Image index to remove:', index);
    console.log('Current selectedImages count:', selectedImages.length);
    console.log('Image being removed:', selectedImages[index]);
    
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    console.log('Updated selectedImages count after removal:', updatedImages.length);
    
    setSelectedImages(updatedImages);
    console.log('✅ New image removed successfully');
  };
  
  // Xóa ảnh gốc (ẩn khỏi UI, không gửi lên server)
  const removeOriginalImage = (index) => {
    console.log('🗑️ REMOVING ORIGINAL IMAGE');
    console.log('Original image index to remove:', index);
    console.log('Current originalImages count:', originalImages.length);
    console.log('Image being removed:', originalImages[index]);
    
    const updated = originalImages.filter((_, i) => i !== index);
    console.log('Updated originalImages count after removal:', updated.length);
    
    setOriginalImages(updated);
    console.log('✅ Original image removed successfully');
  };

  // Xem lớn ảnh
  const viewImage = (uri) => {
    setModalImageUri(uri);
    setModalVisible(true);
  };

  // Thay thế ảnh cũ
  const replaceOriginalImage = async (index) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled) {
        const newImg = {
          uri: result.assets[0].uri,
          fileName: result.assets[0].fileName || `replaced_image_${index}.jpg`,
          mimeType: result.assets[0].mimeType || 'image/jpeg',
          isOld: false,
        };
        const updated = [...originalImages];
        updated[index] = newImg;
        setOriginalImages(updated);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  // Thay thế ảnh mới chọn
  const replaceNewImage = async (index) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });
      if (!result.canceled) {
        const newImg = {
          uri: result.assets[0].uri,
          fileName: result.assets[0].fileName || `replaced_new_image_${index}.jpg`,
          mimeType: result.assets[0].mimeType || 'image/jpeg',
          isOld: false,
        };
        const updated = [...selectedImages];
        updated[index] = newImg;
        setSelectedImages(updated);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  const deleteExistPostImg = async () => {
    try {
      const response = await axios.put(`${baseUrl}/api/delete/postexistimg`, {
        postid: postid,
      });
      console.log('Existing images deleted successfully:', response.data);
    } catch (error) {
      console.error('Error deleting existing images:', error);
    }
  };

  // NOTE: This is the client-side function. The check for req.file should be done on the server-side API handler.
  // On your server (Node.js/Express), in the /api/updatepost route handler, add:
  
  // if (!req.file) {
  //   return res.status(400).json({ message: 'No image file uploaded' });
  // }
  
  // The client-side code remains unchanged, but you will now get a proper error response if no image file is uploaded.
  
  const updatePost = async () => {
      console.log('=== UPDATE POST PROCESS STARTED ===');
      console.log('🔄 Starting update process for PostID:', postid);
      setLoading(true);
      // Validation phase
      console.log('📝 VALIDATION PHASE');
      const missingFields = [];
      if (!postid) missingFields.push('PostID');
      if (!hotelName) missingFields.push('Hotel Name');
      if (!address) missingFields.push('Address');
      if (!price) missingFields.push('Price');
      if (!city) missingFields.push('City');
      if (!country) missingFields.push('Country');
      if (!description) missingFields.push('Description');
      if (!addon) missingFields.push('Add-on');
  
      console.log('✅ Field validation results:', {
        PostID: !!postid,
        HotelName: !!hotelName,
        Address: !!address,
        Price: !!price,
        City: !!city,
        Country: !!country,
        Description: !!description,
        Addon: !!addon,
        missingFields: missingFields
      });
  
      if (missingFields.length > 0) {
        console.log('❌ Validation failed - missing fields:', missingFields);
        Alert.alert('Missing Fields', `Please fill in: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }
  
      console.log('✅ All validation passed');
  
      try {
        // FormData preparation phase
        console.log('📦 FORMDATA PREPARATION PHASE');
        const formdata = new FormData();
        
        // Append basic fields with correct names matching PostController
        console.log('📋 Adding basic fields to FormData...');
        formdata.append('PostID', postid);
        formdata.append('HotelName', hotelName);
        formdata.append('Address', address);
        formdata.append('price', price);
        formdata.append('city', city);
        formdata.append('country', country);
        formdata.append('describe', description);
        formdata.append('addon', addon);
  
        // NOTE: Server sẽ XÓA TẤT CẢ ảnh cũ và chỉ lưu ảnh mới
        // Không cần gửi thông tin ảnh cũ
        
        console.log('📋 Basic fields added:', {
          PostID: postid,
          HotelName: hotelName,
          Address: address,
          price: price,
          city: city,
          country: country,
          describe: description.substring(0, 50) + '...',
          addon: addon.substring(0, 30) + '...',
          originalImagesWillBeDeleted: originalImages.length
        });
  
        // Image processing phase
        console.log('🖼️ IMAGE PROCESSING PHASE');
        console.log('Current hotel has', originalImages.length, 'existing images (will be deleted)');
        console.log('Selected new images count (will be uploaded):', selectedImages.length);
        console.log('⚠️ NOTE: Server will DELETE ALL old images and upload ONLY new ones');
        
        // CHỈ GỬI ẢNH MỚI - Server sẽ xóa tất cả ảnh cũ
        console.log('Selected images details:', selectedImages.map((img, idx) => ({
          index: idx,
          fileName: img.fileName,
          mimeType: img.mimeType,
          hasUri: !!img.uri,
          isNew: true
        })));

        // Append only NEW images to form data
        let imageCount = 0;
        
        // Helper function to convert base64 to Blob (for web)
        const base64ToBlob = (base64, mimeType) => {
          try {
            const byteString = atob(base64.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ab], { type: mimeType });
          } catch (error) {
            console.log('Error converting base64 to blob:', error);
            return null;
          }
        };
        
        // Xử lý chỉ ảnh MỚI - Server sẽ xóa tất cả ảnh cũ
        selectedImages.forEach((image, index) => {
          if (image.uri && image.uri.trim() !== '') {
            console.log(`📸 Adding NEW image ${index + 1}:`, {
              fileName: image.fileName,
              mimeType: image.mimeType,
              type: image.type,
              uriLength: image.uri.length,
              isBase64: image.uri.startsWith('data:'),
              platform: Platform.OS
            });
            
            const fileName = image.fileName || `image_${index}.jpg`;
            const mimeType = image.type || image.mimeType || 'image/jpeg';
            
            if (Platform.OS === 'web' && image.uri.startsWith('data:')) {
              // Web platform with base64 data URI - convert to Blob
              console.log(`🌐 Converting base64 to Blob for image ${index + 1}`);
              const blob = base64ToBlob(image.uri, mimeType);
              if (blob) {
                formdata.append('file', blob, fileName);
                console.log(`✅ Successfully added Blob for image ${index + 1}:`, {
                  fileName: fileName,
                  blobSize: blob.size,
                  blobType: blob.type
                });
                imageCount++;
              } else {
                console.log(`❌ Failed to convert base64 to Blob for image ${index + 1}`);
              }
            } else {
              // Mobile platform or regular URI - use object format
              const fileObject = {
                uri: image.uri,
                name: fileName,
                type: mimeType,
              };
              
              console.log(`� Adding file object for image ${index + 1}:`, fileObject);
              formdata.append('file', fileObject);
              imageCount++;
            }
          } else {
            console.log(`⚠️ Skipping image ${index + 1} - no URI or empty URI`);
          }
        });
        
        console.log(`✅ Total NEW images added to FormData: ${imageCount}`);
        console.log(`⚠️ NOTE: Server will DELETE ${originalImages.length} old images and upload ${imageCount} new ones (${originalImages.length} old images will be permanently lost)`);
        
        // Debug: Let's inspect the FormData
        console.log('🔍 FORMDATA INSPECTION:');
        for (let [key, value] of formdata.entries()) {
          if (key === 'file') {
            if (Platform.OS === 'web' && value instanceof Blob) {
              console.log(`FormData entry - ${key} (Blob):`, {
                type: 'Blob',
                size: value.size,
                mimeType: value.type,
                isFile: value instanceof File
              });
            } else {
              console.log(`FormData entry - ${key}:`, {
                type: typeof value,
                hasUri: !!(value && value.uri),
                hasName: !!(value && value.name),
                hasType: !!(value && value.type),
                isObject: typeof value === 'object',
                valuePreview: typeof value === 'string' ? value.substring(0, 50) + '...' : 'object'
              });
            }
          } else {
            console.log(`FormData entry - ${key}:`, value);
          }
        }
  
        // Network request phase
        console.log('🌐 NETWORK REQUEST PHASE');
        console.log('Request URL:', `${baseUrl}/api/updatepost`);
        console.log('Request method: PUT');
        console.log('Content-Type: multipart/form-data');
        console.log('Platform:', Platform.OS);
        console.log('Total FormData entries count:', Array.from(formdata.entries()).length);
        
        const response = await axios.put(`${baseUrl}/api/updatepost`, formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000, // 30 second timeout
        });
  
        // Response processing phase
        console.log('📨 RESPONSE PROCESSING PHASE');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
  
        if (response.data.message === 'Data update successful') {
          console.log('✅ UPDATE SUCCESSFUL');
          console.log('Updated hotel data:', response.data.hotel);
          Alert.alert('Success', 'Post updated successfully!', [
            { text: 'OK', onPress: () => {
              console.log('🔙 Navigating back after successful update');
              if (onClose) onClose();
              else navigation.goBack();
            } }
          ]);
        } else {
          console.log('❌ UPDATE FAILED - unexpected response:', response.data);
          Alert.alert('Error', response.data.message || 'Failed to update post');
        }
      } catch (error) {
        console.log('💥 ERROR HANDLING PHASE');
        console.error('Update post error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        if (error.response) {
          console.log('❌ Server responded with error:', error.response.status);
          console.log('Error response data:', error.response.data);
          Alert.alert('Error', error.response.data.message || 'Failed to update post. Please try again.');
        } else if (error.request) {
          console.log('❌ Network error - no response received');
          console.log('Request details:', error.request);
          Alert.alert('Error', 'Network error. Please check your connection and try again.');
        } else {
          console.log('❌ Unknown error occurred');
          Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        }
      } finally {
        console.log('🏁 UPDATE PROCESS COMPLETED');
        setLoading(false);
      }
    };

  // Lấy danh sách thành phố cho country đã chọn
  const getCitiesForCountry = () => {
    if (!country) return [];
    // Nếu API trả về destination dạng [{country, cities: [...]}, ...]
    const selectedCountryData = destination.find(dest => dest.country === country);
    if (selectedCountryData && Array.isArray(selectedCountryData.cities)) {
      return selectedCountryData.cities;
    }
    // Nếu API trả về destination dạng flat: [{destname, country, ...}, ...]
    const flatCities = destination.filter(dest => dest.country === country).map(dest => dest.destname);
    return flatCities.length > 0 ? flatCities : [];
  };

  // Enhanced image picker component - CHỈ HIỂN THỊ ẢNH MỚI
  const renderImagePicker = () => {
    const isWeb = Platform.OS === 'web';
    // Chỉ tính ảnh mới được chọn
    const totalImages = selectedImages.length;
    
    return (
      <View style={styles.imagePickerContainer}>
        <View style={styles.imagePickerHeader}>
          <View style={styles.labelContainer}>
            <Ionicons name="images-outline" size={20} color="#3498db" />
            <Text style={styles.label}>New Hotel Images</Text>
            <Text style={styles.imageNote}>(Will replace all existing images)</Text>
          </View>
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>{totalImages}/4</Text>
          </View>
        </View>
        
        {totalImages === 0 ? (
          <View style={styles.emptyImageState}>
            <View style={styles.uploadIconContainer}>
              <Ionicons name="cloud-upload-outline" size={60} color="#3498db" />
            </View>
            <Text style={styles.emptyImageText}>Upload New Hotel Photos</Text>
            <Text style={styles.emptyImageSubtext}>
              Select up to 4 new images to replace all existing hotel photos
            </Text>
            
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
                onPress={pickImageAsyncMultiple}
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
              {/* CHỈ HIỂN THỊ ẢNH MỚI ĐƯỢC CHỌN - KHÔNG HIỂN THỊ ẢNH CŨ */}
              {selectedImages.map((image, index) => (
                <View key={`new-${index}`} style={[styles.imagePreview, isWeb && styles.imagePreviewWeb]}>
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
                  <View style={styles.imageActions}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => viewImage(image.uri)}>
                      <Ionicons name="eye" size={16} color="#2980b9" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={() => replaceNewImage(index)}>
                      <Ionicons name="swap-horizontal" size={16} color="#27ae60" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              
              {/* Add new image placeholder */}
              {totalImages < 4 && (
                <TouchableOpacity 
                  style={[styles.addImagePlaceholder, isWeb && styles.addImagePlaceholderWeb]} 
                  onPress={() => {
                    if (isWeb) {
                      pickImageAsyncMultiple();
                    } else {
                      Alert.alert(
                        'Add Image',
                        'Choose an option',
                        [
                          { text: 'Camera', onPress: pickImageFromCamera },
                          { text: 'Gallery', onPress: pickImageAsyncMultiple },
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
            
            {totalImages > 0 && (
              <View style={styles.imageActionsContainer}>
                <TouchableOpacity 
                  style={styles.clearAllButton} 
                  onPress={() => {
                    Alert.alert(
                      'Clear All New Images',
                      'Are you sure you want to remove all selected new images?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Clear All', style: 'destructive', onPress: () => {
                          setSelectedImages([]);
                        }}
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                  <Text style={styles.clearAllText}>Clear New Images</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        <View style={styles.imageUploadTips}>
          <Text style={styles.tipsTitle}>⚠️ Important Notice:</Text>
          <Text style={styles.tipsText}>• All existing hotel images will be permanently deleted</Text>
          <Text style={styles.tipsText}>• Only the new images you select will be saved</Text>
          <Text style={styles.tipsText}>• Use high-resolution images (minimum 1200x800)</Text>
          <Text style={styles.tipsText}>• Show different angles and amenities for best results</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose ? onClose : () => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#3498db" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Update Hotel</Text>
          <Text style={styles.headerSubtitle}>Edit your hotel details and keep information up to date</Text>
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${getFormCompletionPercentage()}%` }]} />
            </View>
            <Text style={styles.progressText}>{getFormCompletionPercentage()}% Complete</Text>
          </View>
        </View>
      </View>

      {/* Hotel Name */}
      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="business-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Hotel Name *</Text>
        </View>
        <TextInput
          style={[styles.input, hotelName && styles.inputFilled]}
          value={hotelName}
          onChangeText={setHotelName}
          placeholder="Enter hotel name"
          placeholderTextColor="#a0aec0"
        />
      </View>

      {/* Address */}
      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="location-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Address *</Text>
        </View>
        <TextInput
          style={[styles.input, styles.multiline, address && styles.inputFilled]}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter complete address with street, city details"
          placeholderTextColor="#a0aec0"
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Price */}
      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="card-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Price per night *</Text>
        </View>
        <TextInput
          style={[styles.input, price && styles.inputFilled]}
          value={price}
          onChangeText={setPrice}
          placeholder="Enter price in USD (e.g., 150)"
          placeholderTextColor="#a0aec0"
          keyboardType="numeric"
        />
      </View>

      {/* Country Picker */}
      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="flag-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Country *</Text>
        </View>
        <View style={[styles.pickerContainer, country && styles.inputFilled]}>
          <Picker
            selectedValue={country}
            onValueChange={(itemValue) => {
              setCountry(itemValue);
              setCity('');
            }}
            style={styles.picker}
          >
            <Picker.Item label="Select a country" value="" />
            {countries.map((ctry, index) => (
              <Picker.Item key={index} label={ctry.name || ctry.country || ctry} value={ctry.name || ctry.country || ctry} />
            ))}
          </Picker>
        </View>
      </View>

      {/* City Picker */}
      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="navigate-outline" size={20} color="#3498db" />
          <Text style={styles.label}>City *</Text>
        </View>
        <View style={[styles.pickerContainer, city && styles.inputFilled]}>
          <Picker
            selectedValue={city}
            onValueChange={setCity}
            style={styles.picker}
            enabled={country !== ''}
          >
            <Picker.Item label="Select a city" value="" />
            {getCitiesForCountry().map((cityName, index) => (
              <Picker.Item key={index} label={cityName} value={cityName} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="document-text-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Description *</Text>
        </View>
        <TextInput
          style={[styles.input, styles.multiline, description && styles.inputFilled]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your hotel, amenities, and what makes it special"
          placeholderTextColor="#a0aec0"
          multiline
          numberOfLines={4}
        />
      </View>

      {/* Add-on */}
      <View style={styles.section}>
        <View style={styles.labelContainer}>
          <Ionicons name="star-outline" size={20} color="#3498db" />
          <Text style={styles.label}>Add-on Services</Text>
        </View>
        <TextInput
          style={[styles.input, styles.multiline, addon && styles.inputFilled]}
          value={addon}
          onChangeText={setAddon}
          placeholder="Enter additional services (e.g., spa, gym, restaurant)"
          placeholderTextColor="#a0aec0"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Enhanced Image Selection */}
      <View style={styles.section}>
        {renderImagePicker()}
      </View>

      {/* Modal xem ảnh lớn */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Image source={{ uri: modalImageUri }} style={styles.modalImage} />
          <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Update Button */}
      <TouchableOpacity
        style={[styles.updateButton, loading && styles.disabledButton]}
        onPress={updatePost}
        disabled={loading}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="sync" size={20} color="white" />
            <Text style={styles.updateButtonText}>Updating...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.updateButtonText}>Update Hotel</Text>
          </View>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafe',
  },
  contentContainer: {
    padding: Platform.OS === 'web' ? 40 : 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 30,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
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
    width: '80%',
    alignItems: 'center',
    marginTop: 10,
  },
  progressBar: {
    width: '100%',
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginLeft: 8,
  },
  imageNote: {
    fontSize: 12,
    color: '#e74c3c',
    marginLeft: 8,
    fontStyle: 'italic',
    fontWeight: '500',
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
  inputFilled: {
    borderColor: '#68d391',
    backgroundColor: '#f0fff4',
  },
  multiline: {
    height: 100,
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
  
  // Enhanced Image Picker Styles
  imagePickerContainer: {
    marginTop: 10,
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
  emptyImageState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ebf3fd',
    borderStyle: 'dashed',
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
    shadowOffset: { width: 0, height: 2 },
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
  imageActions: {
    position: 'absolute',
    bottom: 8,
    right: 40,
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 15,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
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
  imageActionsContainer: {
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
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '60%',
    resizeMode: 'contain',
    borderRadius: 16,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 30,
  },
  
  // Button Styles
  updateButton: {
    backgroundColor: '#00b894',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    minHeight: 56,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabledButton: {
    backgroundColor: '#cbd5e0',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default UpdatePost;