import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import HomeScreen from '../screens/home/HomeScreen';
import Screen2 from '../screens/screen2/Screen2';

export type BottomTabParamList = {
    Home: undefined;
    Settings: undefined;
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TabBarIcon = ({ focused, iconName, size = 24 }: {
    focused: boolean;
    iconName: keyof typeof Ionicons.glyphMap;
    size?: number;
}) => {
    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: focused ? '#007AFF15' : 'transparent',
        }}>
            <Ionicons
                name={iconName}
                size={size}
                color={focused ? '#007AFF' : '#8E8E93'}
            />
        </View>
    );
};

export const BottomTabsNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    } else {
                        iconName = 'help-outline';
                    }

                    return <TabBarIcon focused={focused} iconName={iconName} size={size} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: '#8E8E93',
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 88 : 70,
                    paddingTop: 12,
                    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
                    paddingHorizontal: 20,
                    shadowColor: '#000000',
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    letterSpacing: 0.2,
                    marginTop: 4,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
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
                name="Settings"
                component={Screen2}
                options={{
                    tabBarLabel: 'Ajustes',
                }}
            />
        </Tab.Navigator>
    );
};
