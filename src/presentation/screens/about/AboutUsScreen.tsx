import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Linking,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AboutUsScreen = () => {
  const handleEmailPress = () => {
    Linking.openURL('mailto:info@biometricapp.com');
  };

  const handleWebsitePress = () => {
    Linking.openURL('https://www.biometricapp.com');
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      'Política de Privacidad',
      'Esta aplicación utiliza tecnología biométrica para proporcionar una autenticación segura. Todos los datos biométricos se almacenan de forma local en su dispositivo y nunca se comparten con terceros.'
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="finger-print" size={80} color="#007AFF" />
        </View>
        <Text style={styles.title}>BiometricApp</Text>
        <Text style={styles.subtitle}>Autenticación Biométrica Segura</Text>
        <Text style={styles.version}>Versión 1.0.0</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de la Aplicación</Text>
        <Text style={styles.description}>
          BiometricApp es una aplicación de demostración que utiliza tecnología de
          autenticación biométrica para proporcionar un acceso seguro y rápido.
          Desarrollada con React Native y Expo, esta aplicación demuestra las mejores
          prácticas en seguridad móvil.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Características</Text>
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Autenticación biométrica (huella dactilar/Face ID)</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Interfaz de usuario intuitiva</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Seguridad de datos mejorada</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.featureText}>Navegación fluida con drawer y tabs</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Desarrollado por</Text>
        <Text style={styles.developerText}>Equipo de Desarrollo BiometricApp</Text>
        <Text style={styles.description}>
          Un equipo especializado en desarrollo de aplicaciones móviles seguras
          y tecnologías de autenticación avanzadas.
        </Text>
      </View>

      <View style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Contacto</Text>

        <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
          <Ionicons name="mail" size={24} color="#007AFF" />
          <Text style={styles.contactText}>info@biometricapp.com</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handleWebsitePress}>
          <Ionicons name="globe" size={24} color="#007AFF" />
          <Text style={styles.contactText}>www.biometricapp.com</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.contactItem} onPress={handlePrivacyPress}>
          <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
          <Text style={styles.contactText}>Política de Privacidad</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 BiometricApp. Todos los derechos reservados.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  version: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    textAlign: 'justify',
  },
  featureList: {
    marginTop: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 10,
    flex: 1,
  },
  developerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 10,
  },
  contactSection: {
    marginBottom: 25,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  contactText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default AboutUsScreen;
