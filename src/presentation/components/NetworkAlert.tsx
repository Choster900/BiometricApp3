import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNetworkStore } from '../store/network/useNetworkStore';

export const NetworkAlert = () => {
    const { showAlert, alertMessage, hideAlert } = useNetworkStore();
    // Sin animaciones - alerta fija

    if (!showAlert) return null;

    return (
        <View
            style={styles.container}
        >
            <TouchableOpacity
                style={styles.alertContent}
                onPress={hideAlert}
                activeOpacity={0.9}
            >
                <View style={styles.iconContainer}>
                    <Text style={styles.iconText}>📡</Text>
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.alertText}>{alertMessage}</Text>
                    <Text style={styles.tapText}>Toca para cerrar</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        zIndex: 1000,
        elevation: 1000,
    },
    alertContent: {
        backgroundColor: '#1a1a1a',
        paddingVertical: 16,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#ff6b35',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    iconContainer: {
        marginRight: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontSize: 24,
    },
    textContainer: {
        flex: 1,
    },
    alertText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: '600',
        lineHeight: 20,
    },
    tapText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '400',
    },
});