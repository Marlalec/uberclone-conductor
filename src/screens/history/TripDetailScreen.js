import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { CATEGORIES, PAYMENT_METHODS, optionLabel, paymentStatusLabel } from '../../config/options';
import { subscribeToTrip } from '../../services/tripsService';
import { useLanguage } from '../../context/LanguageContext';
import { formatDateTime } from '../../utils/dates';
import { formatCurrency } from '../../utils/format';
import { decodePolyline, toCoordinate } from '../../utils/maps';
import { colors } from '../../theme';

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
  const { t } = useLanguage();

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{t(label)}</Text>
      <Text style={[styles.rowValue, highlighted && styles.highlighted]}>{value}</Text>
    </View>
  );
}

export default function TripDetailScreen({ navigation, route }) {
  const { tripId } = route.params;
  const { t, locale } = useLanguage();
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
        <ActivityIndicator size="large" color={colors.ink} />
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
        <Marker coordinate={toCoordinate(trip.origin)} title={t('trip.origin')} pinColor="green" />
        <Marker coordinate={toCoordinate(trip.destination)} title={t('trip.destination')} />
        {routeCoordinates.length > 0 ? (
          <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor={colors.ink} />
        ) : null}
      </MapView>
      <ScrollView contentContainerStyle={styles.details}>
        <DetailRow label="detail.dateTime" value={completedDate ? formatDateTime(completedDate, locale) : '—'} />
        <DetailRow label="trip.origin" value={trip.origin.address} />
        <DetailRow label="trip.destination" value={trip.destination.address} />
        <DetailRow label="trip.distance" value={`${trip.distanceKm.toLocaleString(locale)} km`} />
        <DetailRow label="trip.duration" value={`${trip.durationMin} min`} />
        <DetailRow label="trip.category" value={t(optionLabel(CATEGORIES, trip.category))} />
        <DetailRow
          label="detail.payment"
          value={`${t(optionLabel(PAYMENT_METHODS, trip.paymentMethod))}, ${t(paymentStatusLabel(trip.paymentStatus))}`}
        />
        <DetailRow label="detail.fare" value={formatCurrency(fare)} />
        <DetailRow label="detail.commission" value={`- ${formatCurrency(commission)}`} />
        {trip.tip > 0 ? <DetailRow label="trip.tip" value={formatCurrency(trip.tip)} /> : null}
        <DetailRow label="trip.netEarnings" value={formatCurrency(earnings)} highlighted />
        <DetailRow
          label="trip.passengerRating"
          value={trip.rating ? `${'★'.repeat(trip.rating)} (${trip.rating}/5)` : t('detail.noRating')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.textMuted,
  },
  rowValue: {
    fontSize: 16,
    color: colors.ink,
  },
  highlighted: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
});
