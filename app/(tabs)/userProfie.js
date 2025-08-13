import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import UpdatePost from '../Partner/updatehotel';

import { useWindowDimensions } from 'react-native';

// Responsive: lấy kích thước màn hình động
const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  // Số cột FlatList: nhỏ hơn 500px thì 1 cột, lớn hơn thì 2 cột
  const numColumns = width < 500 ? 1 : 2;
  return { width, height, numColumns };
};

let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const ProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  
  // Route params
  const arr = route.params?.username || [];
  const uname = arr[0] || '';
  const uid = arr[1]?.uid || '';
  const userorl = arr[1]?.urole || 0;

  // Profile states
  const [email, setEmail] = useState('');
  const [desc, setDesc] = useState('');
  const [following, setFollowing] = useState(0);
  const [follower, setFollower] = useState(0);
  const [urole, setUrole] = useState(0);
  const [imageUri, setImageUri] = useState(null);
  
  // Modal states
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  
  // Form states
  const [newDesc, setNewDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Post/History states
  const [postData, setPostData] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState(userorl === 1 ? 'posts' : 'history');

  const USER_ROLES = {
    PARTNER: 1,
    CUSTOMER: 2
  };

  const getUser = async (uid) => {
    if (!uid) return;
    
    try {
      const response = await axios.get(`${baseUrl}/api/getUserData`, {
        params: { uid }
      });
      
      const data = response.data;
      setDesc(data.Desc || '');
      setEmail(data.Email || '');
      setFollower(data.followercount || 0);
      setFollowing(data.followingcount || 0);
      setUrole(data.urole || 0);
      
      // Handle profile image
      if (data.imgProfile && data.imgProfile.trim() !== '') {
        setImageUri(data.imgProfile.startsWith('http') 
          ? data.imgProfile 
          : `${baseUrl}/api/image?imgid=${data.imgProfile}`
        );
      } else {
        setImageUri('https://via.placeholder.com/100x100/e1e5e9/6c757d?text=Avatar');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const getUserPost = async (userID) => {
    if (!userID) return;
    
    try {
      const res = await axios.get(`${baseUrl}/api/getuserpost`, {
        params: { userID }
      });
      setPostData(res.data?.post || []);
      console.log('Fetched user posts:', res.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPostData([]);
    }
  };

  const getUserHistory = async (userID) => {
    if (!userID) return;
    
    try {
      const res = await axios.get(`${baseUrl}/api/bookinghistory`, {
        params: { userID }
      });
      
      if (Array.isArray(res.data)) {
        setPostData(res.data);
      } else if (res.data?.history) {
        setPostData(res.data.history);
      } else {
        setPostData([]);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      setPostData([]);
    }
  };

  const pickImageAsync = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera roll permissions are needed to select images.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled) {
        const selectedImage = result.assets[0];
        setSelectedFile(selectedImage);
        setSelectedImagePreview(selectedImage.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not select image');
    }
  };

  const handleSaveChanges = async () => {
    if (!uid) return;
    
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('uid', uid);
      formData.append('username', uname);
      formData.append('desc', newDesc || desc || '');
      
      if (selectedFile?.uri) {
        const fileExtension = selectedFile.uri.split('.').pop() || 'jpg';
        const fileName = `profile_${uname}_${Date.now()}.${fileExtension}`;
        
        formData.append('file', {
          uri: selectedFile.uri,
          type: selectedFile.mimeType || `image/${fileExtension}`,
          name: fileName,
        });
      }

      const response = await fetch(`${baseUrl}/api/upload/profile`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      Alert.alert('Success', 'Profile updated successfully');
      setEditModalVisible(false);
      resetForm();
      await getUser(uid);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  const deletePost = async (postId) => {
    // For desktop, use window.confirm; for mobile, use Alert.alert
    if (Platform.OS === 'web' || Platform.OS === 'windows' || Platform.OS === 'macos') {
      // Desktop confirmation
      if (window.confirm('Are you sure you want to delete this post?')) {
        try {
          await axios.post(`${baseUrl}/api/admin/deletehotel`, { id: postId });
          setPostData(prev => prev.filter(item => item.PostID !== postId));
          Alert.alert('Success', 'Post deleted successfully');
        } catch (error) {
          Alert.alert('Error', 'Failed to delete post');
        }
      }
    } else {
      // Mobile confirmation
      Alert.alert(
        'Delete Post',
        'Are you sure you want to delete this post?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await axios.post(`${baseUrl}/api/admin/deletehotel`, { id: postId });
                setPostData(prev => prev.filter(item => item.PostID !== postId));
                Alert.alert('Success', 'Post deleted successfully');
              } catch (error) {
                Alert.alert('Error', 'Failed to delete post');
              }
            }
          }
        ]
      );
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedImagePreview(null);
    setNewDesc('');
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getUser(uid);
      if (urole === USER_ROLES.PARTNER) {
        await getUserPost(uid);
      } else if (urole === USER_ROLES.CUSTOMER) {
        await getUserHistory(uid);
      }
      // Hiển thị thông báo thành công
      Alert.alert('Success', 'Profile data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      Alert.alert('Error', 'Failed to refresh data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [uid, urole]);

  useEffect(() => {
    if (uid) {
      getUser(uid);
      if (userorl === USER_ROLES.PARTNER) {
        getUserPost(uid);
      } else if (userorl === USER_ROLES.CUSTOMER) {
        getUserHistory(uid);
      }
      setLoading(false);
    }
  }, [uid, userorl]);

  const { width, numColumns } = useResponsive();
  const renderPostCard = ({ item }) => (
    <View style={[styles.postCard, { width: numColumns === 1 ? '100%' : (width - 52) / 2 }]}> 
      {/* Render only the first image in imgArr, fallback if not available */}
      {item.imgArr && item.imgArr.length > 0 && typeof item.imgArr[0] === 'string' && item.imgArr[0].trim() !== '' && item.imgArr[0].toLowerCase() !== 'null' && item.imgArr[0].toLowerCase() !== 'undefined' ? (
        <Image
          source={{ uri: item.imgArr[0].startsWith('http') ? item.imgArr[0] : `${baseUrl}${item.imgArr[0]}` }}
          style={[styles.postImage, { height: width < 400 ? 80 : 100 }]}
          resizeMode="cover"
        />
      ) : (
        <Image
          source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg' }}
          style={[styles.postImage, { height: width < 400 ? 80 : 100 }]}
          resizeMode="cover"
        />
      )}
      <View style={styles.postContent}>
        <Text style={styles.postTitle} numberOfLines={2}>{item.HotelName}</Text>
        <View style={styles.postMeta}>
          <Icon name="location-outline" size={12} color="#666" />
          <Text style={styles.postLocation} numberOfLines={1}>{item.Address}</Text>
        </View>
        <View style={styles.postFooter}>
          <Text style={styles.priceText}>{`$${item.price || '99'}/night`}</Text>
          <View style={styles.postActions}>
            {/* Nút sửa */}
            <TouchableOpacity 
              style={styles.editBtn}
              onPress={() => {
                setSelectedPost(item);
                setUpdateModalVisible(true);
              }}
            >
              <Icon name="pencil" size={14} color="#4A90E2" />
            </TouchableOpacity>
            {/* Nút xóa */}
            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => deletePost(item.PostID)}
            >
              <Icon name="trash" size={14} color="#FF4757" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderHistoryCard = ({ item }) => (
    <View style={styles.historyCard}>
      <View style={styles.historyHeader}>
        <View style={styles.historyInfo}>
          <Text style={styles.historyTitle} numberOfLines={1}>
            {item.HotelDetails?.hotelName}
          </Text>
          <View style={styles.historyMeta}>
            <Icon name="location-outline" size={12} color="#666" />
            <Text style={styles.historyLocation} numberOfLines={1}>
              {item.HotelDetails?.Address}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.checkoutDate}</Text>
        </View>
        <Text style={styles.orderText}>#{item.orderid}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.refreshBtn}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator size="small" color="#4A90E2" />
            ) : (
              <Icon name="refresh-outline" size={24} color="#4A90E2" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingsBtn}
            onPress={() => setEditModalVisible(true)}
          >
            <Icon name="settings-outline" size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: imageUri }} style={styles.avatar} />
            <View style={styles.statusIndicator} />
          </View>
          
          <Text style={styles.profileName}>{uname}</Text>
          <Text style={styles.profileRole}>
            {urole === USER_ROLES.PARTNER ? 'Hotel Partner' : 'Travel Enthusiast'}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{follower}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{postData.length}</Text>
              <Text style={styles.statLabel}>
                {urole === USER_ROLES.PARTNER ? 'Posts' : 'Bookings'}
              </Text>
            </View>
          </View>

          {/* About */}
          {desc && (
            <Text style={styles.aboutText} numberOfLines={3}>
              {desc}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.editProfileBtn}
              onPress={() => setEditModalVisible(true)}
            >
              <Icon name="pencil-outline" size={16} color="#4A90E2" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.refreshDataBtn}
              onPress={onRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <ActivityIndicator size="small" color="#28a745" />
              ) : (
                <Icon name="refresh-outline" size={16} color="#28a745" />
              )}
              <Text style={styles.refreshDataText}>
                {refreshing ? 'Refreshing...' : 'Refresh Data'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.premiumBtn}>
              <Icon name="star-outline" size={16} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Tab Header */}
          <View style={styles.tabHeader}>
            {urole === USER_ROLES.PARTNER && (
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'posts' && styles.activeTabBtn]}
                onPress={() => setActiveTab('posts')}
              >
                <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>
                  My Posts ({postData.length})
                </Text>
              </TouchableOpacity>
            )}
            
            {urole === USER_ROLES.CUSTOMER && (
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'history' && styles.activeTabBtn]}
                onPress={() => setActiveTab('history')}
              >
                <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                  History ({postData.length})
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'settings' && styles.activeTabBtn]}
              onPress={() => setActiveTab('settings')}
            >
              <Text style={[styles.tabText, activeTab === 'settings' && styles.activeTabText]}>
                Settings
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'posts' && urole === USER_ROLES.PARTNER && (
            <View style={styles.postsContent}>
              {postData.length > 0 ? (
                <FlatList
                  key={numColumns} // Thêm dòng này!
                  data={postData}
                  renderItem={renderPostCard}
                  keyExtractor={(item, index) => item.PostID?.toString() || index.toString()}
                  numColumns={numColumns}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                  columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between' } : undefined}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="business-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyTitle}>No Posts Yet</Text>
                  <Text style={styles.emptySubtitle}>Start sharing your amazing places!</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'history' && urole === USER_ROLES.CUSTOMER && (
            <View style={styles.historyContent}>
              {postData.length > 0 ? (
                <FlatList
                  data={postData}
                  renderItem={renderHistoryCard}
                  keyExtractor={(item, index) => item.orderid?.toString() || index.toString()}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Icon name="time-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyTitle}>No Booking History</Text>
                  <Text style={styles.emptySubtitle}>Your bookings will appear here</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'settings' && (
            <View style={styles.settingsContent}>
              <TouchableOpacity style={styles.settingItem}>
                <Icon name="notifications-outline" size={20} color="#666" />
                <Text style={styles.settingText}>Notifications</Text>
                <Icon name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Icon name="shield-outline" size={20} color="#666" />
                <Text style={styles.settingText}>Privacy</Text>
                <Icon name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Icon name="help-circle-outline" size={20} color="#666" />
                <Text style={styles.settingText}>Help & Support</Text>
                <Icon name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingItem}>
                <Icon name="log-out-outline" size={20} color="#FF4757" />
                <Text style={[styles.settingText, { color: '#FF4757' }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity 
              onPress={handleSaveChanges}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Image Section */}
            <View style={styles.imageSection}>
              <TouchableOpacity onPress={pickImageAsync}>
                <Image 
                  source={{ uri: selectedImagePreview || imageUri }} 
                  style={styles.modalAvatar} 
                />
                <View style={styles.cameraIcon}>
                  <Icon name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.imageHint}>Tap to change profile photo</Text>
            </View>

            {/* Description Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>About Me</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Tell us about yourself..."
                value={newDesc}
                onChangeText={setNewDesc}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Update Post Modal */}
      <Modal
        visible={isUpdateModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <UpdatePost 
          data={selectedPost} 
          onClose={() => setUpdateModalVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e0e0e0',
  },
  aboutText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  editProfileBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  editProfileText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  refreshDataBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fff8',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#28a745',
  },
  refreshDataText: {
    color: '#28a745',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  premiumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
    minWidth: 100,
  },
  premiumText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
  },
  contentSection: {
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  tabHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    marginRight: 12,
  },
  activeTabBtn: {
    backgroundColor: '#4A90E2',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  postsContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    // width sẽ được set động theo responsive
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
    alignSelf: 'center',
  },
  postImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  postContent: {
    padding: 12,
  },
  postTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 18,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postLocation: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4A90E2',
  },
  postActions: {
    flexDirection: 'row',
    gap: 6,
  },
  editBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(74,144,226,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,71,87,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  historyInfo: {
    flex: 1,
    marginRight: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  orderText: {
    fontSize: 11,
    color: '#999',
  },
  settingsContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 12,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  saveText: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  imageHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default ProfileScreen;