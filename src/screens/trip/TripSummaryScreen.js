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

const API_URL_ERROR = 'Configura EXPO_PUBLIC_API_URL en el .env de la app para cobrar con Mercado Pago';
const PREFERENCE_ERROR = 'No se pudo iniciar el cobro, revisa que el backend esté corriendo';
const SYNC_ERROR = 'No se pudo verificar el pago, revisa que el backend esté corriendo';
const CASH_ERROR = 'No se pudo registrar el pago en efectivo, intenta de nuevo';
const SYNC_EMPTY = 'Mercado Pago aún no registra un pago para este viaje';

function DetailRow({ label, value, highlighted }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlighted && styles.highlighted]}>{value}</Text>
    </View>
  );
}

export default function TripSummaryScreen({ navigation, route }) {
  const { tripId } = route.params;
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
          setInfo('Cuando el pasajero pague, toca "Verificar pago" para actualizar el estado');
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

  if (!trip) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const isPaid = trip.status === TRIP_STATUS.PAID;
  const statusLabel = paymentStatusLabel(trip.paymentStatus);
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
        <DetailRow label="Origen" value={trip.origin.address} />
        <DetailRow label="Destino" value={trip.destination.address} />
        <DetailRow label="Tarifa final" value={formatCurrency(fare)} />
        <DetailRow label={`Comisión de la plataforma (${commissionPercent} %)`} value={`- ${formatCurrency(commission)}`} />
        {trip.tip > 0 ? <DetailRow label="Propina" value={formatCurrency(trip.tip)} /> : null}
        <DetailRow label="Tu ganancia neta" value={formatCurrency(earnings)} highlighted />
        <DetailRow label="Método de pago" value={optionLabel(PAYMENT_METHODS, trip.paymentMethod)} />
      </View>
      {info ? <Text style={styles.info}>{info}</Text> : null}
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
      {!isPaid && trip.paymentMethod === PAYMENT_METHOD.MERCADOPAGO ? (
        <>
          <Pressable
            style={[buttonStyles.button, working !== '' && buttonStyles.disabled]}
            onPress={handleMercadoPago}
            disabled={working !== ''}
          >
            {working === 'preference' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={buttonStyles.text}>Cobrar con Mercado Pago</Text>
            )}
          </Pressable>
          <Pressable
            style={[buttonStyles.button, styles.secondary, working !== '' && buttonStyles.disabled]}
            onPress={handleSync}
            disabled={working !== ''}
          >
            {working === 'sync' ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[buttonStyles.text, styles.secondaryText]}>Verificar pago</Text>
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
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={[buttonStyles.text, styles.secondaryText]}>
              {trip.paymentMethod === PAYMENT_METHOD.CASH ? 'Confirmar pago en efectivo' : 'Registrar pago en efectivo'}
            </Text>
          )}
        </Pressable>
      ) : (
        <Pressable style={buttonStyles.button} onPress={() => navigation.getParent()?.goBack()}>
          <Text style={buttonStyles.text}>Volver al inicio</Text>
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
    backgroundColor: '#fff',
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
    backgroundColor: '#e8f5e9',
  },
  statusPending: {
    backgroundColor: '#fff4e5',
  },
  statusRejected: {
    backgroundColor: '#fdecea',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
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
  info: {
    fontSize: 14,
    color: '#555',
  },
  secondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#000',
  },
  secondaryText: {
    color: '#000',
  },
});
