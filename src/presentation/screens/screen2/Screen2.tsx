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
        if (capabilities.isAvailable) {
            try {
                const biometricResult = await authenticateAsync();

                if (!biometricResult.success) {
                    Alert.alert(
                        'Autenticación requerida',
                        `Necesitas autenticarte con ${getBiometricTypeText().toLowerCase()} para cambiar esta configuración.`,
                        [{ text: 'OK', style: 'default' }]
                    );
                    return;
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
            const shouldContinue = await new Promise<boolean>((resolve) => {
                Alert.alert(
                    'Confirmación requerida',
                    '¿Estás seguro de que quieres cambiar la configuración de seguridad?',
                    [
                        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
                        { text: 'Continuar', style: 'default', onPress: () => resolve(true) }
                    ]
                );
            });

            if (!shouldContinue) return;
        }

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
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Header */}
                <Text style={styles.title}>Configuración</Text>

                {/* Perfil */}
                <View style={styles.profileSection}>
                    <Text style={styles.userName}>{user?.fullName || 'Usuario'}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                {/* Biometría */}
                <View style={styles.settingRow}>
                    <Text style={styles.settingText}>Autenticación biométrica</Text>
                    <Switch
                        value={isBiometricEnabledInBackend || false}
                        onValueChange={handleToggleBiometrics}
                        disabled={isTogglingBiometric}
                        trackColor={{ false: '#e5e5ea', true: '#007AFF' }}
                        thumbColor="#ffffff"
                    />
                </View>

                {isTogglingBiometric && (
                    <Text style={styles.loadingText}>Actualizando...</Text>
                )}

                {/* Otras opciones */}
                <TouchableOpacity style={styles.settingRow}>
                    <Text style={styles.settingText}>Notificaciones</Text>
                    <Ionicons name="chevron-forward" size={16} color="#c7c7cc" />
                </TouchableOpacity>

                <View style={styles.settingRow}>
                    <Text style={styles.settingText}>Tema oscuro</Text>
                    <Switch
                        value={false}
                        trackColor={{ false: '#e5e5ea', true: '#007AFF' }}
                        thumbColor="#ffffff"
                    />
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#1a1a1a',
        marginBottom: 40,
    },
    profileSection: {
        marginBottom: 48,
        paddingBottom: 32,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    userName: {
        fontSize: 20,
        fontWeight: '500',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 16,
        color: '#8e8e93',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    settingText: {
        fontSize: 17,
        color: '#1a1a1a',
    },
    loadingText: {
        fontSize: 14,
        color: '#8e8e93',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
});

export default Screen2;
