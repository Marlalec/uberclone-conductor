import PlaceholderScreen from '../../components/PlaceholderScreen';

export default function TripSummaryScreen({ navigation }) {
  return (
    <PlaceholderScreen
      title="Cobro y resumen"
      actions={[{ label: 'Volver al inicio', onPress: () => navigation.getParent()?.goBack() }]}
    />
  );
}
