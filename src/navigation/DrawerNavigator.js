import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/home/HomeScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import EarningsScreen from '../screens/earnings/EarningsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Inicio' }} />
      <Drawer.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
      <Drawer.Screen name="Earnings" component={EarningsScreen} options={{ title: 'Ganancias' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil y configuración' }} />
    </Drawer.Navigator>
  );
}
