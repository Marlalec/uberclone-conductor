import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PersonalDataScreen from '../screens/register/PersonalDataScreen';
import VehicleScreen from '../screens/register/VehicleScreen';
import DocumentsScreen from '../screens/register/DocumentsScreen';

const Tab = createBottomTabNavigator();

export default function RegisterTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="PersonalData" component={PersonalDataScreen} options={{ title: 'Datos personales' }} />
      <Tab.Screen name="Vehicle" component={VehicleScreen} options={{ title: 'Vehículo' }} />
      <Tab.Screen name="Documents" component={DocumentsScreen} options={{ title: 'Documentos' }} />
    </Tab.Navigator>
  );
}
