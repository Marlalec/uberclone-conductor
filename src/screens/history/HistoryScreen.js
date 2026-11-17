import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import DateField from '../../components/DateField';
import FilterChips from '../../components/FilterChips';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { CATEGORIES, PAYMENT_METHODS, optionLabel, paymentStatusLabel } from '../../config/options';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import useTripHistory from '../../hooks/useTripHistory';
import { PAYMENT_STATUS } from '../../services/tripsService';
import { endOfDay, formatDateTime, startOfDay, startOfMonth, startOfWeek } from '../../utils/dates';
import { formatCurrency } from '../../utils/format';
import { colors, radius } from '../../theme';

const PAGE_SIZE = 20;

const PERIODS = [
  { label: 'periods.today', value: 'today' },
  { label: 'periods.week', value: 'week' },
  { label: 'periods.month', value: 'month' },
  { label: 'periods.range', value: 'range' },
];

const METHOD_FILTERS = [{ label: 'history.all', value: 'all' }, ...PAYMENT_METHODS];

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
  const { t, locale } = useLanguage();
  const completedDate = trip.completedAt?.toDate?.();
  const fare = trip.fare ?? trip.estimate.fare;
  const earnings = trip.driverEarnings ?? trip.estimate.driverEarnings;

  return (
    <Pressable style={styles.item} onPress={onPress}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemDate}>{completedDate ? formatDateTime(completedDate, locale) : '—'}</Text>
        <View style={[styles.statusChip, statusStyleFor(trip.paymentStatus)]}>
          <Text style={styles.statusText}>{t(paymentStatusLabel(trip.paymentStatus))}</Text>
        </View>
      </View>
      <Text style={styles.itemRoute} numberOfLines={2}>
        {trip.origin.address} → {trip.destination.address}
      </Text>
      <View style={styles.itemFooter}>
        <Text style={styles.itemCategory}>{t(optionLabel(CATEGORIES, trip.category))}</Text>
        <Text style={styles.itemFare}>{formatCurrency(fare)}</Text>
      </View>
      <Text style={styles.itemEarnings}>{t('history.earnings', { amount: formatCurrency(earnings) })}</Text>
    </Pressable>
  );
}

export default function HistoryScreen({ navigation }) {
  const { driverId } = useDriver();
  const { t } = useLanguage();
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
    ? 'history.selectRange'
    : 'history.empty';

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <FilterChips options={PERIODS} value={period} onChange={setPeriod} />
        <FilterChips options={METHOD_FILTERS} value={method} onChange={setMethod} />
        {period === 'range' ? (
          <View style={styles.rangeRow}>
            <View style={styles.rangeField}>
              <DateField label="history.from" value={fromDate} onChange={setFromDate} maximumDate={new Date()} />
            </View>
            <View style={styles.rangeField}>
              <DateField
                label="history.to"
                value={toDate}
                onChange={setToDate}
                minimumDate={fromDate ?? undefined}
                maximumDate={new Date()}
              />
            </View>
          </View>
        ) : null}
        {error ? <Text style={fieldStyles.error}>{t(error)}</Text> : null}
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
            <ActivityIndicator size="large" color={colors.ink} style={styles.empty} />
          ) : (
            <Text style={styles.empty}>{t(emptyMessage)}</Text>
          )
        }
        ListFooterComponent={
          trips.length >= pageSize ? (
            <Pressable style={[buttonStyles.button, styles.loadMore]} onPress={() => setPageSize(pageSize + PAGE_SIZE)}>
              <Text style={buttonStyles.text}>{t('history.loadMore')}</Text>
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
    backgroundColor: colors.background,
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
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 14,
    gap: 6,
    backgroundColor: colors.surface,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemDate: {
    fontSize: 13,
    color: colors.textMuted,
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
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
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  itemRoute: {
    fontSize: 15,
    color: colors.ink,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemCategory: {
    fontSize: 13,
    color: colors.textMuted,
  },
  itemFare: {
    fontSize: 14,
    color: colors.ink,
  },
  itemEarnings: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 15,
    color: colors.textMuted,
  },
  loadMore: {
    marginTop: 4,
  },
});
