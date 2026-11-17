import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { PAYMENT_METHOD, PAYMENT_METHODS, optionLabel, paymentStatusLabel } from '../../config/options';
import { formatCurrency } from '../../utils/format';
import {
  PAYMENT_STATUS,
  TRIP_STATUS,
  markCashPayment,
  subscribeToTrip,
} from '../../services/tripsService';
import { createPaymentPreference, syncTripPayment } from '../../services/paymentsService';
import { BACKEND_URL_MISSING } from '../../services/backendClient';
import { simulatePassengerRating } from '../../services/tripSimulator';
import { useLanguage } from '../../context/LanguageContext';
import { colors, radius } from '../../theme';

const API_URL_ERROR = 'summary.errors.apiUrl';
const PREFERENCE_ERROR = 'summary.errors.preference';
const SYNC_ERROR = 'summary.errors.sync';
const CASH_ERROR = 'summary.errors.cash';
const RATING_ERROR = 'summary.errors.rating';
const SYNC_EMPTY = 'summary.syncEmpty';

function DetailRow({ label, value, highlighted }) {
  const { t } = useLanguage();

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{t(label)}</Text>
      <Text style={[styles.rowValue, highlighted && styles.highlighted]}>{value}</Text>
    </View>
  );
}

export default function TripSummaryScreen({ navigation, route }) {
  const { tripId } = route.params;
  const { t } = useLanguage();
  const [trip, setTrip] = useState(undefined);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => subscribeToTrip(tripId, setTrip), [tripId]);

  useEffect(() => {
    if (trip === null) {
      navigation.getParent()?.goBack();
    }
  }, [trip, navigation]);

  const runAction = useCallback(async (name, action, errorMessage) => {
    setWorking(name);
    setError('');
    setInfo('');
    try {
      await action();
    } catch (actionError) {
      setError(actionError.message === BACKEND_URL_MISSING ? API_URL_ERROR : errorMessage);
    } finally {
      setWorking('');
    }
  }, []);

  const handleMercadoPago = useCallback(
    () =>
      runAction(
        'preference',
        async () => {
          const { initPoint } = await createPaymentPreference(tripId, trip.fare);
          await Linking.openURL(initPoint);
          setInfo('summary.payHint');
        },
        PREFERENCE_ERROR
      ),
    [runAction, trip, tripId]
  );

  const handleSync = useCallback(
    () =>
      runAction(
        'sync',
        async () => {
          const { paymentStatus } = await syncTripPayment(tripId);
          if (!paymentStatus) {
            setInfo(SYNC_EMPTY);
          }
        },
        SYNC_ERROR
      ),
    [runAction, tripId]
  );

  const handleCash = useCallback(
    () => runAction('cash', () => markCashPayment(tripId), CASH_ERROR),
    [runAction, tripId]
  );

  const handleRating = useCallback(
    () => runAction('rating', () => simulatePassengerRating(tripId), RATING_ERROR),
    [runAction, tripId]
  );

  if (!trip) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.ink} />
      </View>
    );
  }

  const isPaid = trip.status === TRIP_STATUS.PAID;
  const statusLabel = t(paymentStatusLabel(trip.paymentStatus));
  const statusStyle = isPaid ? styles.statusPaid : trip.paymentStatus === PAYMENT_STATUS.REJECTED ? styles.statusRejected : styles.statusPending;
  const fare = trip.fare ?? trip.estimate.fare;
  const commission = trip.commission ?? trip.estimate.commission;
  const earnings = trip.driverEarnings ?? trip.estimate.driverEarnings;
  const commissionPercent = Math.round((trip.commissionRate ?? 0.2) * 100);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.status, statusStyle]}>
        <Text style={styles.statusText}>{statusLabel}</Text>
      </View>
      <View style={styles.card}>
        <DetailRow label="trip.origin" value={trip.origin.address} />
        <DetailRow label="trip.destination" value={trip.destination.address} />
        <DetailRow label="summary.finalFare" value={formatCurrency(fare)} />
        <DetailRow label={t('summary.commission', { percent: commissionPercent })} value={`- ${formatCurrency(commission)}`} />
        {trip.tip > 0 ? <DetailRow label="trip.tip" value={formatCurrency(trip.tip)} /> : null}
        <DetailRow label="summary.netEarnings" value={formatCurrency(earnings)} highlighted />
        <DetailRow label="trip.paymentMethod" value={t(optionLabel(PAYMENT_METHODS, trip.paymentMethod))} />
        <DetailRow
          label="trip.passengerRating"
          value={trip.rating ? `${'★'.repeat(trip.rating)} (${trip.rating}/5)` : t('summary.ratingPending')}
        />
      </View>
      {info ? <Text style={styles.info}>{t(info)}</Text> : null}
      {error ? <Text style={fieldStyles.error}>{t(error)}</Text> : null}
      {trip.rating == null ? (
        <Pressable
          style={[buttonStyles.button, styles.secondary, working !== '' && buttonStyles.disabled]}
          onPress={handleRating}
          disabled={working !== ''}
        >
          {working === 'rating' ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <Text style={[buttonStyles.text, styles.secondaryText]}>{t('summary.simulateRating')}</Text>
          )}
        </Pressable>
      ) : null}
      {!isPaid && trip.paymentMethod === PAYMENT_METHOD.MERCADOPAGO ? (
        <>
          <Pressable
            style={[buttonStyles.button, working !== '' && buttonStyles.disabled]}
            onPress={handleMercadoPago}
            disabled={working !== ''}
          >
            {working === 'preference' ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={buttonStyles.text}>{t('summary.chargeMercadoPago')}</Text>
            )}
          </Pressable>
          <Pressable
            style={[buttonStyles.button, styles.secondary, working !== '' && buttonStyles.disabled]}
            onPress={handleSync}
            disabled={working !== ''}
          >
            {working === 'sync' ? (
              <ActivityIndicator color={colors.ink} />
            ) : (
              <Text style={[buttonStyles.text, styles.secondaryText]}>{t('summary.verifyPayment')}</Text>
            )}
          </Pressable>
        </>
      ) : null}
      {!isPaid ? (
        <Pressable
          style={[buttonStyles.button, styles.secondary, working !== '' && buttonStyles.disabled]}
          onPress={handleCash}
          disabled={working !== ''}
        >
          {working === 'cash' ? (
            <ActivityIndicator color={colors.ink} />
          ) : (
            <Text style={[buttonStyles.text, styles.secondaryText]}>
              {t(trip.paymentMethod === PAYMENT_METHOD.CASH ? 'summary.confirmCash' : 'summary.registerCash')}
            </Text>
          )}
        </Pressable>
      ) : (
        <Pressable style={buttonStyles.button} onPress={() => navigation.getParent()?.goBack()}>
          <Text style={buttonStyles.text}>{t('summary.backHome')}</Text>
        </Pressable>
      )}
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
  status: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  statusPaid: {
    backgroundColor: colors.successSoft,
  },
  statusPending: {
    backgroundColor: colors.warningSoft,
  },
  statusRejected: {
    backgroundColor: colors.dangerSoft,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
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
  info: {
    fontSize: 14,
    color: colors.textMuted,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ink,
  },
  secondaryText: {
    color: colors.ink,
  },
});
