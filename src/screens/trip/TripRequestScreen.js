import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function TripRequestScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="Nueva solicitud"
      actions={[
        { label: 'Aceptar', onPress: () => navigation.navigate('TripInProgress') },
        { label: 'Rechazar', onPress: () => navigation.getParent()?.goBack() },
      ]}
    />
  );
}
