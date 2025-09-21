import React from 'react';
import {
    View,
    Text,
    StyleSheet,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../navigation/StackNavigator';
import { useAuthStore } from '../../store/auth/useAuthStore';

type HomeScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'MainTabs'
>;

interface HomeScreenProps {
    navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const { user } = useAuthStore();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.welcomeSection}>
                    <Text style={styles.greeting}>Hola</Text>
                    {user?.fullName && (
                        <Text style={styles.userName}>{user.fullName}</Text>
                    )}
                </View>

                <Text style={styles.subtitle}>Bienvenido de vuelta</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    welcomeSection: {
        marginBottom: 8,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '300',
        color: '#1a1a1a',
        letterSpacing: 0.5,
    },
    userName: {
        fontSize: 32,
        fontWeight: '600',
        color: '#1a1a1a',
        marginTop: 4,
    },
    subtitle: {
        fontSize: 16,
        color: '#8e8e93',
        fontWeight: '400',
    },
});

export default HomeScreen;
