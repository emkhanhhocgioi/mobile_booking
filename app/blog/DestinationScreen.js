import axios from 'axios';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}
const DestinationScreen = () => {
    const [data, setData] = useState([]);

    
    const getDestinationData = async () => {
        try {
          const response = await axios.get(`${baseUrl}/api/getDestination`);
          if (response.data) {
            
            setData(response.data);
          }
        } catch (error) {
          console.error(error);
          Alert.alert('Error fetching data');
        }
      };


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.img }} style={styles.image} />
      <View style={styles.info}>
        
        <Text style={styles.city}>{item.destname}</Text>
        <Text style={styles.description}>{item.desc}</Text>
      </View>
     
    </View>
  );
  useEffect(() => {
    getDestinationData();
  }, []);


  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>DONT KNOW WHERE TO GO ON YOUR HOLIDAY</Text>
      {data && data.length > 0 ? (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()} 
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text>No destinations available</Text> 
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'column', 
    alignItems: 'flex-start',
    backgroundColor: 'wheat',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    padding: 10, 
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10, 
  },
  info: {
    flex: 1,
    justifyContent: 'flex-start', 
  },
  city: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
});

export default DestinationScreen;
