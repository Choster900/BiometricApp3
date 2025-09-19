import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/home/HomeScreen';
import Screen2 from '../screens/screen2/Screen2';
import JWTInfo from '../screens/jwt/JWTInfo';

export type BottomTabParamList = {
  Home: undefined;
  Screen2: undefined;
  JWTInfo: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabsNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Screen2') {
            iconName = focused ? 'apps' : 'apps-outline';
          } else if (route.name === 'JWTInfo') {
            iconName = focused ? 'key' : 'key-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Inicio',
        }}
      />
      <Tab.Screen 
        name="Screen2" 
        component={Screen2} 
        options={{
          tabBarLabel: 'Pantalla 2',
        }}
      />
      <Tab.Screen 
        name="JWTInfo" 
        component={JWTInfo} 
        options={{
          tabBarLabel: 'JWT Debug',
        }}
      />
    </Tab.Navigator>
  );
};