import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import PersonalDataScreen from '../screens/register/PersonalDataScreen';
import VehicleScreen from '../screens/register/VehicleScreen';
import DocumentsScreen from '../screens/register/DocumentsScreen';
import { useLanguage } from '../context/LanguageContext';
import { colors } from '../theme';
import { headerOptions } from './screenOptions';

const Tab = createBottomTabNavigator();

const STEPS = [
  { name: 'PersonalData', component: PersonalDataScreen, title: 'nav.personalData' },
  { name: 'Vehicle', component: VehicleScreen, title: 'nav.vehicle' },
  { name: 'Documents', component: DocumentsScreen, title: 'nav.documents' },
];

function StepBadge({ step, focused }) {
  return (
    <View style={[styles.badge, focused && styles.badgeFocused]}>
      <Text style={[styles.badgeText, focused && styles.badgeTextFocused]}>{step}</Text>
    </View>
  );
}

export default function RegisterTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        ...headerOptions,
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
      }}
    >
      {STEPS.map((step, index) => (
        <Tab.Screen
          key={step.name}
          name={step.name}
          component={step.component}
          options={{
            title: t(step.title),
            tabBarIcon: ({ focused }) => <StepBadge step={index + 1} focused={focused} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  badgeFocused: {
    borderColor: colors.amber,
    backgroundColor: colors.amber,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
  },
  badgeTextFocused: {
    color: colors.ink,
  },
});
