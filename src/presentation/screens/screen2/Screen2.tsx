import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';

const Screen2 = () => {
  const { user, toggleBiometrics, isBiometricEnabledInBackend } = useAuthStore();
  const { capabilities, authenticateAsync, getBiometricTypeText } = useBiometricAuth();
  const [isTogglingBiometric, setIsTogglingBiometric] = useState(false);

  const handleToggleBiometrics = async (enabled: boolean) => {
    // 🔐 Primero solicitar autenticación biométrica para verificar identidad
    if (capabilities.isAvailable) {
      try {
        const biometricResult = await authenticateAsync();

        if (!biometricResult.success) {
          Alert.alert(
            'Autenticación requerida',
            `Necesitas autenticarte con ${getBiometricTypeText().toLowerCase()} para cambiar esta configuración.`,
            [
              {
                text: 'OK',
                style: 'default'
              }
            ]
          );
          return; // No continuar si la autenticación biométrica falló
        }
      } catch (error) {
        console.error('Error during biometric authentication:', error);
        Alert.alert(
          'Error de autenticación',
          'No se pudo verificar tu identidad. Inténtalo de nuevo.'
        );
        return;
      }
    } else {
      // Si no hay biometría disponible, mostrar un alert de confirmación adicional
      const shouldContinue = await new Promise<boolean>((resolve) => {
        Alert.alert(
          'Confirmación requerida',
          '¿Estás seguro de que quieres cambiar la configuración de seguridad?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => resolve(false)
            },
            {
              text: 'Continuar',
              style: 'default',
              onPress: () => resolve(true)
            }
          ]
        );
      });

      if (!shouldContinue) {
        return;
      }
    }

    // 🔄 Proceder con el cambio de configuración
    setIsTogglingBiometric(true);

    try {
      const success = await toggleBiometrics(enabled);

      if (success) {
        Alert.alert(
          'Éxito',
          enabled
            ? 'Autenticación biométrica activada correctamente'
            : 'Autenticación biométrica desactivada correctamente'
        );
      } else {
        Alert.alert(
          'Error',
          'No se pudo cambiar la configuración de biometría. Inténtalo de nuevo.'
        );
      }
    } catch (error) {
      console.error('Error toggling biometrics:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al cambiar la configuración de biometría'
      );
    } finally {
      setIsTogglingBiometric(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Ionicons name="settings" size={60} color="#007AFF" />
        <Text style={styles.title}>Configuraciones</Text>
        <Text style={styles.subtitle}>Ajusta la configuración de tu cuenta</Text>
      </View>

      {/* Información del Usuario */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-circle" size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>Información de Usuario</Text>
        </View>

        {user?.fullName && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{user.fullName}</Text>
          </View>
        )}

        {user?.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        )}
      </View>

      {/* Configuración de Seguridad */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>Configuración de Seguridad</Text>
        </View>

        <View style={styles.switchContainer}>
          <View style={styles.switchTextContainer}>
            <Text style={styles.switchTitle}>Autenticación Biométrica</Text>
            <Text style={styles.switchSubtitle}>
              {isBiometricEnabledInBackend
                ? `Puedes usar ${getBiometricTypeText()} para iniciar sesión`
                : 'Usa tu contraseña para iniciar sesión'
              }
            </Text>
          </View>

          <Switch
            value={isBiometricEnabledInBackend || false}
            onValueChange={handleToggleBiometrics}
            disabled={isTogglingBiometric}
            trackColor={{ false: '#ddd', true: '#34C759' }}
            thumbColor={isBiometricEnabledInBackend ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#ddd"
          />
        </View>

        {isTogglingBiometric && (
          <Text style={styles.loadingText}>Actualizando configuración...</Text>
        )}

        {/* Información sobre la disponibilidad biométrica */}
        <View style={styles.biometricInfo}>
          <View style={styles.biometricInfoRow}>
            <Ionicons
              name={capabilities.isAvailable ? "checkmark-circle" : "close-circle"}
              size={16}
              color={capabilities.isAvailable ? "#34C759" : "#FF3B30"}
            />
            <Text style={[styles.biometricInfoText, { color: capabilities.isAvailable ? "#34C759" : "#FF3B30" }]}>
              {capabilities.isAvailable
                ? `${getBiometricTypeText()} disponible`
                : 'Biometría no disponible'
              }
            </Text>
          </View>
        </View>
      </View>

      {/* Configuraciones Adicionales */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="options" size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>Preferencias</Text>
        </View>

        <TouchableOpacity style={styles.preferenceItem}>
          <View style={styles.preferenceItemLeft}>
            <Ionicons name="notifications" size={20} color="#666" />
            <Text style={styles.preferenceText}>Notificaciones</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.preferenceItem}>
          <View style={styles.preferenceItemLeft}>
            <Ionicons name="moon" size={20} color="#666" />
            <Text style={styles.preferenceText}>Tema oscuro</Text>
          </View>
          <Switch
            value={false}
            trackColor={{ false: '#ddd', true: '#34C759' }}
            thumbColor="#fff"
            ios_backgroundColor="#ddd"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.preferenceItem}>
          <View style={styles.preferenceItemLeft}>
            <Ionicons name="language" size={20} color="#666" />
            <Text style={styles.preferenceText}>Idioma</Text>
          </View>
          <View style={styles.preferenceItemRight}>
            <Text style={styles.preferenceValue}>Español</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Información de la aplicación */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <Text style={styles.cardTitle}>Información</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Versión de la app:</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  biometricInfo: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  biometricInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricInfoText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  preferenceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  preferenceValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
});

export default Screen2;
