import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function HistoryScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="Historial"
      actions={[{ label: 'Ver detalle', onPress: () => navigation.navigate('TripDetail') }]}
    />
  );
}
