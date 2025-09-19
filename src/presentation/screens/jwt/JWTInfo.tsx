import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useJWTValidator } from '../../hooks/useJWTValidator';

const JWTInfo = () => {
  const { token, user, status } = useAuthStore();
  const { validateCurrentToken, isTokenExpired } = useJWTValidator();

  // Función para decodificar JWT para mostrar información
  const decodeJWT = (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = parts[1];
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      return JSON.parse(atob(paddedPayload));
    } catch (error) {
      return null;
    }
  };

  const tokenInfo = token ? decodeJWT(token) : null;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>JWT Information</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado de Autenticación:</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usuario:</Text>
        <Text style={styles.info}>{user?.fullName || 'No disponible'}</Text>
        <Text style={styles.info}>{user?.email || 'No disponible'}</Text>
      </View>

      {tokenInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token Info:</Text>
          <Text style={styles.info}>ID: {tokenInfo.id}</Text>
          <Text style={styles.info}>Emitido: {new Date(tokenInfo.iat * 1000).toLocaleString()}</Text>
          <Text style={styles.info}>Expira: {new Date(tokenInfo.exp * 1000).toLocaleString()}</Text>
          <Text style={[styles.info, { color: isTokenExpired(token!) ? '#ff4444' : '#00aa00' }]}>
            Estado: {isTokenExpired(token!) ? '🔴 Expirado' : '🟢 Válido'}
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={validateCurrentToken}>
        <Text style={styles.buttonText}>🔄 Validar Token Manualmente</Text>
      </TouchableOpacity>

      {token && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token (primeros 100 chars):</Text>
          <Text style={styles.tokenText}>{token.substring(0, 100)}...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  status: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenText: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
  },
});

export default JWTInfo;