
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet } from 'react-native';


import Inputs from './(tabs)/inputs';
import LIST from './(tabs)/LIST';
import StartPage from './StarterPage';



import Homscreen from './(tabs)/home';

import Dashboard from './admin/AdminDashboard';
import ForgotPasswordScreen from './auth/ForgotPassword';
import LoginScreen from './auth/LoginSceen';
import SignUpScreenCustomer from './auth/SignUpScreen';
import SignUpScreenPartner from './auth/SignupScreenP';
import DestinationScreen from './blog/DestinationScreen';
import HotelDetailScreen from './hotelDetail';
import UpdateProfileScreen from './updateProfile';
const Stack = createNativeStackNavigator();


const App = () => {
  return (
    <SafeAreaView style={styles.container}>
        <Stack.Navigator initialRouteName="startPage">
        <Stack.Screen name="startPage" component={StartPage}  options={{ headerShown: false}} />
          <Stack.Screen name="list" component={LIST} options={{ headerShown: false}}  />
          <Stack.Screen name="ip" component={Inputs} options={{ headerShown: false}} />
        
          <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false}} />
          <Stack.Screen name="signup" component={SignUpScreenCustomer} options={{ headerShown: false}} />
          <Stack.Screen name="forgotpassword" component={ForgotPasswordScreen} options={{ headerShown: false}}/>
          <Stack.Screen name="home" component={Homscreen} options={{ headerShown: false}} />
          <Stack.Screen name="signupP" component={SignUpScreenPartner} options={{ headerShown: false}}/>
          <Stack.Screen name="hoteldetail" component={HotelDetailScreen} options={{ headerShown: false}}/>
          <Stack.Screen name="update_profile" component={UpdateProfileScreen} options={{ headerShown: false}}/>
          <Stack.Screen name="admin" component={Dashboard} options={{ headerShown: false}}/>
          <Stack.Screen name="Destination" component={DestinationScreen} options={{ headerShown: false}}/>
        </Stack.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
