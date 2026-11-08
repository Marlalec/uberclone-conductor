import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function TripInProgressScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="Viaje en curso"
      actions={[{ label: 'Finalizar viaje', onPress: () => navigation.navigate('TripSummary') }]}
    />
  );
}
