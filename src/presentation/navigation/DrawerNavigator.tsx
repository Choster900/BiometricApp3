import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Alert } from 'react-native';
import { BottomTabsNavigator } from './BottomTabsNavigator';
import AboutUsScreen from '../screens/about/AboutUsScreen';
import { Dimensions } from 'react-native';
import { useAuthStore } from '../store/auth/useAuthStore';
import { RootStackParamList } from './StackNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

export type DrawerParamList = {
    MainTabs: undefined;
    AboutUs: undefined;
};

type DrawerNavigationProp = StackNavigationProp<
    RootStackParamList,
    'MainTabs'
>;

const Drawer = createDrawerNavigator<DrawerParamList>();

// Componente personalizado para el contenido del drawer
const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
    const { logout, user } = useAuthStore();

    // Cast navigation para acceder a los métodos del stack navigator
    const navigation = props.navigation as any;

    const handleLogout = () => {
        Alert.alert(
            'Cerrar sesión',
            '¿Estás seguro de que quieres cerrar sesión?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Cerrar sesión',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            // Cerrar el drawer primero
                            props.navigation.closeDrawer();
                            // Navegar al login usando el navigation del stack padre
                            navigation.getParent()?.navigate('LoginScreen');
                        } catch (error) {
                            console.error('Error durante logout:', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.drawerContainer}>
            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
                {/* Elementos normales del drawer */}
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {/* Botón de logout en la parte inferior */}
            <View style={styles.logoutContainer}>
                <DrawerItem
                    label="Cerrar sesión"
                    onPress={handleLogout}
                    icon={({ color, size }) => (
                        <Ionicons name="log-out-outline" size={size} color="#FF3B30" />
                    )}
                    labelStyle={styles.logoutLabel}
                    style={styles.logoutItem}
                />
            </View>
        </View>
    );
};

export const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#007AFF',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                drawerActiveTintColor: '#007AFF',
                drawerInactiveTintColor: '#666',
                drawerStyle: {
                    backgroundColor: '#fff',
                    width: 280,
                },
                drawerItemStyle: {
                    marginHorizontal: 10,
                    borderRadius: 8,
                },
                drawerLabelStyle: {
                    fontSize: 16,
                    fontWeight: '500',
                },
                swipeEdgeWidth: Dimensions.get('window').width / 2,
            }}
        >
            <Drawer.Screen
                name="MainTabs"
                component={BottomTabsNavigator}
                options={{
                    drawerLabel: 'Inicio',
                    title: 'BiometricApp',
                    drawerIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? 'home' : 'home-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
            <Drawer.Screen
                name="AboutUs"
                component={AboutUsScreen}
                options={{
                    drawerLabel: 'Acerca de nosotros',
                    title: 'Acerca de nosotros',
                    drawerIcon: ({ focused, color }) => (
                        <Ionicons
                            name={focused ? 'information-circle' : 'information-circle-outline'}
                            size={24}
                            color={color}
                        />
                    ),
                }}
            />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
    },
    drawerContent: {
        flexGrow: 1,
    },
    logoutContainer: {
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
        paddingTop: 10,
        paddingBottom: 20,
    },
    logoutItem: {
        marginHorizontal: 10,
        borderRadius: 8,
    },
    logoutLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FF3B30',
    },
});
