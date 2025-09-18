import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import Constants from 'expo-constants';
import { EnvConfig } from './types/env';

export default function App() {
  // Acceder a las variables de entorno a través de expo-constants
  const envConfig = Constants.expoConfig?.extra as EnvConfig;

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>🔧 Variables de Entorno Configuradas</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📡 API Configuration</Text>
          <Text style={styles.variable}>API URL: {envConfig?.API_URL}</Text>
          <Text style={styles.variable}>API Key: {envConfig?.API_KEY?.substring(0, 8)}...</Text>
          <Text style={styles.variable}>Timeout: {envConfig?.TIMEOUT_MS}ms</Text>
          <Text style={styles.variable}>Max Retries: {envConfig?.MAX_RETRY_ATTEMPTS}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 App Information</Text>
          <Text style={styles.variable}>Version: {envConfig?.APP_VERSION}</Text>
          <Text style={styles.variable}>Environment: {envConfig?.ENVIRONMENT}</Text>
          <Text style={styles.variable}>Debug Mode: {envConfig?.DEBUG_MODE ? '✅ Enabled' : '❌ Disabled'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏪 Company Info</Text>
          <Text style={styles.variable}>Company: {envConfig?.COMPANY_NAME}</Text>
          <Text style={styles.variable}>Support: {envConfig?.SUPPORT_EMAIL}</Text>
        </View>

        <Text style={styles.footer}>
          Las variables se cargan desde el archivo .env 📁
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 50,
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 5,
  },
  variable: {
    fontSize: 14,
    marginBottom: 8,
    color: '#34495e',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
