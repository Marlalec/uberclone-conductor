import { Image, StyleSheet, Text, View } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/home/HomeScreen';
import HistoryScreen from '../screens/history/HistoryScreen';
import EarningsScreen from '../screens/earnings/EarningsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { useDriver } from '../context/DriverContext';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';
import { headerOptions } from './screenOptions';

const Drawer = createDrawerNavigator();

const SCREENS = [
  { name: 'Home', component: HomeScreen, title: 'nav.home' },
  { name: 'History', component: HistoryScreen, title: 'nav.history' },
  { name: 'Earnings', component: EarningsScreen, title: 'nav.earnings' },
  { name: 'Profile', component: ProfileScreen, title: 'nav.profile' },
];

function DrawerContent(props) {
  const { driver } = useDriver();

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        {driver?.profilePhotoUrl ? (
          <Image source={{ uri: driver.profilePhotoUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar} />
        )}
        <Text style={styles.name}>{driver?.fullName}</Text>
        <Text style={styles.plate}>{driver?.vehicle?.plate}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const { t } = useLanguage();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        ...headerOptions,
        drawerActiveTintColor: colors.ink,
        drawerActiveBackgroundColor: colors.inkSoft,
        drawerInactiveTintColor: colors.textMuted,
        drawerLabelStyle: styles.label,
      }}
    >
      {SCREENS.map((screen) => (
        <Drawer.Screen
          key={screen.name}
          name={screen.name}
          component={screen.component}
          options={{ title: t(screen.title) }}
        />
      ))}
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  header: {
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 16,
    gap: 4,
    borderRadius: 20,
    backgroundColor: colors.ink,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.amber,
    backgroundColor: colors.inkSoft,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.surface,
  },
  plate: {
    fontSize: 14,
    color: colors.onInkMuted,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
