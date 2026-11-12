import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { useDriver } from '../../context/DriverContext';
import { CATEGORIES, PAYMENT_METHODS } from '../../config/options';
import { formatCurrency } from '../../utils/format';
import {
  REJECTION_REASON,
  TRIP_STATUS,
  TRIP_UNAVAILABLE_ERROR,
  acceptTrip,
  rejectTrip,
  subscribeToTrip,
} from '../../services/tripsService';

const labelFor = (options, value) => options.find((option) => option.value === value)?.label ?? value;

const getSecondsLeft = (expiresAtMs) => Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));

function DetailRow({ label, value, highlighted }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlighted && styles.highlighted]}>{value}</Text>
    </View>
  );
}

export default function TripRequestScreen({ navigation, route }) {
  const { tripId } = route.params;
  const { driver } = useDriver();
  const [trip, setTrip] = useState(undefined);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState('');
  const respondedRef = useRef(false);

  const expiresAtMs = trip?.expiresAtMs;
  const driverLocation = driver?.location;
  const origin = trip?.origin;

  useEffect(() => subscribeToTrip(tripId, setTrip), [tripId]);

  useEffect(
    () => () => {
      if (!respondedRef.current) {
        rejectTrip(tripId, REJECTION_REASON.DECLINED).catch(() => null);
      }
    },
    [tripId]
  );

  useEffect(() => {
    if (!expiresAtMs) {
      return undefined;
    }

    const tick = () => setSecondsLeft(getSecondsLeft(expiresAtMs));
    tick();
    const interval = setInterval(tick, 1000);

    return () => clearInterval(interval);
  }, [expiresAtMs]);

  const handleReject = useCallback(
    async (reason) => {
      if (respondedRef.current) {
        return;
      }
      respondedRef.current = true;
      setResponding(true);
      await rejectTrip(tripId, reason).catch(() => null);
      navigation.goBack();
    },
    [navigation, tripId]
  );

  const handleAccept = useCallback(async () => {
    if (respondedRef.current) {
      return;
    }
    respondedRef.current = true;
    setResponding(true);
    setError('');
    try {
      await acceptTrip({ tripId, driverLocation, origin });
      navigation.replace('TripInProgress', { tripId });
    } catch (acceptError) {
      if (acceptError.message === TRIP_UNAVAILABLE_ERROR) {
        navigation.goBack();
        return;
      }
      respondedRef.current = false;
      setResponding(false);
      setError('No se pudo aceptar la solicitud, intenta de nuevo');
    }
  }, [driverLocation, navigation, origin, tripId]);

  useEffect(() => {
    if (secondsLeft === 0) {
      handleReject(REJECTION_REASON.TIMEOUT);
    }
  }, [secondsLeft, handleReject]);

  useEffect(() => {
    if (respondedRef.current) {
      return;
    }
    if (trip === null || (trip && trip.status !== TRIP_STATUS.REQUESTED)) {
      respondedRef.current = true;
      navigation.goBack();
    }
  }, [trip, navigation]);

  if (!trip) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.timer}>
        <Text style={styles.timerValue}>{secondsLeft ?? '-'}</Text>
        <Text style={styles.timerLabel}>segundos para responder</Text>
      </View>
      <View style={styles.card}>
        <DetailRow label="Origen" value={trip.origin.address} />
        <DetailRow label="Destino" value={trip.destination.address} />
        <DetailRow label="Distancia" value={`${trip.distanceKm.toLocaleString('es-CO')} km`} />
        <DetailRow label="Duración" value={`${trip.durationMin} min`} />
        <DetailRow label="Categoría" value={labelFor(CATEGORIES, trip.category)} />
        <DetailRow label="Método de pago" value={labelFor(PAYMENT_METHODS, trip.paymentMethod)} />
        <DetailRow label="Tarifa estimada" value={formatCurrency(trip.estimate.fare)} />
        <DetailRow label="Tu ganancia estimada" value={formatCurrency(trip.estimate.driverEarnings)} highlighted />
      </View>
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
      <View style={styles.actions}>
        <Pressable
          style={[buttonStyles.button, styles.action, styles.reject]}
          onPress={() => handleReject(REJECTION_REASON.DECLINED)}
          disabled={responding}
        >
          <Text style={[buttonStyles.text, styles.rejectText]}>Rechazar</Text>
        </Pressable>
        <Pressable style={[buttonStyles.button, styles.action]} onPress={handleAccept} disabled={responding}>
          {responding ? <ActivityIndicator color="#fff" /> : <Text style={buttonStyles.text}>Aceptar</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
    backgroundColor: '#fff',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    alignItems: 'center',
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '700',
  },
  timerLabel: {
    fontSize: 14,
    color: '#555',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
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
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
  },
  reject: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  rejectText: {
    color: '#000',
  },
});
