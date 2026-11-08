import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterTabs from './RegisterTabs';
import DrawerNavigator from './DrawerNavigator';
import TripStack from './TripStack';
import TripDetailScreen from '../screens/history/TripDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Register" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Register" component={RegisterTabs} />
        <Stack.Screen name="Main" component={DrawerNavigator} />
        <Stack.Screen name="Trip" component={TripStack} />
        <Stack.Screen
          name="TripDetail"
          component={TripDetailScreen}
          options={{ headerShown: true, title: 'Detalle del viaje' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
