import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import FilterChips from '../../components/FilterChips';
import { fieldStyles } from '../../components/formStyles';
import { useDriver } from '../../context/DriverContext';
import useEarnings from '../../hooks/useEarnings';
import { formatCurrency } from '../../utils/format';

const PERIODS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
];

function SummaryRow({ label, value, highlighted }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, highlighted && styles.highlighted]}>{value}</Text>
    </View>
  );
}

export default function EarningsScreen() {
  const { driver, driverId } = useDriver();
  const { summaries, error } = useEarnings(driverId);
  const [period, setPeriod] = useState('today');

  const balance = driver?.balance ?? 0;
  const summary = summaries[period];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo del conductor</Text>
        <Text style={[styles.balanceValue, balance < 0 && styles.balanceNegative]}>{formatCurrency(balance)}</Text>
        <Text style={styles.balanceHint}>
          Ganancias de viajes pagados por la pasarela menos comisiones de los viajes en efectivo
        </Text>
      </View>
      <FilterChips options={PERIODS} value={period} onChange={setPeriod} />
      <View style={styles.card}>
        <SummaryRow label="Viajes pagados" value={String(summary.trips)} />
        <SummaryRow label="Total facturado" value={formatCurrency(summary.totalFare)} />
        <SummaryRow label="Comisiones" value={`- ${formatCurrency(summary.totalCommission)}`} />
        <SummaryRow label="Propinas" value={formatCurrency(summary.totalTips)} />
        <SummaryRow label="Ganancia neta" value={formatCurrency(summary.totalEarnings)} highlighted />
        <SummaryRow label="Promedio por viaje" value={formatCurrency(summary.averagePerTrip)} />
      </View>
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  balanceCard: {
    borderRadius: 12,
    padding: 16,
    gap: 4,
    backgroundColor: '#000',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#ccc',
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
  balanceNegative: {
    color: '#ff8a80',
  },
  balanceHint: {
    fontSize: 12,
    color: '#aaa',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 16,
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#555',
  },
  summaryValue: {
    fontSize: 15,
    color: '#000',
  },
  highlighted: {
    fontSize: 17,
    fontWeight: '700',
  },
});
