import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function ProfileScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="Perfil y configuración"
      actions={[{ label: 'Ir al registro', onPress: () => navigation.navigate('Register') }]}
    />
  );
}
