import { useEffect, useState } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export interface BiometricCapabilities {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  biometricType: 'fingerprint' | 'faceId' | 'iris' | 'unknown' | null;
}

export const useBiometricAuth = () => {
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
    hasHardware: false,
    isEnrolled: false,
    supportedTypes: [],
    biometricType: null,
  });
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBiometricCapabilities();
  }, []);

  const checkBiometricCapabilities = async () => {
    try {
      setIsLoading(true);
      
      // Verificar si el dispositivo tiene hardware biométrico
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      
      // Verificar si hay biometría configurada
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      // Obtener tipos de autenticación soportados
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      // Determinar el tipo de biometría principal
      let biometricType: 'fingerprint' | 'faceId' | 'iris' | 'unknown' | null = null;
      
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        biometricType = 'faceId';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        biometricType = 'fingerprint';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        biometricType = 'iris';
      } else if (supportedTypes.length > 0) {
        biometricType = 'unknown';
      }

      setCapabilities({
        isAvailable: hasHardware && isEnrolled,
        hasHardware,
        isEnrolled,
        supportedTypes,
        biometricType,
      });
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      setCapabilities({
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
        biometricType: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const authenticateAsync = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!capabilities.isAvailable) {
        return {
          success: false,
          error: 'Autenticación biométrica no disponible',
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Autenticar con biometría',
        cancelLabel: 'Cancelar',
        fallbackLabel: 'Usar PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return { success: true };
      } else {
        let errorMessage = 'Autenticación fallida';
        
        if (result.error === 'user_cancel') {
          errorMessage = 'Autenticación cancelada por el usuario';
        } else if (result.error === 'system_cancel') {
          errorMessage = 'Autenticación cancelada por el sistema';
        } else if (result.error === 'not_available') {
          errorMessage = 'Autenticación biométrica no disponible';
        } else if (result.error === 'not_enrolled') {
          errorMessage = 'No hay biometría configurada en el dispositivo';
        } else if (result.error === 'lockout') {
          errorMessage = 'Demasiados intentos fallidos';
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'Error durante la autenticación biométrica',
      };
    }
  };

  const getBiometricTypeText = (): string => {
    switch (capabilities.biometricType) {
      case 'fingerprint':
        return 'Huella dactilar';
      case 'faceId':
        return 'Face ID';
      case 'iris':
        return 'Iris';
      case 'unknown':
        return 'Biometría';
      default:
        return 'Autenticación';
    }
  };

  const getBiometricIcon = (): string => {
    switch (capabilities.biometricType) {
      case 'fingerprint':
        return '👆';
      case 'faceId':
        return '👤';
      case 'iris':
        return '👁️';
      default:
        return '🔐';
    }
  };

  return {
    capabilities,
    isLoading,
    authenticateAsync,
    getBiometricTypeText,
    getBiometricIcon,
    recheckCapabilities: checkBiometricCapabilities,
  };
};