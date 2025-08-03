// Dashboard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import axios from 'axios';
import UserList from './UserList';
import OrderList from './OrderList';
import ReviewList from './ReviewList';
import HotelList from './HotelList';
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
 
  
 
  
  
 

 
  const handleOpenModaluser = () => {
    setModalVisible(true);
 
    setListtyep(1)
  };
  const handleOpenModalhotel = () => {
    setModalVisible(true);

    setListtyep(2)
  };
  const handleOpenModaOrder = () => {
    setModalVisible(true);
   
    setListtyep(3)
  };
  const handleOpenModaReview = () => {
    setModalVisible(true);
    
    setListtyep(4)
  };
  const handleOpenModaDest = () => {
    setModalVisible(true);
    
    setListtyep(5)
  };

  const handleCloseModal= () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <TouchableOpacity style={styles.sidebarItem}>Dashboard</TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={handleOpenModaluser}>
          Users
        </TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={handleOpenModalhotel}>Hotel</TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={handleOpenModaOrder}>Orders</TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={handleOpenModaReview}>Review</TouchableOpacity>
        <TouchableOpacity style={styles.sidebarItem} onPress={handleOpenModaDest}>Destination</TouchableOpacity>     
      </View>

      {/* Main content */}
      <View style={styles.mainContent}>
      {modalVisible && listtype === 1 ? (
  <ScrollView>
    <UserList/>  
    <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
  </ScrollView>
) : listtype === 3 ? (
  <ScrollView>
    <OrderList  />  
    <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
  </ScrollView>
) : listtype === 4 ? (
  <ScrollView>
    <ReviewList  />  
    <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
  </ScrollView>
) : listtype === 2 ? (
  <ScrollView>
    <HotelList />  
    <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
      <Text style={styles.closeButtonText}>Close</Text>
    </TouchableOpacity>
  </ScrollView>
) : listtype === 5 ? (
   <DestinationInput>

   </DestinationInput>
) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    backgroundColor: '#f4f6f9',
  },
  sidebar: {
    width: 250,
    backgroundColor: '#24292e',
    paddingVertical: 20,
    paddingHorizontal: 10,
    justifyContent: 'flex-start',
  },
  sidebarItem: {
    color: '#fff',
    fontSize: 16,
    paddingVertical: 15,
    paddingLeft: 10,
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#d9534f',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});

export default Dashboard;
