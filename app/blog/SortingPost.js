import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HotelDetailScreen from '../hotelDetail';
let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}
const SortingScreen = () => {
  const [sortByCountry, setSortByCountry] = useState('');
  const [sortByCity,setSortByCity] =useState('')
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [secondarySortBy, setSecondarySortBy] = useState('price'); 
  const [countries,setCountries] = useState([]);
  const [destination,setDestination] = useState([])
  const [fieldsort,setFieldSort] = useState([])
  const [modalvis,setmodalvis] = useState(false)
  const [data, setData] = useState([]);
  const [viewdata,setViewdata] = useState([])
 

    const sortingtest = () => {
      if (!sortByCity && !sortByCountry) {
        console.log('No valid sorting criteria provided');
        return;
      }
    
      let fieldsort = [];
      if (sortByCity) fieldsort.push('city');
      if (sortByCountry) fieldsort.push('country');
    
      getsortingdata(fieldsort);
    };
  
  
  const getsortingdata = async (fieldsort) => {
    let data = {};
  
    if (fieldsort.length === 0) {
      console.log('No valid sorting criteria provided');
      return;
    }
  
    if (fieldsort.length === 1 && fieldsort[0] === 'city') {
      data = {
        postSelectedValue: fieldsort,
        selectedvldata: [sortByCity],
      };
    } else if (fieldsort.length === 1 && fieldsort[0] === 'country') {
      data = {
        postSelectedValue: fieldsort,
        selectedvldata: [sortByCountry],
      };
    } else {
      data = {
        postSelectedValue: fieldsort,
        selectedvldata: [sortByCity, sortByCountry],
      };
    }
  
    try {
      const res = await axios.post(`${baseUrl}/api/getpost/sorted`, data, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };
const renderoutcomedata = () => {
  return (
    <FlatList
  data={data}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => (
    <TouchableOpacity style={styles.item} onPress={() => openhotel(item)}>
      <Image source={{ uri: `${baseUrl}`+item.imgArr[0] }} style={styles.itemImage} />
      <View style={styles.itemContent}>
        <Text style={styles.hotelName}>{item.HotelName}</Text>
        <Text style={styles.itemText}>Address: {item.Address}</Text>
        <Text style={styles.itemText}>Price: {item.price}$/night</Text>
      </View>
    </TouchableOpacity>
  )}
/>
  );
};
const openhotel = (data)=>{
setViewdata(data)
setmodalvis(true)
}


  const getDestinationData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/getDestination`);
      if (response.data) {
        console.log(response.data[0].destname)
        setDestination(response.data);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error fetching data');
    }
  };
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data) => {
      
        setCountries(data);
      })
      .catch((error) => console.error(error));
  }, []);
  useEffect(() => {
    getDestinationData();
  }, []);
  useEffect(() => {
    console.log(viewdata)
  }, [viewdata]);
  return (
    <View style={styles.container}>
     
      <View style={styles.pickerContainer}>
        <Text>Sort By:</Text>
        {countries && countries.length > 0 ? (
          <Picker
            selectedValue={sortByCountry}
            onValueChange={(value) => setSortByCountry(value)}
            style={styles.picker}
          >
            <Picker.Item label="Select a country" value="" />
            {countries.map((ctry, index) => (
              <Picker.Item key={index} label={ctry.name.common} value={ctry.name.common} />
            ))}
          </Picker>
        ) : (
          <Text>No cities available</Text>
        )}
        {destination && destination.length > 0 ? (
           <Picker
           selectedValue={sortByCity}
           onValueChange={(value) => setSortByCity(value)}
           style={styles.picker}
         >
            <Picker.Item label="Select a city" value="" />
            {destination.map((city, index) => (
              <Picker.Item key={index} label={city.destname} 
              value={city.destname} />
            ))}
          </Picker>
        ) : (
          <Text>No cities available</Text>
        )}
      
          
           
      </View>

  
      <TouchableOpacity style={styles.sortButton} onPress={sortingtest}>
        <Text style={styles.buttonText}>Sort</Text>
      </TouchableOpacity>
       
      {Array.isArray(data) && data.length > 0 ? renderoutcomedata() : <Text>Select search data....</Text>}
     
      <Modal
        transparent={true}
        visible={modalvis}
        animationType="slide" 
        onRequestClose={() =>setmodalvis(false)} 
      >
    {viewdata ? (
      <HotelDetailScreen hotelData={viewdata}></HotelDetailScreen>
    ) : (
      <Text>no data</Text>
    )}
          
      </Modal>
   
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  pickerContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  picker: {
    height: 30,  
    width: '30%',  
  },
  sortButton: {
    backgroundColor: '#007bff',
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  item: {
    flexDirection: 'row', 
    padding: 10,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center', 
  },
  itemImage: {
    width: 80, 
    height: 80, 
    borderRadius: 5, 
    marginRight: 10, 
  },
  itemContent: {
    flex: 1, 
  },
  hotelName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#555',
  },

});

export default SortingScreen;
