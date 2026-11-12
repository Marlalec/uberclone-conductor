import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RegisterTabs from './RegisterTabs';
import DrawerNavigator from './DrawerNavigator';
import TripStack from './TripStack';
import TripDetailScreen from '../screens/history/TripDetailScreen';
import { useDriver } from '../context/DriverContext';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { driverId, loadingSession } = useDriver();

  if (loadingSession) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {driverId ? (
          <>
            <Stack.Screen name="Main" component={DrawerNavigator} />
            <Stack.Screen name="Trip" component={TripStack} />
            <Stack.Screen
              name="TripDetail"
              component={TripDetailScreen}
              options={{ headerShown: true, title: 'Detalle del viaje' }}
            />
          </>
        ) : (
          <Stack.Screen name="Register" component={RegisterTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
});
