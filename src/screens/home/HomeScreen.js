import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function HomeScreen({ navigation, route }) {
  const registered = route.params?.registered;

  return (
    <PlaceholderScreen
      title="Inicio"
      subtitle={registered ? 'Registro enviado. Tu cuenta está Pendiente de aprobación.' : undefined}
      actions={[{ label: 'Simular solicitud', onPress: () => navigation.navigate('Trip') }]}
    />
  );
}
