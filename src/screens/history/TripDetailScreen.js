import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { CATEGORIES, PAYMENT_METHODS, optionLabel, paymentStatusLabel } from '../../config/options';
import { subscribeToTrip } from '../../services/tripsService';
import { formatDateTime } from '../../utils/dates';
import { formatCurrency } from '../../utils/format';
import { decodePolyline, toCoordinate } from '../../utils/maps';

const MAP_DELTA = {
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const MAP_PADDING = {
  top: 40,
  right: 40,
  bottom: 40,
  left: 40,
};

function DetailRow({ label, value, highlighted }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlighted && styles.highlighted]}>{value}</Text>
    </View>
  );
}

export default function TripDetailScreen({ navigation, route }) {
  const { tripId } = route.params;
  const [trip, setTrip] = useState(undefined);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);

  useEffect(() => subscribeToTrip(tripId, setTrip), [tripId]);

  useEffect(() => {
    if (trip === null) {
      navigation.goBack();
    }
  }, [trip, navigation]);

  const polyline = trip?.route?.polyline ?? trip?.pickupRoute?.polyline;
  const routeCoordinates = useMemo(() => (polyline ? decodePolyline(polyline) : []), [polyline]);

  useEffect(() => {
    if (mapReady && routeCoordinates.length > 0) {
      mapRef.current?.fitToCoordinates(routeCoordinates, { edgePadding: MAP_PADDING, animated: false });
    }
  }, [mapReady, routeCoordinates]);

  if (!trip) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const completedDate = trip.completedAt?.toDate?.();
  const fare = trip.fare ?? trip.estimate.fare;
  const commission = trip.commission ?? trip.estimate.commission;
  const earnings = trip.driverEarnings ?? trip.estimate.driverEarnings;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{ ...toCoordinate(trip.origin), ...MAP_DELTA }}
        onMapReady={() => setMapReady(true)}
      >
        <Marker coordinate={toCoordinate(trip.origin)} title="Origen" pinColor="green" />
        <Marker coordinate={toCoordinate(trip.destination)} title="Destino" />
        {routeCoordinates.length > 0 ? (
          <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="#000" />
        ) : null}
      </MapView>
      <ScrollView contentContainerStyle={styles.details}>
        <DetailRow label="Fecha y hora" value={completedDate ? formatDateTime(completedDate) : '—'} />
        <DetailRow label="Origen" value={trip.origin.address} />
        <DetailRow label="Destino" value={trip.destination.address} />
        <DetailRow label="Distancia" value={`${trip.distanceKm.toLocaleString('es-CO')} km`} />
        <DetailRow label="Duración" value={`${trip.durationMin} min`} />
        <DetailRow label="Categoría" value={optionLabel(CATEGORIES, trip.category)} />
        <DetailRow
          label="Pago"
          value={`${optionLabel(PAYMENT_METHODS, trip.paymentMethod)} · ${paymentStatusLabel(trip.paymentStatus)}`}
        />
        <DetailRow label="Tarifa" value={formatCurrency(fare)} />
        <DetailRow label="Comisión" value={`- ${formatCurrency(commission)}`} />
        {trip.tip > 0 ? <DetailRow label="Propina" value={formatCurrency(trip.tip)} /> : null}
        <DetailRow label="Ganancia neta" value={formatCurrency(earnings)} highlighted />
        <DetailRow
          label="Calificación del pasajero"
          value={trip.rating ? `${'★'.repeat(trip.rating)} (${trip.rating}/5)` : 'Sin calificación'}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    height: 260,
  },
  details: {
    padding: 16,
    gap: 12,
  },
  row: {
    gap: 2,
  },
  rowLabel: {
    fontSize: 13,
    color: '#555',
  },
  rowValue: {
    fontSize: 16,
    color: '#000',
  },
  highlighted: {
    fontSize: 18,
    fontWeight: '700',
  },
});
