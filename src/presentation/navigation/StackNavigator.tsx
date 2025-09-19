
import { createStackNavigator, StackCardStyleInterpolator } from '@react-navigation/stack';
import LoginScreen from '../screens/auth/LoginScreen';
import { BottomTabsNavigator } from './BottomTabsNavigator';


export type RootStackParamList = {
    MainTabs: undefined;
    LoginScreen: undefined;
    //RegisterScreen: undefined;
    //LoadingScreen: undefined;
};

const fadeAnimation: StackCardStyleInterpolator = ({ current }) => ({
    cardStyle: {
        opacity: current.progress,
    },
});

const Stack = createStackNavigator<RootStackParamList>();

export const StackNavigator = () => {
    return (
        <Stack.Navigator
            initialRouteName="LoginScreen"
            screenOptions={{
                headerShown: false,
                //cardStyleInterpolator: fadeAnimation,
            }}>

          {/*   <Stack.Screen name="LoginScreen" component={LoadingScreen} /> */}
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="MainTabs" component={BottomTabsNavigator} />
        </Stack.Navigator>
    )
}
