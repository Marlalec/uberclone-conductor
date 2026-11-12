import { TRIP_STATUS } from '../services/tripsService';
import { startOfDay, startOfMonth, startOfWeek } from './dates';

const tripDate = (trip) => trip.completedAt?.toDate?.() ?? null;

const buildSummary = (trips) => {
  const totals = trips.reduce(
    (acc, trip) => ({
      trips: acc.trips + 1,
      totalFare: acc.totalFare + trip.fare,
      totalCommission: acc.totalCommission + trip.commission,
      totalTips: acc.totalTips + (trip.tip ?? 0),
      totalEarnings: acc.totalEarnings + trip.driverEarnings,
    }),
    { trips: 0, totalFare: 0, totalCommission: 0, totalTips: 0, totalEarnings: 0 }
  );

  return {
    ...totals,
    averagePerTrip: totals.trips > 0 ? Math.round(totals.totalEarnings / totals.trips) : 0,
  };
};

export const earningsQueryStart = (now = new Date()) => {
  const week = startOfWeek(now);
  const month = startOfMonth(now);
  return week < month ? week : month;
};

export const buildEarningsSummaries = (trips, now = new Date()) => {
  const paid = trips.filter((trip) => trip.status === TRIP_STATUS.PAID && tripDate(trip));
  const starts = {
    today: startOfDay(now),
    week: startOfWeek(now),
    month: startOfMonth(now),
  };

  return Object.fromEntries(
    Object.entries(starts).map(([key, start]) => [
      key,
      buildSummary(paid.filter((trip) => tripDate(trip) >= start)),
    ])
  );
};
