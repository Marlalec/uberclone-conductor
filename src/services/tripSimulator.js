import { createTripRequest } from './tripsService';
import { PAYMENT_METHODS } from '../config/options';

const METERS_PER_DEGREE = 111320;
const SIMULATED_PASSENGER_ID = 'simulated-passenger';

const randomBetween = (min, max) => min + Math.random() * (max - min);

const offsetLocation = ({ lat, lng }, minMeters, maxMeters) => {
  const distance = randomBetween(minMeters, maxMeters);
  const angle = randomBetween(0, 2 * Math.PI);

  return {
    lat: lat + (distance * Math.cos(angle)) / METERS_PER_DEGREE,
    lng: lng + (distance * Math.sin(angle)) / (METERS_PER_DEGREE * Math.cos((lat * Math.PI) / 180)),
  };
};

export const simulateTripRequest = ({ driverId, category, location }) => {
  const origin = offsetLocation(location, 300, 800);
  const destination = offsetLocation(origin, 2000, 6000);
  const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)].value;

  return createTripRequest({
    driverId,
    passengerId: SIMULATED_PASSENGER_ID,
    origin,
    destination,
    category,
    paymentMethod,
  });
};
