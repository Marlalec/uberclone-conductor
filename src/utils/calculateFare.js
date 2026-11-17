import { PRICING } from '../config/pricing';

const roundToMultiple = (value, multiple) => Math.round(value / multiple) * multiple;

export const calculateFare = ({
  distanceKm,
  durationMin,
  category,
  tip = 0,
  commissionRate = PRICING.commissionRate,
}) => {
  const multiplier = PRICING.categoryMultipliers[category];
  const subtotal = (PRICING.baseFare + distanceKm * PRICING.perKm + durationMin * PRICING.perMinute) * multiplier;
  const fare = roundToMultiple(Math.max(PRICING.minimumFare, subtotal), PRICING.roundTo);
  const commission = Math.round(fare * commissionRate);
  const driverEarnings = fare - commission + tip;

  return { fare, commission, driverEarnings };
};
