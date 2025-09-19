import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth/useAuthStore';

interface SessionExtensionModalProps {
  visible: boolean;
  onClose: () => void;
  onExtend: () => Promise<boolean>;
  onLogout: () => void;
}

export const SessionExtensionModal: React.FC<SessionExtensionModalProps> = ({
  visible,
  onClose,
  onExtend,
  onLogout,
}) => {
  const [isExtending, setIsExtending] = useState(false);

  const handleExtend = async () => {
    setIsExtending(true);
    try {
      const success = await onExtend();
      if (success) {
        onClose();
        Alert.alert('✅ Éxito', 'Tu sesión ha sido extendida exitosamente');
      } else {
        Alert.alert(
          '❌ Error', 
          'No se pudo extender la sesión. Se cerrará automáticamente.',
          [{ text: 'Aceptar', onPress: onLogout }]
        );
      }
    } catch (error) {
      console.error('Error extending session:', error);
      Alert.alert(
        '❌ Error', 
        'Ocurrió un error al extender la sesión.',
        [{ text: 'Aceptar', onPress: onLogout }]
      );
    } finally {
      setIsExtending(false);
    }
  };

  const handleLogout = () => {
    onClose();
    onLogout();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={64} color="#FF6B35" />
          </View>
          
          <Text style={styles.title}>🔐 Sesión Expirada</Text>
          
          <Text style={styles.message}>
            Tu sesión ha expirado. ¿Deseas extender tu sesión para continuar trabajando?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.logoutButton]} 
              onPress={handleLogout}
              disabled={isExtending}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.extendButton]} 
              onPress={handleExtend}
              disabled={isExtending}
            >
              {isExtending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="refresh-outline" size={20} color="#fff" />
              )}
              <Text style={styles.extendButtonText}>
                {isExtending ? 'Extendiendo...' : 'Extender Sesión'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footnote}>
            Si no seleccionas una opción, tu sesión se cerrará automáticamente por seguridad.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFF5F0',
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButton: {
    backgroundColor: '#FF4444',
  },
  extendButton: {
    backgroundColor: '#007AFF',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  extendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footnote: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default SessionExtensionModal;