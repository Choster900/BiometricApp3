import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { EnvConfig } from '../types/env';

// Obtener configuración del entorno
const envConfig = Constants.expoConfig?.extra as EnvConfig;

// Constantes de configuración
const STAGE = envConfig?.ENVIRONMENT || 'development';
let API_URL = envConfig?.API_URL || 'localhost:3001/api';

// Para desarrollo: Android necesita 10.0.2.2 en lugar de localhost
if (STAGE === 'development' && API_URL.includes('localhost')) {
    API_URL = Platform.OS === 'android' 
        ? API_URL.replace('localhost', '10.0.2.2')
        : API_URL;
}

const API_URL_IOS = `http://${API_URL}`;
const API_URL_ANDROID = `http://${API_URL}`;
const PUBLIC_KEY = envConfig?.API_KEY || '';

// Auth Store básico (puedes reemplazar con tu store de estado)
const authStore = {
    markSessionExpired: () => {
        console.log('🔐 Sesión marcada como expirada');
        // Aquí puedes actualizar tu estado global
    }
};

// Función para manejar 401 no autorizado
const handleUnauthorized = async () => {
    try {
        //await AsyncStorage.removeItem('token');
        console.log('🧹 Token eliminado por sesión expirada');
        // Aquí puedes mostrar un modal o redirigir al login
    } catch (error) {
        console.error('Error limpiando token:', error);
    }
};

/**
 * Función para obtener la URL base según el entorno y plataforma
 */
const getBaseUrl = (): string => {
    if (STAGE === "production") {
        return API_URL;
    }

    return Platform.OS === "ios" ? API_URL_IOS : API_URL_ANDROID;
};

export const DITO_API_BASE_URL = getBaseUrl();

// Debug: Verificar URL generada
console.log('🌐 API Base URL:', DITO_API_BASE_URL);
console.log('📱 Platform:', Platform.OS);
console.log('🏷️ Environment:', STAGE);

/**
 * Instancia de Axios configurada para la API de Dito
 */
const ditoApi = axios.create({
    baseURL: DITO_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para requests - agregar token automáticamente
ditoApi.interceptors.request.use(
    async (config: any) => {
        const token = await AsyncStorage.getItem('token');

        if (token) {
            config.headers!['Authorization'] = `Bearer ${token}`;
        }

        config.headers!['x-public-key'] = PUBLIC_KEY;

        return config;
    },
    (error: any) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Interceptor para responses - manejar errores y 401s
ditoApi.interceptors.response.use(
    (response: any) => {
        return response;
    },
    async (error: any) => {
        // ✅ Manejar error 401 - marcar sesión expirada y mostrar opciones
        if (error.response?.status === 401) {

            // ✅ Marcar sesión como expirada SIN redirigir automáticamente
            if (authStore && authStore.markSessionExpired) {
                authStore.markSessionExpired();
            }

            await handleUnauthorized();

            // Log del error 401 para debugging
            console.log('Error 401 details:', {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || 'Unauthorized',
                data: error.response?.data
            });
        }
        // Manejar otros errores silenciosamente (400, 403)
        else if (error.response?.status === 400 || error.response?.status === 403) {
            console.log('Error (silent):', {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || 'No message',
                data: error.response?.data
            });
        }
        // Errores de servidor (500s) y otros
        else {
            console.error('❌ Response Error:', {
                status: error.response?.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || error.message,
                data: error.response?.data,
                fullError: error
            });
        }
        return Promise.reject(error);
    }
);

export { ditoApi };
