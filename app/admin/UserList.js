import React, { useState, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import axios from 'axios';  // Make sure axios is imported

const baseUrl = "http://localhost:5000"; 

const UserList = () => {
  const [data, setData] = useState([]);

  const deleteData = async (oid) => {
    try {
      const res = await axios.post(
        `${baseUrl}/api/admin/deletehotel`, 
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

  const getUserData = async () => {
    try {
      const response = await axios.get(`${baseUrl}/api/admin/getuser`);
      if (response) {
        console.log(response.data);
        setData(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const countRoles = () => {
    return data.reduce((acc, user) => {
      acc[user.urole] = acc[user.urole] ? acc[user.urole] + 1 : 1;
      return acc;
    }, {});
  };

  useEffect(() => {
    getUserData();
  }, []);  

  const roleCounts = countRoles();

  return (
    <View style={styles.container}>
      <View style={styles.countBox}>
        <Text style={styles.countText}>Total Users: {data.length}</Text>
        {Object.keys(roleCounts).map((role) => (
          <Text key={role} style={styles.countText}>
            {role === '1' ? (
              <>Hotel Owner: {roleCounts[role]}</>
            ) : (
              <>Customer: {roleCounts[role]}</>
            )}
          </Text>
        ))}
      </View>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Username</Text>
        <Text style={styles.headerText}>Email</Text>
        <Text style={styles.headerText}>Phonenumber</Text>
        <Text style={styles.headerText}>Userrole</Text>
       
      </View>
      {/* FlatList displaying the users */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()} 
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.listItemText}>{item.Username}</Text>
            <Text style={styles.listItemText}>{item.Email}</Text>
            <Text style={styles.listItemText}>{item.PhoneNumber}</Text>
            <Text style={styles.listItemText}>{item.urole}</Text>

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
    width: "100%",
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

export default UserList;
