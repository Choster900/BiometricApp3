import axios from 'axios';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { EnvConfig } from '../types/env';

// Importar navigation service y store para manejar redirects
let navigationRef: any = null;
let authStoreLet: any = null; // ✅ Referencia al store de auth

/**
 * Función para establecer la referencia de navegación
 * Debe ser llamada desde el componente principal de navegación
 */
const setNavigationRef = (ref: any) => {
    navigationRef = ref;
};

/**
 * Función para establecer la referencia del store de auth
 * Permite hacer logout desde el interceptor
 */
const setAuthStore = (store: any) => {
    authStoreLet = store;
};


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

/**
 * Función para mostrar opciones cuando la sesión expira
 * NO hace logout automático, solo presenta las opciones al usuario
 */
const handleUnauthorized = async () => {
    try {

        Alert.alert(
            'Sesión Expirada',
            'Tu sesión ha expirado. ¿Qué deseas hacer?',
            [
                {
                    text: 'Salir al Login',
                    style: 'cancel',
                    onPress: async () => {

                        // ✅ SOLO hacer logout si el usuario lo elige explícitamente
                        if (authStore && authStoreLet.logout) {
                            await authStoreLet.logout();
                        } else {
                            // Fallback: Limpiar AsyncStorage manualmente
                            await AsyncStorage.multiRemove(['token', 'userInfo']);
                        }

                        try {
                            if (navigationRef) {

                                // Método 1: Reset directo
                                navigationRef.reset({
                                    index: 0,
                                    routes: [{ name: 'LoginScreen' }],
                                });

                            } else {
                                console.log('❌ Navigation ref not available');
                            }
                        } catch (navError) {

                            try {
                                navigationRef?.navigate?.('LoginScreen');
                            } catch (fallbackError) {
                                console.error('❌ Fallback navigation failed:', fallbackError);
                            }
                        }
                    }
                },
                {
                    text: 'Extender Sesión',
                    onPress: async () => {

                        if (authStore && authStoreLet.extendSession) {

                            try {
                                const success = await authStoreLet.extendSession();

                                if (success) {
                                    Alert.alert(
                                        'Sesión Extendida',
                                        'Tu sesión ha sido extendida exitosamente. Puedes continuar usando la aplicación.',
                                        [{ text: 'OK' }]
                                    );
                                    // ✅ NO navegar - mantener en pantalla actual
                                } else {
                                    console.log('❌ Failed to extend session');
                                    Alert.alert(
                                        'Error',
                                        'No se pudo extender la sesión. Tu token de dispositivo puede haber expirado. Por favor inicia sesión nuevamente.',
                                        [
                                            {
                                                text: 'OK',
                                                onPress: async () => {
                                                    // Si falla la extensión, hacer logout y redirigir al login
                                                    if (authStore && authStoreLet.logout) {
                                                        await authStoreLet.logout();
                                                    } else {
                                                        await AsyncStorage.multiRemove(['token', 'userInfo']);
                                                    }

                                                    try {
                                                        if (navigationRef) {
                                                            navigationRef.reset({
                                                                index: 0,
                                                                routes: [{ name: 'LoginScreen' }],
                                                            });
                                                        }
                                                    } catch (navError) {
                                                        console.error('❌ Navigation error:', navError);
                                                        navigationRef?.navigate?.('LoginScreen');
                                                    }
                                                }
                                            }
                                        ]
                                    );
                                }
                            } catch (error) {
                                Alert.alert(
                                    'Error',
                                    'Ocurrió un error al extender la sesión. Por favor inicia sesión nuevamente.',
                                    [
                                        {
                                            text: 'OK',
                                            onPress: async () => {
                                                if (authStore && authStoreLet.logout) {
                                                    await authStoreLet.logout();
                                                } else {
                                                    await AsyncStorage.multiRemove(['token', 'userInfo']);
                                                }

                                                try {
                                                    if (navigationRef) {
                                                        navigationRef.reset({
                                                            index: 0,
                                                            routes: [{ name: 'LoginScreen' }],
                                                        });
                                                    }
                                                } catch (navError) {
                                                    console.error('❌ Navigation error:', navError);
                                                    navigationRef?.navigate?.('LoginScreen');
                                                }
                                            }
                                        }
                                    ]
                                );
                            }
                        } else {
                            Alert.alert(
                                'Error',
                                'No se puede extender la sesión en este momento. Por favor inicia sesión nuevamente.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: async () => {
                                            if (authStore && authStoreLet.logout) {
                                                await authStoreLet.logout();
                                            } else {
                                                await AsyncStorage.multiRemove(['token', 'userInfo']);
                                            }

                                            try {
                                                if (navigationRef) {
                                                    navigationRef.reset({
                                                        index: 0,
                                                        routes: [{ name: 'LoginScreen' }],
                                                    });
                                                }
                                            } catch (navError) {
                                                console.error('❌ Navigation error:', navError);
                                                navigationRef?.navigate?.('LoginScreen');
                                            }
                                        }
                                    }
                                ]
                            );
                        }
                    }
                }
            ],
            { cancelable: false } // ✅ Prevenir que se cierre tocando fuera
        );
    } catch (error) {
        console.error('❌ Error handling unauthorized:', error);
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
console.log('🔑 Public Key:', PUBLIC_KEY ? `${PUBLIC_KEY.substring(0, 8)}...${PUBLIC_KEY.substring(PUBLIC_KEY.length - 8)}` : 'NOT SET');
console.log('🔑 Public Key FULL LENGTH:', PUBLIC_KEY.length);
console.log('🔑 Public Key FULL (be careful in production):', PUBLIC_KEY);
console.log('⚙️ Original API_URL from config:', envConfig?.API_URL);

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

        // 🚫 NO enviar token en login requests
        if (config.url?.includes('/auth/login')) {
            console.log('🔐 LOGIN REQUEST: Not sending Authorization header');
        } else if (token) {
            config.headers!['Authorization'] = `Bearer ${token}`;
            console.log('🔍 FOUND STORED TOKEN:', token.substring(0, 20) + '...');
        } else {
            console.log('🔍 NO STORED TOKEN FOUND');
        }

        config.headers!['x-public-key'] = PUBLIC_KEY;

        // 🔍 DEBUG: Log completo del request
        console.log('🚀 Request Debug:', {
            url: `${config.baseURL}${config.url}`,
            method: config.method?.toUpperCase(),
            headers: {
                'Content-Type': config.headers['Content-Type'],
                'x-public-key': config.headers['x-public-key'],
                'Authorization': config.headers['Authorization'] ? 'Bearer [HIDDEN]' : 'Not set'
            },
            data: config.data
        });

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

export { ditoApi, setAuthStore, setNavigationRef };
