import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Alert, Image, Platform } from 'react-native';

var baseUrl = "http://localhost:5000"

if(Platform.OS ==="android"){
 baseUrl = "http://10.0.2.2:5000"
}

if(Platform.OS ==="ios"){
  baseUrl = "http://172.20.10.9:5000"

 }

import { useNavigation } from 'expo-router';
const LIST = ({navigation}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigater = useNavigation();
  const fetchingItem = async () => {
    try {
      const res = await axios.get(`${baseUrl}/outputs`);
      setItems(res.data);
    } catch (error) {
      setError('Failed to fetch items. Please try again.');
      Alert.alert("Error", error.message || "Failed to fetch items.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (componentID) => {
    console.log("Component ID to delete:", componentID); 
    try {
        const response = await axios.delete(`${baseUrl}/delete/${componentID}`);
        Alert.alert(`Successfully deleted component with ID: ${componentID} from the database!`); 
        
        fetchingItem();
    } catch (err) {
        console.log(err.response.data); 
        Alert.alert('Error deleting component. Please try again.'); 
    }
  };

  useEffect(() => {
    fetchingItem();
  }, []);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Danh sách linh kiện</Text> 
      <TouchableOpacity style={styles.button} onPress={fetchingItem}><Text>Refresh</Text></TouchableOpacity>
      {items.length > 0 ? (
        items.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={styles.rowContainer}>
              <View style={styles.imageContainer}>
                {item.images && item.images.length > 0 ? (
                  item.images.map((imageItem, dataIndex) => {
                    const base64Data = imageItem.data.toString('base64');
                    const imageUri = `data:${imageItem.contentType};base64,${base64Data}`;
                    console.log(item);
                    return (
                      <Image
                        key={dataIndex}
                        source={{ uri: imageUri }}
                        style={styles.image}
                        onError={() => console.error("Error loading image")}
                      />
                    );
                  })
                ) : (
                  <Text style={styles.noDataText}>No images available.</Text>
                )}
              </View>
              <View style={styles.textButtonContainer}>
                <View style={styles.textContainer}>
                  
                  <Text style={styles.itemText}>Ten: {item.componentName}</Text>
                  <Text style={styles.itemText}>Loai: {item.componentType}</Text>
                  <Text style={styles.itemText}>Gia: {item.componentPrice}</Text>
                </View>

                <View style={styles.buttonContainer}>
                <TouchableOpacity 
    style={styles.button} 
    onPress={() => navigater.navigate('update', { componentID: item.componentID })} // Corrected parameter passing
>
    <Text style={styles.buttonText}>Update</Text>
</TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={() => handleDelete(item.componentID)}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))
      ) : (
        <Text>No items found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, // Add space below the header
    textAlign: 'center', // Center the header text
  },
  item: {
    backgroundColor: '#f9c2ff',
    padding: 10,
    marginVertical: 10,
    borderRadius: 10,
  },
  rowContainer: {
    flexDirection: 'row', // Align items in a row
    alignItems: 'center', // Center vertically
  },
  imageContainer: {
    marginRight: 10, // Add space between image and text
  },
  textButtonContainer: {
    flex: 1, // Allow text and button container to grow
    flexDirection: 'row', // Align text and buttons in a row
    justifyContent: 'space-between', // Space between text and buttons
    alignItems: 'center', // Center items vertically
  },
  textContainer: {
    flex: 1, // Allow text container to grow
  },
  itemText: {
    fontSize: 18,
  },
  image: {
    width: 100,
    height: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#6200ee',
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
    width: 60,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  noDataText: {
    marginTop: 10,
    color: 'gray',
  },
  
});

export default LIST;
