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
 * Función para obtener un mensaje de error amigable para el usuario
 */
export const getNetworkErrorMessage = (error: any): string => {
    if (!error.response) {
        // Errores de conexión
        if (error.code === 'ECONNABORTED') {
            return 'La conexión tardó demasiado tiempo. Verifica tu conexión a internet.';
        } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
            return 'Sin conexión a internet. Verifica tu conexión y vuelve a intentar.';
        } else if (error.code === 'ECONNREFUSED') {
            return 'No se puede conectar al servidor. El servicio no está disponible.';
        } else {
            return 'Problema de conexión. Verifica tu conexión a internet.';
        }
    }

    // Errores con respuesta del servidor
    if (error.response?.status >= 500) {
        return 'Error del servidor. Inténtalo de nuevo en unos minutos.';
    } else if (error.response?.status === 401) {
        return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    } else if (error.response?.status === 403) {
        return 'No tienes permisos para realizar esta acción.';
    } else if (error.response?.status === 404) {
        return 'El recurso solicitado no existe.';
    } else if (error.response?.status >= 400) {
        return error.response?.data?.message || 'Error en la solicitud.';
    }

    return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
};

/**
 * Función para verificar si es un error de conexión
 */
export const isNetworkError = (error: any): boolean => {
    return !error.response || 
           error.code === 'NETWORK_ERROR' || 
           error.message === 'Network Error' ||
           error.code === 'ECONNREFUSED' ||
           error.code === 'ECONNABORTED';
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
    timeout: 10000, // 10 segundos timeout
});

// Configuración para retry automático
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

/**
 * Función para hacer delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
        const originalRequest = error.config;
        
        // ✅ Retry automático para errores de conexión
        if (isNetworkError(error) && !originalRequest._retry) {
            originalRequest._retry = true;
            const retryCount = originalRequest._retryCount || 0;
            
            if (retryCount < MAX_RETRIES) {
                originalRequest._retryCount = retryCount + 1;
                console.log(`🔄 Retry attempt ${retryCount + 1}/${MAX_RETRIES} for ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);
                
                await delay(RETRY_DELAY * (retryCount + 1)); // Backoff exponencial
                return ditoApi(originalRequest);
            } else {
                console.error(`❌ Max retries (${MAX_RETRIES}) reached for ${originalRequest.url}`);
            }
        }

        // ✅ Errores de conexión/red
        if (!error.response) {
            // Sin respuesta del servidor - problemas de conexión
            if (error.code === 'ECONNABORTED') {
                console.error('⏰ Request Timeout:', {
                    message: 'La solicitud tardó demasiado tiempo',
                    url: error.config?.url,
                    method: error.config?.method?.toUpperCase(),
                    timeout: error.config?.timeout || 'No definido'
                });
            } else if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
                console.error('📡 Network Error:', {
                    message: 'Sin conexión a internet o servidor no disponible',
                    url: error.config?.url,
                    method: error.config?.method?.toUpperCase(),
                    baseURL: error.config?.baseURL
                });
            } else if (error.code === 'ECONNREFUSED') {
                console.error('🚫 Connection Refused:', {
                    message: 'El servidor rechazó la conexión',
                    url: error.config?.url,
                    method: error.config?.method?.toUpperCase(),
                    baseURL: error.config?.baseURL
                });
            } else {
                console.error('❓ Unknown Network Error:', {
                    message: error.message || 'Error de red desconocido',
                    code: error.code,
                    url: error.config?.url,
                    method: error.config?.method?.toUpperCase()
                });
            }
            return Promise.reject(error);
        }

        // ✅ Manejar error 401 - marcar sesión expirada y mostrar opciones
        if (error.response?.status === 401) {

            // ✅ Marcar sesión como expirada SIN redirigir automáticamente
            if (authStore && authStore.markSessionExpired) {
                authStore.markSessionExpired();
            }

            await handleUnauthorized();

            // Log del error 401 para debugging
            console.log('🔐 Error 401 details:', {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || 'Unauthorized',
                data: error.response?.data
            });
        }
        // Manejar otros errores silenciosamente (400, 403)
        else if (error.response?.status === 400 || error.response?.status === 403) {
            console.log('⚠️ Client Error (silent):', {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || 'No message',
                data: error.response?.data
            });
        }
        // Errores de servidor (500s)
        else if (error.response?.status >= 500) {
            console.error('🔥 Server Error:', {
                status: error.response.status,
                url: error.config?.url,
                method: error.config?.method?.toUpperCase(),
                message: error.response?.data?.message || 'Internal Server Error',
                data: error.response?.data,
                timestamp: new Date().toISOString()
            });
        }
        // Otros errores HTTP
        else {
            console.error('❌ HTTP Error:', {
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
