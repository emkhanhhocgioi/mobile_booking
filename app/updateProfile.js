import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';

let baseUrl = "http://localhost:5000";
if (Platform.OS === "android") {
  baseUrl = "http://10.0.2.2:5000";
} else if (Platform.OS === "ios") {
  baseUrl = "http://172.20.10.9:5000";
}

  const UpdateProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const uname = route.params?.username; // Ensure that the username is correctly passed from the route params

  const [email, setEmail] = useState('');
  const [desc, setDesc] = useState('');
  const [imgPrf, setImgPrf] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newImgPrf, setNewImgPrf] = useState('');

  const getUser = async (uname) => {
    if (!uname) {
      console.log('Username is missing');
      return;
    }
    try {
      const response = await axios.get(`${baseUrl}/api/getUserData`, {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          username: uname,
        },
      });
      const data = response.data;

      setDesc(data.Desc || '');
      setEmail(data.Email || '');
      setImgPrf(data.imgProfile || '');

      setNewEmail(data.Email || '');
      setNewDesc(data.Desc || '');
      setNewImgPrf(data.imgProfile || '');

      console.log(data);
    } catch (error) {
      console.log('Error fetching data:', error);
    }
  };

  const updateProfile = async () => {
    if (!uname) {
      console.log('Username is missing');
      return;
    }

    try {
      const response = await axios.post(`${baseUrl}/api/updateUserData`, {
        username: uname,
        email: newEmail,
        desc: newDesc,
        imgProfile: newImgPrf,
      });
      console.log('Profile updated:', response.data);
      navigation.goBack(); // Go back to the Profile screen after updating
    } catch (error) {
      console.log('Error updating profile:', error);
    }
  };

  useEffect(() => {
    if (uname) {
      getUser(uname); 
    }
  }, [uname]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Profile</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileContainer}>
        <Image
          source={{ uri: newImgPrf || 'https://via.placeholder.com/100' }} 
          style={styles.profileImage}
        />
        <TextInput
          style={styles.profileName}
          value={uname}
          editable={false}
        />
        <TextInput
          style={styles.inputField}
          placeholder="Email"
          value={newEmail}
          onChangeText={setNewEmail}
        />
        <TextInput
          style={styles.inputField}
          placeholder="About Me"
          value={newDesc}
          onChangeText={setNewDesc}
          multiline
        />
        <TextInput
          style={styles.inputField}
          placeholder="Profile Image URL"
          value={newImgPrf}
          onChangeText={setNewImgPrf}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.updateButton} onPress={updateProfile}>
        <Text style={styles.updateButtonText}>Update Profile</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
  },
  profileContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  inputField: {
    width: '100%',
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  updateButton: {
    backgroundColor: '#4A55A2',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default UpdateProfileScreen;
