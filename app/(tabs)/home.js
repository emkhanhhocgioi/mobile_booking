import { AntDesign } from '@expo/vector-icons'; // Importing AntDesign icons
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useRoute } from '@react-navigation/native';

import ScheduleScreen from '../scheduleScreen';
import MainPage from './mainpage';
import ProfileScreen from './userProfie';

import { useColorScheme } from '@/hooks/useColorScheme';
import HotelInputForm from '../Partner/postcreate';
import SubscriptionScreen from '../Partner/Subscription';
import Orderlist from './OrderList';
export default function Homscreen() {
  const route = useRoute();
  const arr = route.params.username;
  

  console.log(arr[1].urole);
 
  const colorScheme = useColorScheme();
  const Tab = createBottomTabNavigator();

  const TabsNav = () => {
    return (
      <Tab.Navigator>
        <Tab.Screen
          name="Explore"
          component={MainPage}
          initialParams={{ username: arr[1] }}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="profile"
          component={ProfileScreen}
          initialParams={{ username: arr }}
          options={{
            
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="user" size={size} color={color} />
            ),
          }}
        />
        {arr[1].urole === 2 &&(
        <Tab.Screen
          name="schedule"
          component={ScheduleScreen}
          initialParams={{ uid: arr[1].uid }}
          options={{
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="calendar" size={size} color={color} />
            ),
          }}
        />
         )}
       {arr[1].urole === 1 && (
  <>
      <Tab.Screen
        name="OrderList"
        component={Orderlist}
        initialParams={{ uid: arr[1].uid }}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Hotel Create"
        component={HotelInputForm}
        initialParams={{ uid: arr[1].uid }}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Prenium"
        component={SubscriptionScreen}
        initialParams={{ uid: arr[1].uid }}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
        }}
      />
    </>
  )}

      </Tab.Navigator>
    );
  };

  return (
      <TabsNav />
  );
}
