import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TripRequestScreen from '../screens/trip/TripRequestScreen';
import TripInProgressScreen from '../screens/trip/TripInProgressScreen';
import TripSummaryScreen from '../screens/trip/TripSummaryScreen';

const Stack = createNativeStackNavigator();

export default function TripStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TripRequest" component={TripRequestScreen} options={{ title: 'Solicitud' }} />
      <Stack.Screen name="TripInProgress" component={TripInProgressScreen} options={{ title: 'Viaje en curso' }} />
      <Stack.Screen name="TripSummary" component={TripSummaryScreen} options={{ title: 'Cobro y resumen' }} />
    </Stack.Navigator>
  );
}
