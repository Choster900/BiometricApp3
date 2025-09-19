import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StackNavigator } from './presentation/navigation/StackNavigator';
import { AuthProvider } from './presentation/providers/AuthProvider';
import { SessionManagerProvider } from './presentation/providers/SessionManagerProvider';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <SessionManagerProvider>
        <AuthProvider>
          <StackNavigator />
        </AuthProvider>
      </SessionManagerProvider>
    </NavigationContainer>
  );
}
