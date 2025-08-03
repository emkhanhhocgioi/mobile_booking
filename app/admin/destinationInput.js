import React, { useState, useEffect } from 'react';
import { 
  FlatList, 
  View, 
  Text, 
  Alert, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Platform,Picker
} from 'react-native';
import axios from 'axios';

let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

const DestinationInput = () => {
  const [data, setData] = useState([]);
  const [destName, setDestName] = useState('');
  const [destdesc, setDestDesc] = useState('');
  const [selectedcountry,setSelectedCountry] = useState('')
  const [image, setImage] = useState(null);
  const [countries, setCountries] = useState([]);

  
  

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

  const createDest = async () => {
    if (!destName) {
      Alert.alert('Missing destination name');
      return; 
    }
    if (!destdesc) {
      Alert.alert('Missing destination description');
      return;  
    }
    if (!image) {
      Alert.alert('Missing destination image');
      return;  
    }

    const formData = new FormData();
    formData.append('DestinationName', destName);
    formData.append('DestinationDesc', destdesc);
    formData.append('destcountry',selectedcountry)
    formData.append('file', image);

    try {
      const res = await axios.post(`${baseUrl}/api/admin/createdestination`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data) {
        alert('Create new Destination success');
        getDestinationData();
      }
    } catch (error) {
      console.error('Error creating destination:', error);
      Alert.alert('Error creating destination');
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };
  const deleteData = async (oid) => {
    const data = { id: oid }; 
    
    try {
      const res = await axios.post(
        `${baseUrl}/api/admin/deleteDest`,
        data, 
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (res.status === 200) {
        alert('Delete success');
     
        setData((prevData) => prevData.filter(item => item.id !== oid));
      } else {
        alert('Failed to delete');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete');
    }
  };

  useEffect(() => {
    getDestinationData();
  }, []);
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all')
      .then((response) => response.json())
      .then((data) => {
        // console.log(data)
        setCountries(data);
      })
      .catch((error) => console.error(error));
  }, []);
  useEffect(() => {
    console.log(selectedcountry)
  }, [selectedcountry]);
  return (
    <View style={{ padding: 20 }}>
     

     
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Destination Name</Text>
        <Text style={styles.headerText}>Description</Text>
        <Text style={styles.headerText}>Actions</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()} 
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View style={styles.listItemColumn}>
              <Text style={styles.listItemText}>{item.destname}</Text>
            </View>
            
            
            <View style={styles.listItemColumn}>
              <Text style={styles.listItemText}>{item.desc}</Text>
            </View>
            <View style={styles.listItemColumn}>
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteData(item.id)}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
      {/* Form to create new destination */}
      <Text style={styles.createTitle}>Create New Destination</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Destination Name"
        value={destName}
        onChangeText={setDestName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Destination Description"
        value={destdesc}
        onChangeText={setDestDesc}
      />
      {countries && countries.length > 0 ? (
              <Picker
                selectedValue={selectedcountry}
                onValueChange={(value) => setSelectedCountry(value)}
                style={styles.picker}
              >
                {countries.map((country) => (
                  <Picker.Item 
                    label={country.name.common} 
                    key={country.cca2} 
                    value={country.code} 
                  />
                ))}
                    </Picker>
                  ) : null}
      {Platform.OS === 'web' && (
  <View style={{ marginBottom: 15 }}>
    <input
      type="file"
      onChange={handleFileSelect}
      style={styles.fileInput}
    />
  </View>
)}
      <TouchableOpacity style={styles.uploadButton} onPress={createDest}>
        <Text style={styles.uploadButtonText}>Create Destination</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  createTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  uploadButton: {
    backgroundColor: '#5bc0de',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  listItem: {
    flexDirection: 'row',  
    justifyContent: 'space-between', 
    alignItems: 'center',  
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  listItemColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemText: {
    fontSize: 16,
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
  fileInput: {
    zIndex: 1, // Đảm bảo nằm trên các thành phần khác
    position: 'relative', // Đặt vị trí cụ thể
    display: 'block', // Hiển thị rõ ràng
    marginBottom: 15, // Thêm khoảng cách giữa các thành phần
    padding: 10, // Đảm bảo kích thước dễ nhấn
    backgroundColor: '#f8f9fa', // Tùy chọn màu nền
    borderRadius: 5, // Làm mềm các góc
    borderWidth: 1, // Đường viền
    borderColor: '#ccc', // Màu viền
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

export default DestinationInput;
