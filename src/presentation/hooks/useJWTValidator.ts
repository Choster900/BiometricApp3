import { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth/useAuthStore';
import { Alert, AppState, AppStateStatus } from 'react-native';

/**
 * Hook para validar JWT automáticamente en cambios de pantalla
 */
export const useJWTValidator = () => {
    const navigation = useNavigation();
    const { status, token, refreshToken, logout, refreshSession } = useAuthStore();

    /**
     * Decodifica el JWT y extrae la información de expiración
     */
    const decodeJWT = useCallback((token: string) => {
        try {
            // Dividir el JWT en sus partes
            const parts = token.split('.');
            if (parts.length !== 3) {
                console.error('🔐 Invalid JWT format');
                return null;
            }

            // Decodificar el payload (segunda parte)
            const payload = parts[1];
            
            // Agregar padding si es necesario
            const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
            
            // Decodificar base64
            const decodedPayload = JSON.parse(atob(paddedPayload));
            
            return decodedPayload;
        } catch (error) {
            console.error('🔐 Error decoding JWT:', error);
            return null;
        }
    }, []);

    /**
     * Verifica si el token está expirado
     */
    const isTokenExpired = useCallback((token: string): boolean => {
        const decoded = decodeJWT(token);
        
        if (!decoded || !decoded.exp) {
            console.log('🔐 No expiration found in token, considering expired');
            return true;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const tokenExpTime = decoded.exp;
        
        console.log('🔐 Token validation:', {
            currentTime,
            tokenExpTime,
            timeRemaining: tokenExpTime - currentTime,
            isExpired: currentTime >= tokenExpTime
        });

        return currentTime >= tokenExpTime;
    }, [decodeJWT]);

    /**
     * Valida el JWT actual y maneja la expiración
     */
    const validateCurrentToken = useCallback(async () => {
        // Solo validar si el usuario está autenticado
        if (status !== 'authenticated' || !token) {
            return;
        }

        console.log('🔐 Validating JWT token...');

        // Verificar si el token está expirado
        if (isTokenExpired(token)) {
            console.log('🔐 Token expired, attempting refresh...');
            
            // Si hay refresh token, intentar renovar automáticamente
            if (refreshToken) {
                console.log('🔄 Attempting automatic token refresh...');
                
                const refreshSuccess = await refreshSession();
                
                if (refreshSuccess) {
                    console.log('✅ Token refreshed successfully');
                    return;
                } else {
                    console.log('❌ Token refresh failed, showing user prompt');
                    
                    // Mostrar confirmación al usuario
                    Alert.alert(
                        '🔐 Sesión Expirada',
                        'Tu sesión ha expirado. ¿Deseas renovar tu sesión para continuar?',
                        [
                            {
                                text: 'Cerrar Sesión',
                                style: 'destructive',
                                onPress: () => {
                                    console.log('🚪 User chose to logout');
                                    logout();
                                }
                            },
                            {
                                text: 'Renovar Sesión',
                                style: 'default',
                                onPress: async () => {
                                    console.log('🔄 User chose to refresh session');
                                    const success = await refreshSession();
                                    if (!success) {
                                        Alert.alert('❌ Error', 'No se pudo renovar la sesión. Cerrando sesión...');
                                        logout();
                                    }
                                }
                            }
                        ],
                        { cancelable: false }
                    );
                }
            } else {
                // No hay refresh token, logout automático
                console.log('❌ No refresh token available, automatic logout');
                Alert.alert(
                    '🔐 Sesión Expirada', 
                    'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
                    [
                        {
                            text: 'Aceptar',
                            onPress: () => logout()
                        }
                    ]
                );
            }
        } else {
            console.log('✅ Token is still valid');
        }
    }, [status, token, refreshToken, isTokenExpired, refreshSession, logout]);

    /**
     * Configurar el listener de navegación
     */
    useEffect(() => {
        // Solo configurar el listener si el usuario está autenticado
        if (status !== 'authenticated') {
            return;
        }

        // Listener que se ejecuta cada vez que cambia la pantalla
        const unsubscribeFocus = navigation.addListener('focus', () => {
            console.log('📱 Screen focused, validating JWT...');
            validateCurrentToken();
        });

        // Listener para cuando la app regresa del background
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                console.log('📱 App became active, validating JWT...');
                validateCurrentToken();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        // Cleanup al desmontar
        return () => {
            unsubscribeFocus();
            subscription?.remove();
        };
    }, [navigation, status, validateCurrentToken]);

    return {
        validateCurrentToken,
        isTokenExpired
    };
};