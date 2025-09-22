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

    const { login, loginWithBiometrics, isBiometricEnabledInBackend, deviceToken, removeStorageItem } = useAuthStore();
    const {
        capabilities,
        isLoading: isBiometricLoading,
        authenticateAsync,
        getBiometricTypeText,
        getBiometricIcon,
    } = useBiometricAuth();

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Por favor ingresa email y contraseña');
            return;
        }

        setIsLoading(true);

        try {
            const success = await login(email, password);

            if (success) {
                navigation.navigate('MainTabs');
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

            const biometricResult = await authenticateAsync();

            if (!biometricResult.success) {
                Alert.alert('Error', biometricResult.error || 'Autenticación biométrica fallida');
                return;
            }

            const success = await loginWithBiometrics();

            if (success) {
                navigation.navigate('MainTabs');
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

    const handleRemoveStorage = () => {
        Alert.alert(
            'Limpiar Almacenamiento',
            '¿Estás seguro de que quieres eliminar todos los datos almacenados?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeStorageItem('deviceToken');
                            Alert.alert('Éxito', 'Almacenamiento limpiado');
                        } catch (error) {
                            console.error('Error removing storage:', error);
                            Alert.alert('Error', 'No se pudo limpiar el almacenamiento');
                        }
                    },
                },
            ]
        );
    };

    const envConfig = Constants.expoConfig?.extra as EnvConfig;

    return (
        <View style={styles.container}>
            {/* Header minimalista */}
            <View style={styles.header}>
                <Text style={styles.title}>Bienvenido</Text>
            </View>

            {/* Formulario principal */}
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Correo electrónico"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholderTextColor="#9CA3AF"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                />

                <TouchableOpacity
                    style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    <Text style={styles.primaryButtonText}>
                        {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
                    </Text>
                </TouchableOpacity>

                {/* Botón biométrico (solo si está disponible) */}
                {capabilities.isAvailable && !isBiometricLoading && isBiometricEnabledInBackend && (
                    <TouchableOpacity
                        style={[styles.button, styles.biometricButton, isLoading && styles.buttonDisabled]}
                        onPress={handleBiometricLogin}
                        disabled={isLoading}
                    >
                        <Text style={styles.biometricIcon}>{getBiometricIcon()}</Text>
                        <Text style={styles.biometricButtonText}>
                            {getBiometricTypeText()}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* Enlace de registro */}
                <View style={styles.registerLinkContainer}>
                    <Text style={styles.registerLinkText}>¿No tienes una cuenta? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('RegisterScreen')}>
                        <Text style={styles.registerLink}>Regístrate</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Footer con opciones de desarrollo (oculto en producción) */}
            {__DEV__ && (
                <View style={styles.devOptions}>
                    <TouchableOpacity
                        style={styles.devButton}
                        onPress={handleRemoveStorage}
                    >
                        <Text style={styles.devButtonText}>Limpiar Datos</Text>
                    </TouchableOpacity>

                    <Text style={styles.devInfo}>
                        {envConfig?.API_URL?.replace('https://', '').replace('http://', '') || 'Sin URL'}
                        {'\n'}
                        {deviceToken || 'Sin device token'}

                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    title: {
        fontSize: 32,
        fontWeight: '300',
        color: '#1F2937',
        letterSpacing: -0.5,
    },
    form: {
        gap: 16,
    },
    input: {
        height: 56,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#1F2937',
        backgroundColor: '#FAFAFA',
    },
    button: {
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    primaryButton: {
        backgroundColor: '#1F2937',
        marginTop: 8,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
    biometricButton: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        gap: 8,
    },
    biometricIcon: {
        fontSize: 18,
    },
    biometricButtonText: {
        color: '#4B5563',
        fontSize: 16,
        fontWeight: '500',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    registerLinkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
        marginBottom: 16,
    },
    registerLinkText: {
        fontSize: 16,
        color: '#6B7280',
    },
    registerLink: {
        fontSize: 16,
        color: '#3B82F6',
        fontWeight: '600',
    },
    devOptions: {
        position: 'absolute',
        bottom: 40,
        left: 32,
        right: 32,
        alignItems: 'center',
        gap: 8,
    },
    devButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#FEF2F2',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FECACA',
    },
    devButtonText: {
        color: '#DC2626',
        fontSize: 12,
        fontWeight: '500',
    },
    devInfo: {
        fontSize: 10,
        color: '#9CA3AF',
        fontFamily: 'monospace',
    },
});

export default LoginScreen;
