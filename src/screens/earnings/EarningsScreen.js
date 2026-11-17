import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import FilterChips from '../../components/FilterChips';
import { fieldStyles } from '../../components/formStyles';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import useEarnings from '../../hooks/useEarnings';
import { formatCurrency } from '../../utils/format';
import { colors, radius } from '../../theme';

const PERIODS = [
  { label: 'periods.today', value: 'today' },
  { label: 'periods.week', value: 'week' },
  { label: 'periods.month', value: 'month' },
];

function SummaryRow({ label, value, highlighted }) {
  const { t } = useLanguage();

  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{t(label)}</Text>
      <Text style={[styles.summaryValue, highlighted && styles.highlighted]}>{value}</Text>
    </View>
  );
}

export default function EarningsScreen() {
  const { driver, driverId } = useDriver();
  const { t } = useLanguage();
  const { summaries, error } = useEarnings(driverId);
  const [period, setPeriod] = useState('today');

  const balance = driver?.balance ?? 0;
  const summary = summaries[period];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>{t('earnings.balance')}</Text>
        <Text style={[styles.balanceValue, balance < 0 && styles.balanceNegative]}>{formatCurrency(balance)}</Text>
        <Text style={styles.balanceHint}>
          {t('earnings.balanceHint')}
        </Text>
      </View>
      <FilterChips options={PERIODS} value={period} onChange={setPeriod} />
      <View style={styles.card}>
        <SummaryRow label="earnings.paidTrips" value={String(summary.trips)} />
        <SummaryRow label="earnings.totalFare" value={formatCurrency(summary.totalFare)} />
        <SummaryRow label="earnings.commissions" value={`- ${formatCurrency(summary.totalCommission)}`} />
        <SummaryRow label="earnings.tips" value={formatCurrency(summary.totalTips)} />
        <SummaryRow label="trip.netEarnings" value={formatCurrency(summary.totalEarnings)} highlighted />
        <SummaryRow label="earnings.average" value={formatCurrency(summary.averagePerTrip)} />
      </View>
      {error ? <Text style={fieldStyles.error}>{t(error)}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  balanceCard: {
    borderRadius: radius.lg,
    padding: 20,
    gap: 4,
    backgroundColor: colors.ink,
  },
  balanceLabel: {
    fontSize: 14,
    color: colors.onInkMuted,
  },
  balanceValue: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.surface,
  },
  balanceNegative: {
    color: '#FF9B8F',
  },
  balanceHint: {
    fontSize: 12,
    color: colors.onInkMuted,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    gap: 14,
    backgroundColor: colors.surface,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: colors.textMuted,
  },
  summaryValue: {
    fontSize: 15,
    color: colors.ink,
  },
  highlighted: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.ink,
  },
});
