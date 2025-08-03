import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';  

const baseUrl = "http://localhost:5000";

const ReviewList = () => {
  const [data, setData] = useState([]);

  const deleteData = async (oid) => {
    const data = { id: oid }; 
    try {
      const res = await axios.post(
        `${baseUrl}/api/admin/deletereview`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
         
        }
      );
      if (res) {
        alert('Delete success');
        setData(prevData => prevData.filter(item => item.ReviewID !== oid));
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete');
    }
  };

  const getReviewData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/admin/getreview`);
      if (response) {
        console.log(response.data);
        setData(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const countReviews = () => {
    return data.reduce((acc, review) => {
      acc[review.orderStatus] = acc[review.orderStatus] ? acc[review.orderStatus] + 1 : 1;
      return acc;
    }, {});
  };

  useEffect(() => {
    getReviewData();
  }, []);

  const reviewCounts = countReviews();

  return (
    <View style={styles.container}>
      <View style={styles.countBox}>
        <Text style={styles.countText}>Total Reviews: {data.length}</Text>
       
      </View>

      {/* FlatList displaying the reviews */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.ReviewID.toString()} 
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.ReviewID}</Text>
            <Text style={styles.listItemText}>{item.HotelID}</Text>
            <Text style={styles.listItemText}>{item.ReviewerID}</Text>
            <Text style={styles.listItemText}>{item.reviewcontent}</Text>
            <Text style={styles.listItemText}>{item.orderDay}</Text>
            <Text style={styles.listItemText}>{item.orderStatus}</Text>

            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteData(item.ReviewID)}>
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
    height: 400,
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
});

export default ReviewList;
