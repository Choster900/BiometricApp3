import React from "react";
import { StyleSheet, View, ActivityIndicator, Text } from "react-native";

export const LoadingScreen = () => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text style={styles.text}>Cargando...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    text: {
        marginTop: 20,
        fontSize: 18,
        fontWeight: "500",
        color: "#333",
    },
});
