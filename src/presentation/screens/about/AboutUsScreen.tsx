import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
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
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Ionicons name="finger-print" size={60} color="#007AFF" />
                    </View>
                    <Text style={styles.title}>BiometricApp</Text>
                    <Text style={styles.subtitle}>Autenticación Biométrica Segura</Text>
                    <Text style={styles.version}>v1.0.0</Text>
                </View>

                {/* Descripción */}
                <View style={styles.section}>
                    <Text style={styles.description}>
                        Una aplicación de demostración que utiliza tecnología de autenticación
                        biométrica para proporcionar un acceso seguro y rápido. Desarrollada
                        con React Native siguiendo las mejores prácticas en seguridad móvil.
                    </Text>
                </View>
                {/* Contacto */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Contacto</Text>

                    <TouchableOpacity style={styles.contactItem} onPress={handleEmailPress}>
                        <Ionicons name="mail-outline" size={20} color="#8E8E93" />
                        <Text style={styles.contactText}>info@biometricapp.com</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.contactItem} onPress={handleWebsitePress}>
                        <Ionicons name="globe-outline" size={20} color="#8E8E93" />
                        <Text style={styles.contactText}>www.biometricapp.com</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    © 2024 BiometricApp. Todos los derechos reservados.
                </Text>
            </View>
        </ScrollView>
    );
};

const FeatureItem = ({ text }: { text: string }) => (
    <View style={styles.featureItem}>
        <View style={styles.featureDot} />
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 48,
    },
    logoContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#F2F2F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1D1D1F',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 17,
        color: '#8E8E93',
        textAlign: 'center',
        marginBottom: 12,
        fontWeight: '500',
    },
    version: {
        fontSize: 14,
        color: '#C7C7CC',
        fontWeight: '500',
    },
    section: {
        marginBottom: 40,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#1D1D1F',
        marginBottom: 20,
        letterSpacing: -0.3,
    },
    description: {
        fontSize: 17,
        color: '#3A3A3C',
        lineHeight: 24,
        fontWeight: '400',
    },
    featureList: {
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#007AFF',
        marginRight: 16,
    },
    featureText: {
        fontSize: 17,
        color: '#3A3A3C',
        fontWeight: '400',
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E5EA',
    },
    contactText: {
        fontSize: 17,
        color: '#007AFF',
        marginLeft: 16,
        fontWeight: '500',
    },
    footer: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 32,
        fontWeight: '400',
    },
});

export default AboutUsScreen;
