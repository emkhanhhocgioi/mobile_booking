import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';

const baseUrl = "http://localhost:5000"; // Update with your actual base URL

const OrderList = () => {
  const [data, setData] = useState([]);

  // Function to fetch order data
  const getOrderData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/admin/getorder`);
      if (response) {
        console.log(response.data);
        setData(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Function to delete an order
  const deleteData = async (oid) => {
    try {
      const res = await axios.post(
        `${baseUrl}/api/admin/deleteorder`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            id: oid,
          },
        }
      );
      if (res) {
        Alert.alert('Delete success');
        setData(prevData => prevData.filter(item => item.id !== oid));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to delete');
    }
  };

  // Function to count orders by orderStatus
  const countOrders = () => {
    return data.reduce((acc, order) => {
      acc[order.orderStatus] = acc[order.orderStatus] ? acc[order.orderStatus] + 1 : 1;
      return acc;
    }, {});
  };

  // Fetch order data when component mounts
  useEffect(() => {
    getOrderData();
  }, []);

  const orderCounts = countOrders();

  return (
    <View style={styles.container}>
      <View style={styles.countBox}>
        <Text style={styles.countText}>Total Orders: {data.length}</Text>
        {Object.keys(orderCounts).map((status) => (
          <Text key={status} style={styles.countText}>
            {status}: {orderCounts[status]}
          </Text>
        ))}
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.headerText}>CustomerID</Text>
        <Text style={styles.headerText}>HotelID</Text>
        <Text style={styles.headerText}>Checkindate</Text>
        <Text style={styles.headerText}>Checkoutdate</Text>
        <Text style={styles.headerText}>OrderDay</Text>
        <Text style={styles.headerText}>orderStatus</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()} // Ensure id is unique
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.Customerid}</Text>
            <Text style={styles.listItemText}>{item.Hotelid}</Text>
            <Text style={styles.listItemText}>{item.Checkindate}</Text>
            <Text style={styles.listItemText}>{item.Checkoutdate}</Text>
            <Text style={styles.listItemText}>{item.orderDay}</Text>
            <Text style={styles.listItemText}>{item.orderStatus}</Text>
            
            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteData(item.id)}>
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
    borderRadius: 5,
    marginBottom: 15,
    width: '100%',
    height: 500,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth:2,
  },
  countText: {
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default OrderList;
