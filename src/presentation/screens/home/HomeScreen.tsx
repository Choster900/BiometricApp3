import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { useAuthStore } from '../../store/auth/useAuthStore';

 

type HomeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MainTabs'
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { logout, user, toggleBiometrics, isBiometricEnabledInBackend } = useAuthStore();
  const [isTogglingBiometric, setIsTogglingBiometric] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          onPress: async () => {
            await logout();
            navigation.navigate('LoginScreen');
          },
        },
      ]
    );
  };

  const handleToggleBiometrics = async (enabled: boolean) => {
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
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>¡Bienvenido{user?.fullName ? `, ${user.fullName}` : ''}!</Text>
        <Text style={styles.subtitle}>Has iniciado sesión correctamente</Text>
        
        {user?.email && (
          <Text style={styles.userInfo}>Email: {user.email}</Text>
        )}
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Panel Principal</Text>
          <Text style={styles.cardContent}>
            Esta es tu pantalla principal. Aquí puedes agregar el contenido
            principal de tu aplicación.
          </Text>
        </View>
        
        {/* Sección de Configuración de Biometría */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🔐 Configuración de Seguridad</Text>
          
          <View style={styles.switchContainer}>
            <View style={styles.switchTextContainer}>
              <Text style={styles.switchTitle}>Autenticación Biométrica</Text>
              <Text style={styles.switchSubtitle}>
                {isBiometricEnabledInBackend 
                  ? 'Puedes usar Face ID o huella dactilar para iniciar sesión'
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
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  userInfo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
    fontWeight: '500',
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cardContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
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
});

export default HomeScreen;