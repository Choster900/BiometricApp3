import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useErrorStore } from '../store/error/useErrorStore';

export const ErrorAlert = () => {
    const { isVisible, message, type, hideError } = useErrorStore();
    const slideAnim = React.useRef(new Animated.Value(-100)).current;
    const opacityAnim = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isVisible) {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: -100,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [isVisible, slideAnim, opacityAnim]);

    if (!isVisible) return null;

    const getBackgroundColor = () => {
        switch (type) {
            case 'error':
                return '#ff4444';
            case 'warning':
                return '#ff8800';
            case 'success':
                return '#44aa44';
            default:
                return '#ff4444';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'success':
                return '✅';
            default:
                return '❌';
        }
    };

    return (
        <Animated.View 
            style={[
                styles.container,
                {
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim
                }
            ]}
        >
            <TouchableOpacity 
                style={[styles.alertContent, { backgroundColor: getBackgroundColor() }]}
                onPress={hideError}
                activeOpacity={0.8}
            >
                <Text style={styles.alertText}>
                    {getIcon()} {message}
                </Text>
                <Text style={styles.tapText}>Toca para cerrar</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Debajo de la barra de estado
        left: 16,
        right: 16,
        zIndex: 1001,
        elevation: 1001,
    },
    alertContent: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    alertText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 18,
    },
    tapText: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
    },
});