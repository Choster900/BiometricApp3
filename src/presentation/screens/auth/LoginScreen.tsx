import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { useAuthStore } from '../../store/auth/useAuthStore';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { EnvConfig } from '../../../types/env';
import Constants from 'expo-constants';


type LoginScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'LoginScreen'
>;

interface LoginScreenProps {
    navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login, loginWithBiometrics, isBiometricEnabledInBackend } = useAuthStore();
    const {
        capabilities,
        isLoading: isBiometricLoading,
        authenticateAsync,
        getBiometricTypeText,
        getBiometricIcon,
    } = useBiometricAuth();

    const handleLogin = async () => {
        // Validación básica
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Por favor ingresa email y contraseña');
            return;
        }

        setIsLoading(true);

        try {
            const success = await login(email, password);

            if (success) {
                navigation.navigate('HomeScreen');
            } else {
                Alert.alert('Error', 'Credenciales incorrectas');
            }
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Error', 'Ocurrió un error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            setIsLoading(true);
            
            // Primero verificar la biometría
            const biometricResult = await authenticateAsync();
            
            if (!biometricResult.success) {
                Alert.alert('Error', biometricResult.error || 'Autenticación biométrica fallida');
                return;
            }

            // Si la biometría es exitosa, hacer login con el device token
            const success = await loginWithBiometrics();

            if (success) {
                navigation.navigate('HomeScreen');
            } else {
                Alert.alert('Error', 'Error al iniciar sesión con biometría');
            }
        } catch (error) {
            console.error('Biometric login error:', error);
            Alert.alert('Error', 'Ocurrió un error con la autenticación biométrica');
        } finally {
            setIsLoading(false);
        }
    };

    const envConfig = Constants.expoConfig?.extra as EnvConfig;


    return (

        <View style={styles.container}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={{ textAlign: 'center', marginBottom: 10, color: '#888' }}>
                {envConfig?.API_URL || 'No BASE URL definida'}
            </Text>
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.loginButtonText}>
                        {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </Text>
                </TouchableOpacity>

                {/* Separador y botón biométrico */}
                {capabilities.isAvailable && !isBiometricLoading && isBiometricEnabledInBackend && (
                    <>
                        <View style={styles.separator}>
                            <View style={styles.separatorLine} />
                            <Text style={styles.separatorText}>o</Text>
                            <View style={styles.separatorLine} />
                        </View>

                        {/* Botón de autenticación biométrica */}
                        <TouchableOpacity
                            style={[styles.biometricButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleBiometricLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.biometricIcon}>{getBiometricIcon()}</Text>
                            <Text style={styles.biometricButtonText}>
                                {isLoading ? 'Autenticando...' : `Usar ${getBiometricTypeText()}`}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 40,
        color: '#333',
    },
    formContainer: {
        backgroundColor: 'white',
        padding: 20,
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
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16,
    },
    loginButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    loginButtonDisabled: {
        backgroundColor: '#A0A0A0',
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    separator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    separatorLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    separatorText: {
        marginHorizontal: 10,
        color: '#888',
        fontSize: 14,
    },
    biometricButton: {
        backgroundColor: '#34C759',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    biometricIcon: {
        fontSize: 20,
        marginRight: 8,
    },
    biometricButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginScreen;