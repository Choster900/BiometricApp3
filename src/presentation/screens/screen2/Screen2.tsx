import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useJWTValidator } from '../../hooks/useJWTValidator';

const Screen2 = () => {
  // Hook para validar JWT automáticamente
  useJWTValidator();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla 2</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Screen2;