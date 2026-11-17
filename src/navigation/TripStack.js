import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TripRequestScreen from '../screens/trip/TripRequestScreen';
import TripInProgressScreen from '../screens/trip/TripInProgressScreen';
import TripSummaryScreen from '../screens/trip/TripSummaryScreen';
import { useLanguage } from '../context/LanguageContext';
import { headerOptions } from './screenOptions';

const Stack = createNativeStackNavigator();

export default function TripStack() {
  const { t } = useLanguage();

  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="TripRequest" component={TripRequestScreen} options={{ title: t('nav.request') }} />
      <Stack.Screen
        name="TripInProgress"
        component={TripInProgressScreen}
        options={{ title: t('nav.tripInProgress') }}
      />
      <Stack.Screen name="TripSummary" component={TripSummaryScreen} options={{ title: t('nav.tripSummary') }} />
    </Stack.Navigator>
  );
}
