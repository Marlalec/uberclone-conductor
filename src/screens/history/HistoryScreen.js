import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import DateField from '../../components/DateField';
import FilterChips from '../../components/FilterChips';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { CATEGORIES, PAYMENT_METHODS, optionLabel, paymentStatusLabel } from '../../config/options';
import { useDriver } from '../../context/DriverContext';
import useTripHistory from '../../hooks/useTripHistory';
import { PAYMENT_STATUS } from '../../services/tripsService';
import { endOfDay, formatDateTime, startOfDay, startOfMonth, startOfWeek } from '../../utils/dates';
import { formatCurrency } from '../../utils/format';

const PAGE_SIZE = 20;

const PERIODS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Rango', value: 'range' },
];

const METHOD_FILTERS = [{ label: 'Todos', value: 'all' }, ...PAYMENT_METHODS];

const statusStyleFor = (status) => {
  if (status === PAYMENT_STATUS.APPROVED || status === PAYMENT_STATUS.CASH) {
    return styles.statusPaid;
  }
  if (status === PAYMENT_STATUS.REJECTED) {
    return styles.statusRejected;
  }
  return styles.statusPending;
};

function TripItem({ trip, onPress }) {
  const completedDate = trip.completedAt?.toDate?.();
  const fare = trip.fare ?? trip.estimate.fare;
  const earnings = trip.driverEarnings ?? trip.estimate.driverEarnings;

  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemDate}>{completedDate ? formatDateTime(completedDate) : '—'}</Text>
        <View style={[styles.statusChip, statusStyleFor(trip.paymentStatus)]}>
          <Text style={styles.statusText}>{paymentStatusLabel(trip.paymentStatus)}</Text>
        </View>
      </View>
      <Text style={styles.itemRoute} numberOfLines={2}>
        {trip.origin.address} → {trip.destination.address}
      </Text>
      <View style={styles.itemFooter}>
        <Text style={styles.itemCategory}>{optionLabel(CATEGORIES, trip.category)}</Text>
        <Text style={styles.itemFare}>{formatCurrency(fare)}</Text>
      </View>
      <Text style={styles.itemEarnings}>Ganancia {formatCurrency(earnings)}</Text>
    </Pressable>
  );
}

export default function HistoryScreen({ navigation }) {
  const { driverId } = useDriver();
  const [period, setPeriod] = useState('today');
  const [method, setMethod] = useState('all');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  useEffect(() => {
    setPageSize(PAGE_SIZE);
  }, [period, method, fromDate, toDate]);

  const range = useMemo(() => {
    const now = new Date();
    if (period === 'today') {
      return { from: startOfDay(now) };
    }
    if (period === 'week') {
      return { from: startOfWeek(now) };
    }
    if (period === 'month') {
      return { from: startOfMonth(now) };
    }
    return fromDate && toDate ? { from: startOfDay(fromDate), to: endOfDay(toDate) } : null;
  }, [period, fromDate, toDate]);

  const { trips, loading, error } = useTripHistory({
    driverId,
    from: range?.from,
    to: range?.to,
    pageSize,
    enabled: Boolean(range),
  });

  const filteredTrips = useMemo(
    () => (method === 'all' ? trips : trips.filter((trip) => trip.paymentMethod === method)),
    [trips, method]
  );

  const emptyMessage = !range
    ? 'Selecciona las dos fechas del rango'
    : 'No tienes viajes en este filtro';

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <FilterChips options={PERIODS} value={period} onChange={setPeriod} />
        <FilterChips options={METHOD_FILTERS} value={method} onChange={setMethod} />
        {period === 'range' ? (
          <View style={styles.rangeRow}>
            <View style={styles.rangeField}>
              <DateField label="Desde" value={fromDate} onChange={setFromDate} maximumDate={new Date()} />
            </View>
            <View style={styles.rangeField}>
              <DateField
                label="Hasta"
                value={toDate}
                onChange={setToDate}
                minimumDate={fromDate ?? undefined}
                maximumDate={new Date()}
              />
            </View>
          </View>
        ) : null}
        {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
      </View>
      <FlatList
        data={filteredTrips}
        keyExtractor={(trip) => trip.id}
        renderItem={({ item }) => (
          <TripItem trip={item} onPress={() => navigation.navigate('TripDetail', { tripId: item.id })} />
        )}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#000" style={styles.empty} />
          ) : (
            <Text style={styles.empty}>{emptyMessage}</Text>
          )
        }
        ListFooterComponent={
          trips.length >= pageSize ? (
            <Pressable style={[buttonStyles.button, styles.loadMore]} onPress={() => setPageSize(pageSize + PAGE_SIZE)}>
              <Text style={buttonStyles.text}>Cargar más</Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filters: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 4,
  },
  rangeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rangeField: {
    flex: 1,
  },
  list: {
    padding: 16,
    paddingTop: 8,
    gap: 12,
    flexGrow: 1,
  },
  item: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemDate: {
    fontSize: 13,
    color: '#555',
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
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
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
  },
  itemRoute: {
    fontSize: 15,
    color: '#000',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 13,
    color: '#555',
  },
  itemFare: {
    fontSize: 14,
    color: '#000',
  },
  itemEarnings: {
    fontSize: 15,
    fontWeight: '700',
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
  },
  loadMore: {
    marginTop: 4,
  },
});
