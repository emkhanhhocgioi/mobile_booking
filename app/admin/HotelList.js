import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

const baseUrl = "http://localhost:5000";

const HotelList = () => {
  const [data, setData] = useState([]);

  // Fetch hotel data
  const getHotelData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/admin/gethotel`);
      if (response) {
        console.log(response.data);
        setData(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  
  const deleteData = async (oid) => {
    const data = { id: oid }; 
    
    try {
      const res = await axios.post(
        `${baseUrl}/api/admin/deletehotel`,
        data, 
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (res.status === 200) {
        alert('Delete success');
     
        setData((prevData) => prevData.filter(item => item.PostID !== oid));
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete');
    }
  };
  
  
  

  useEffect(() => {
    getHotelData();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with total count */}
      <View style={styles.countBox}>
        <Text style={styles.countText}>Total Hotels: {data.length}</Text>
      </View>

      {/* Table header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>HotelID</Text>
        <Text style={styles.headerText}>UserID</Text>
        <Text style={styles.headerText}>PhoneNumber</Text>
        <Text style={styles.headerText}>HotelName</Text>
        <Text style={styles.headerText}>Address</Text>
        <Text style={styles.headerText}>Price</Text>
        <Text style={styles.headerText}>City</Text>
        <Text style={styles.headerText}>Country</Text>
      </View>

      {/* Hotel list */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.PostID.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.PostID}</Text>
            <Text style={styles.listItemText}>{item.PosterID}</Text>
            <Text style={styles.listItemText}>{item.PhoneNumber}</Text>
            <Text style={styles.listItemText}>{item.HotelName}</Text>
            <Text style={styles.listItemText}>{item.Address}</Text>
            <Text style={styles.listItemText}>{item.price}</Text>
            <Text style={styles.listItemText}>{item.city}</Text>
            <Text style={styles.listItemText}>{item.country}</Text>
            <Text style={styles.listItemText}>
              {item.tkdetails && item.tkdetails.Username ? item.tkdetails.Username : 'No Username'}
            </Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteData(item.PostID)}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  countBox: {
    backgroundColor: '',
    padding: 10,
    width:'100%',
    height:300,
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth:2,
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default HotelList;
