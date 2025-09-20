import React, { useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StackNavigator } from './presentation/navigation/StackNavigator';
import { AuthProvider } from './presentation/providers/AuthProvider';
import { useAuthStore } from './presentation/store/auth/useAuthStore';

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {

    // Crear referencia para la navegación
    const navigationRef = useRef<any>(null);

    // Referencias para controlar el debounce del check status
    const lastCheckTime = useRef<number>(0);
    const checkDebounceTimeout = useRef<number | null>(null);
    const DEBOUNCE_DELAY = 2000;


    // Función para manejar cambios de navegación
    const handleNavigationStateChange = () => {

        const currentTime = Date.now();
        const timeSinceLastCheck = currentTime - lastCheckTime.current;

        if (timeSinceLastCheck > DEBOUNCE_DELAY) {

            console.log('⏱️ Navigation change detected, checking auth status...');

            // Limpiar timeout anterior si existe
            if (checkDebounceTimeout.current) {
                clearTimeout(checkDebounceTimeout.current);
            }

            checkDebounceTimeout.current = window.setTimeout(() => {
                const authStore = useAuthStore.getState();
                if (authStore.checkStatus) {
                    authStore.checkStatus();
                    lastCheckTime.current = Date.now();
                }
                checkDebounceTimeout.current = null;
            },100)

        }

    }

    return (
        <NavigationContainer
            ref={navigationRef}
            onStateChange={handleNavigationStateChange}
        >
            <AuthProvider>
                <StackNavigator />
            </AuthProvider>
        </NavigationContainer>
    );
}
