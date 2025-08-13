import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Picker,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

// Danh sách các quốc gia
const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
  'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
  'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil',
  'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada',
  'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti',
  'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
  'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
  'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India',
  'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'North Korea', 'South Korea', 'Kuwait', 'Kyrgyzstan',
  'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania',
  'Luxembourg', 'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
  'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia',
  'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'Spain', 'Sri Lanka', 'Sudan',
  'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
  'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela',
  'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const DestinationInput = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [destName, setDestName] = useState('');
  const [destdesc, setDestDesc] = useState('');
  const [selectedcountry,setSelectedCountry] = useState('')
  const [image, setImage] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [countries, setCountries] = useState(
    COUNTRIES.map(country => ({
      name: { common: country },
      cca2: country.toLowerCase().replace(/\s+/g, '_')
    })).sort((a, b) => a.name.common.localeCompare(b.name.common))
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  
  const getDestinationData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/api/getDestination`);
      if (response.data) {
        setData(response.data);
        setFilteredData(response.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch destination data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getDestinationData();
    setRefreshing(false);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredData(data);
    } else {
      const filtered = data.filter(dest => 
        dest.destname?.toLowerCase().includes(query.toLowerCase()) ||
        dest.desc?.toLowerCase().includes(query.toLowerCase()) ||
        dest.destcountry?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const createDest = async () => {
    if (!destName.trim()) {
      Alert.alert('Validation Error', 'Please enter destination name');
      return; 
    }
    if (!destdesc.trim()) {
      Alert.alert('Validation Error', 'Please enter destination description');
      return;  
    }
    if (!selectedcountry) {
      Alert.alert('Validation Error', 'Please select a country');
      return;  
    }
    if (!image) {
      Alert.alert('Validation Error', 'Please select an image');
      return;  
    }

    setUploading(true);
    
    try {
      // Step 1: Upload image first
      setUploadingImage(true);
      const imageFormData = new FormData();
      
      if (Platform.OS === 'web' && image.file) {
        // For web platform
        imageFormData.append('file', image.file);
      } else {
        // For mobile platform
        imageFormData.append('file', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || `destination_${Date.now()}.jpg`
        });
      }

      const uploadResponse = await axios.post(`${baseUrl}/api/admin/upload-image`, imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadingImage(false);

      if (!uploadResponse.data.success) {
        throw new Error('Failed to upload image');
      }

      const imageUrl = uploadResponse.data.imageUrl;

      // Step 2: Create destination with image URL
      const destinationData = {
        DestinationName: destName.trim(),
        DestinationDesc: destdesc.trim(),
        destcountry: selectedcountry,
        imageUrl: imageUrl
      };

      const res = await axios.post(`${baseUrl}/api/admin/createdestination`, destinationData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.data) {
        Alert.alert('Success', 'Destination created successfully');
        // Reset form
        setDestName('');
        setDestDesc('');
        setSelectedCountry('');
        setImage(null);
        setImageUri(null);
        setShowCreateForm(false);
        // Refresh data
        getDestinationData();
      }
    } catch (error) {
      console.error('Error creating destination:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create destination. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setUploading(false);
      setUploadingImage(false);
    }
  };

  const handleImagePicker = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size (estimate from dimensions, actual size might differ)
        const estimatedSize = asset.width * asset.height * 4; // rough estimate
        if (estimatedSize > 5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a smaller image');
          return;
        }
        
        setImage({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `destination_${Date.now()}.jpg`
        });
        setImageUri(asset.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
      console.error('ImagePicker error:', error);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        Alert.alert('Invalid File', 'Please select a valid image file (JPG, PNG, GIF)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Please select an image smaller than 5MB');
        return;
      }
      
      setImage({
        uri: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        file: file // Store actual file for FormData
      });
      setImageUri(URL.createObjectURL(file));
    }
  };

  const deleteData = async (oid) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this destination?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await axios.post(
                `${baseUrl}/api/admin/deleteDest`,
                { id: oid }, 
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
        
              if (res.status === 200) {
                Alert.alert('Success', 'Destination deleted successfully');
                setData((prevData) => prevData.filter(item => item.id !== oid));
                setFilteredData((prevData) => prevData.filter(item => item.id !== oid));
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete destination');
            }
          }
        }
      ]
    );
  };

  const renderDestinationItem = ({ item }) => (
    <View style={styles.destinationCard}>
      <View style={styles.destinationHeader}>
        <View style={styles.destinationIconContainer}>
          <Icon name="place" size={24} color="#fff" />
        </View>
        <View style={styles.destinationMainInfo}>
          <Text style={styles.destinationName}>{item.destname}</Text>
          <Text style={styles.destinationCountry}>{item.destcountry || 'Unknown Country'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => deleteData(item.id)}
        >
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.destinationContent}>
        <Text style={styles.destinationDescription}>{item.desc}</Text>
      </View>
    </View>
  );

  useEffect(() => {
    getDestinationData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a237e" />
        <Text style={styles.loadingText}>Loading destinations...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Icon name="place" size={32} color="#F44336" />
          <Text style={styles.statNumber}>{filteredData.length}</Text>
          <Text style={styles.statLabel}>Total Destinations</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="public" size={32} color="#4CAF50" />
          <Text style={styles.statNumber}>
            {new Set(filteredData.map(dest => dest.destcountry)).size}
          </Text>
          <Text style={styles.statLabel}>Countries</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Icon name={showCreateForm ? "remove" : "add"} size={24} color="#fff" />
          <Text style={styles.createButtonText}>
            {showCreateForm ? 'Cancel' : 'Add New Destination'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Create Form */}
      {showCreateForm && (
        <View style={styles.createFormContainer}>
          <Text style={styles.formTitle}>Create New Destination</Text>
          
          <View style={styles.inputContainer}>
            <Icon name="place" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.textInput}
              placeholder="Enter Destination Name"
              value={destName}
              onChangeText={setDestName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Icon name="description" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Enter Destination Description"
              value={destdesc}
              onChangeText={setDestDesc}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.pickerContainer}>
            <Icon name="public" size={20} color="#666" style={styles.inputIcon} />
            <View style={styles.pickerWrapper}>
              {countries && countries.length > 0 ? (
                <Picker
                  selectedValue={selectedcountry}
                  onValueChange={(value) => setSelectedCountry(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select a country" value="" />
                  {countries.map((country) => (
                    <Picker.Item 
                      label={country.name.common} 
                      key={country.cca2} 
                      value={country.name.common} 
                    />
                  ))}
                </Picker>
              ) : (
                <Text style={styles.loadingText}>Loading countries...</Text>
              )}
            </View>
          </View>

          {Platform.OS === 'web' ? (
            <View style={styles.fileInputContainer}>
              <Icon name="image" size={20} color="#666" style={styles.inputIcon} />
              <View style={styles.fileInputWrapper}>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  style={styles.fileInput}
                />
                {image && (
                  <View>
                    <Text style={styles.fileSelectedText}>
                      File selected: {image.name}
                    </Text>
                    {imageUri && (
                      <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                        <TouchableOpacity 
                          style={styles.removeImageButton}
                          onPress={() => {
                            setImage(null);
                            setImageUri(null);
                          }}
                        >
                          <Icon name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.imagePickerContainer}>
              <Icon name="image" size={20} color="#666" style={styles.inputIcon} />
              <View style={styles.imagePickerWrapper}>
                <TouchableOpacity 
                  style={styles.imagePickerButton} 
                  onPress={handleImagePicker}
                >
                  <Icon name="camera-alt" size={20} color="#2196F3" />
                  <Text style={styles.imagePickerButtonText}>
                    {image ? 'Change Image' : 'Select Image'}
                  </Text>
                </TouchableOpacity>
                
                {imageUri && (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => {
                        setImage(null);
                        setImageUri(null);
                      }}
                    >
                      <Icon name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, uploading && styles.submitButtonDisabled]} 
            onPress={createDest}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="save" size={20} color="#fff" />
            )}
            <Text style={styles.submitButtonText}>
              {uploadingImage ? 'Uploading Image...' : uploading ? 'Creating...' : 'Create Destination'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search destinations by name, description, or country..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearButton}>
            <Icon name="clear" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Destinations List */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDestinationItem}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a237e']} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="place" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No destinations found</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try adjusting your search criteria' : 'Create your first destination'}
            </Text>
          </View>
        }
      />
    </ScrollView>
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
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  createFormContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  inputIcon: {
    marginTop: 12,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pickerWrapper: {
    flex: 1,
  },
  picker: {
    height: 50,
  },
  fileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
  },
  fileInputWrapper: {
    flex: 1,
  },
  fileInput: {
    fontSize: 14,
    padding: 8,
    border: '1px solid #ccc',
    borderRadius: 4,
    backgroundColor: '#f8f9fa',
  },
  fileSelectedText: {
    marginTop: 8,
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  imagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
  },
  imagePickerWrapper: {
    flex: 1,
  },
  imagePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  imagePickerButtonText: {
    fontSize: 16,
    color: '#2196F3',
    marginLeft: 8,
    fontWeight: '500',
  },
  imagePreviewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#f44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  destinationCard: {
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
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  destinationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destinationMainInfo: {
    flex: 1,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  destinationCountry: {
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
  destinationContent: {
    padding: 16,
  },
  destinationDescription: {
    fontSize: 14,
    color: '#666',
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

export default DestinationInput;
