import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import { CATEGORIES, PAYMENT_METHODS, optionLabel } from '../../config/options';
import { formatCurrency } from '../../utils/format';
import {
  REJECTION_REASON,
  TRIP_STATUS,
  TRIP_EXPIRED_ERROR,
  TRIP_UNAVAILABLE_ERROR,
  acceptTrip,
  rejectTrip,
  subscribeToTrip,
} from '../../services/tripsService';
import { colors, radius } from '../../theme';

const getSecondsLeft = (expiresAtMs) => Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));

function DetailRow({ label, value, highlighted }) {
  const { t } = useLanguage();

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{t(label)}</Text>
      <Text style={[styles.rowValue, highlighted && styles.highlighted]}>{value}</Text>
    </View>
  );
}

export default function TripRequestScreen({ navigation, route }) {
  const { tripId } = route.params;
  const { driver } = useDriver();
  const { t, locale } = useLanguage();
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
      if ([TRIP_UNAVAILABLE_ERROR, TRIP_EXPIRED_ERROR].includes(acceptError.message)) {
        navigation.goBack();
        return;
      }
      respondedRef.current = false;
      setResponding(false);
      setError('request.errors.accept');
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
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.timer}>
        <View style={styles.timerRing}>
          <Text style={styles.timerValue}>{secondsLeft ?? '-'}</Text>
        </View>
        <Text style={styles.timerLabel}>{t('request.secondsLeft')}</Text>
      </View>
      <View style={styles.card}>
        <DetailRow label="trip.origin" value={trip.origin.address} />
        <DetailRow label="trip.destination" value={trip.destination.address} />
        <DetailRow label="trip.distance" value={`${trip.distanceKm.toLocaleString(locale)} km`} />
        <DetailRow label="trip.duration" value={`${trip.durationMin} min`} />
        <DetailRow label="trip.category" value={t(optionLabel(CATEGORIES, trip.category))} />
        <DetailRow label="trip.paymentMethod" value={t(optionLabel(PAYMENT_METHODS, trip.paymentMethod))} />
        <DetailRow label="request.estimatedFare" value={formatCurrency(trip.estimate.fare)} />
        <DetailRow label="request.estimatedEarnings" value={formatCurrency(trip.estimate.driverEarnings)} highlighted />
      </View>
      {error ? <Text style={fieldStyles.error}>{t(error)}</Text> : null}
      <View style={styles.actions}>
        <Pressable
          style={[buttonStyles.button, styles.action, styles.reject]}
          onPress={() => handleReject(REJECTION_REASON.DECLINED)}
          disabled={responding}
        >
          <Text style={[buttonStyles.text, styles.rejectText]}>{t('request.reject')}</Text>
        </Pressable>
        <Pressable style={[buttonStyles.button, styles.action]} onPress={handleAccept} disabled={responding}>
          {responding ? <ActivityIndicator color={colors.surface} /> : <Text style={buttonStyles.text}>{t('request.accept')}</Text>}
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
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    alignItems: 'center',
    gap: 8,
  },
  timerRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 6,
    borderColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.ink,
  },
  timerLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
    backgroundColor: colors.surface,
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
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
  },
  reject: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  rejectText: {
    color: colors.ink,
  },
});
