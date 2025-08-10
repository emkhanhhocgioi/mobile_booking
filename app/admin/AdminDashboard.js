// Dashboard.js
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import HotelList from './HotelList';
import OrderList from './OrderList';
import ReviewList from './ReviewList';
import UserList from './UserList';
import DestinationInput from './destinationInput';
let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const Dashboard = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [listtype,setListtyep] = useState(0)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalOrders: 0,
    totalReviews: 0
  });

  const menuItems = [
    { id: 1, title: 'Users', icon: 'people', color: '#4CAF50' },
    { id: 2, title: 'Hotels', icon: 'hotel', color: '#2196F3' },
    { id: 3, title: 'Orders', icon: 'shopping-cart', color: '#FF9800' },
    { id: 4, title: 'Reviews', icon: 'star', color: '#9C27B0' },
    { id: 5, title: 'Destinations', icon: 'place', color: '#F44336' },
  ];

  const getStats = async () => {
    try {
      // You can add API calls here to get actual statistics
      // For now, using placeholder data
      setStats({
        totalUsers: 150,
        totalHotels: 75,
        totalOrders: 320,
        totalReviews: 89
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    getStats();
  }, []);
 
  
 
  
  
 

 
  const handleOpenModal = (type) => {
    setModalVisible(true);
    setListtyep(type);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setListtyep(0);
  };

  const renderDashboardOverview = () => (
    <View style={styles.overviewContainer}>
      <Text style={styles.welcomeText}>Welcome to Admin Dashboard</Text>
      <Text style={styles.subtitleText}>Manage your hotel booking platform</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="people" size={30} color="#4CAF50" />
          <Text style={styles.statNumber}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="hotel" size={30} color="#2196F3" />
          <Text style={styles.statNumber}>{stats.totalHotels}</Text>
          <Text style={styles.statLabel}>Hotels</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="shopping-cart" size={30} color="#FF9800" />
          <Text style={styles.statNumber}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Icon name="star" size={30} color="#9C27B0" />
          <Text style={styles.statNumber}>{stats.totalReviews}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtonsContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.actionButton, { backgroundColor: item.color }]}
              onPress={() => handleOpenModal(item.id)}
            >
              <Icon name={item.icon} size={24} color="#fff" />
              <Text style={styles.actionButtonText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );  return (
    <>
      <StatusBar backgroundColor="#1a237e" barStyle="light-content" />
      <View style={styles.container}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <View style={styles.sidebarHeader}>
            <Icon name="admin-panel-settings" size={32} color="#fff" />
            <Text style={styles.sidebarTitle}>Admin Panel</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.sidebarItem, listtype === 0 && styles.activeSidebarItem]}
            onPress={() => setListtyep(0)}
          >
            <Icon name="dashboard" size={20} color="#fff" style={styles.sidebarIcon} />
            <Text style={styles.sidebarItemText}>Dashboard</Text>
          </TouchableOpacity>
          
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.sidebarItem, listtype === item.id && styles.activeSidebarItem]}
              onPress={() => handleOpenModal(item.id)}
            >
              <Icon name={item.icon} size={20} color="#fff" style={styles.sidebarIcon} />
              <Text style={styles.sidebarItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main content */}
        <View style={styles.mainContent}>
          {!modalVisible || listtype === 0 ? (
            renderDashboardOverview()
          ) : (
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {menuItems.find(item => item.id === listtype)?.title || 'Management'}
                </Text>
                <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                  <Icon name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {listtype === 1 && <UserList />}
                {listtype === 2 && <HotelList />}
                {listtype === 3 && <OrderList />}
                {listtype === 4 && <ReviewList />}
                {listtype === 5 && <DestinationInput />}
              </ScrollView>
            </View>
          )}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    backgroundColor: '#f8f9fa',
  },
  sidebar: {
    width: 280,
    backgroundColor: '#1a237e',
    paddingVertical: 0,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#303f9f',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sidebarTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  activeSidebarItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sidebarIcon: {
    marginRight: 12,
  },
  sidebarItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  overviewContainer: {
    padding: 24,
    flex: 1,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '23%',
    minWidth: 160,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  quickActions: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  modalScrollView: {
    flex: 1,
    padding: 16,
  },
});

export default Dashboard;
