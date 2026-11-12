import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { getDistanceMatrix } from './distanceMatrixService';
import { getRoute } from './directionsService';
import { COMMISSION_RATE } from '../config/pricing';
import { calculateFare } from '../utils/calculateFare';

export const TRIP_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  DRIVER_ARRIVING: 'driver_arriving',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

export const ACTIVE_TRIP_STATUSES = [TRIP_STATUS.ACCEPTED, TRIP_STATUS.DRIVER_ARRIVING, TRIP_STATUS.IN_PROGRESS];

export const REJECTION_REASON = {
  DECLINED: 'declined',
  TIMEOUT: 'timeout',
};

export const REQUEST_TIMEOUT_MS = 15000;

export const TRIP_UNAVAILABLE_ERROR = 'TRIP_UNAVAILABLE';

const tripsRef = collection(db, 'trips');

const toTrip = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

export const createTripRequest = async ({ driverId, passengerId, origin, destination, category, paymentMethod }) => {
  const matrix = await getDistanceMatrix(origin, destination);
  const estimate = calculateFare({
    distanceKm: matrix.distanceKm,
    durationMin: matrix.durationMin,
    category,
  });

  const tripRef = await addDoc(tripsRef, {
    driverId,
    passengerId,
    origin: { ...origin, address: matrix.originAddress },
    destination: { ...destination, address: matrix.destinationAddress },
    distanceKm: matrix.distanceKm,
    durationMin: matrix.durationMin,
    category,
    paymentMethod,
    estimate,
    tip: 0,
    commissionRate: COMMISSION_RATE,
    status: TRIP_STATUS.REQUESTED,
    expiresAtMs: Date.now() + REQUEST_TIMEOUT_MS,
    createdAt: serverTimestamp(),
  });

  return tripRef.id;
};

export const subscribeToTripRequests = (driverId, onChange, onError) =>
  onSnapshot(
    query(tripsRef, where('driverId', '==', driverId), where('status', '==', TRIP_STATUS.REQUESTED)),
    (snapshot) => onChange(snapshot.docs.map(toTrip)),
    onError
  );

export const subscribeToActiveTrip = (driverId, onChange) =>
  onSnapshot(
    query(tripsRef, where('driverId', '==', driverId), where('status', 'in', ACTIVE_TRIP_STATUSES), limit(1)),
    (snapshot) => onChange(snapshot.empty ? null : toTrip(snapshot.docs[0]))
  );

export const subscribeToTrip = (tripId, onChange) =>
  onSnapshot(doc(db, 'trips', tripId), (snapshot) => onChange(snapshot.exists() ? toTrip(snapshot) : null));

const updateTripIfStatus = (tripId, allowedStatuses, buildChanges) =>
  runTransaction(db, async (transaction) => {
    const tripRef = doc(db, 'trips', tripId);
    const snapshot = await transaction.get(tripRef);

    if (!snapshot.exists() || !allowedStatuses.includes(snapshot.data().status)) {
      throw new Error(TRIP_UNAVAILABLE_ERROR);
    }

    transaction.update(tripRef, buildChanges(snapshot.data()));
  });

const getPickupEstimate = async (driverLocation, origin) => {
  if (!driverLocation) {
    return null;
  }
  try {
    const matrix = await getDistanceMatrix(driverLocation, origin);
    return { distanceKm: matrix.distanceKm, durationMin: matrix.durationMin };
  } catch {
    return null;
  }
};

export const acceptTrip = async ({ tripId, driverLocation, origin }) => {
  const pickup = await getPickupEstimate(driverLocation, origin);

  await updateTripIfStatus(tripId, [TRIP_STATUS.REQUESTED], () => ({
    status: TRIP_STATUS.ACCEPTED,
    pickup,
    acceptedAt: serverTimestamp(),
  }));
};

export const rejectTrip = (tripId, reason) =>
  updateTripIfStatus(tripId, [TRIP_STATUS.REQUESTED], () => ({
    status: TRIP_STATUS.REJECTED,
    rejectionReason: reason,
    rejectedAt: serverTimestamp(),
  }));

export const startPickup = async ({ tripId, driverLocation, origin }) => {
  const pickupRoute = await getRoute(driverLocation, origin);

  await updateTripIfStatus(tripId, [TRIP_STATUS.ACCEPTED], () => ({
    status: TRIP_STATUS.DRIVER_ARRIVING,
    pickupRoute,
    driverArrivingAt: serverTimestamp(),
  }));
};

export const startTrip = async ({ tripId, origin, destination }) => {
  const route = await getRoute(origin, destination);

  await updateTripIfStatus(tripId, [TRIP_STATUS.DRIVER_ARRIVING], () => ({
    status: TRIP_STATUS.IN_PROGRESS,
    route,
    startedAt: serverTimestamp(),
  }));
};

export const completeTrip = (tripId) =>
  updateTripIfStatus(tripId, [TRIP_STATUS.IN_PROGRESS], (trip) => {
    const { fare, commission, driverEarnings } = calculateFare({
      distanceKm: trip.distanceKm,
      durationMin: trip.durationMin,
      category: trip.category,
      tip: trip.tip,
    });

    return {
      status: TRIP_STATUS.COMPLETED,
      fare,
      commission,
      driverEarnings,
      completedAt: serverTimestamp(),
    };
  });

export const cancelTrip = (tripId) =>
  updateTripIfStatus(tripId, [TRIP_STATUS.ACCEPTED, TRIP_STATUS.DRIVER_ARRIVING], () => ({
    status: TRIP_STATUS.CANCELLED,
    cancelledBy: 'driver',
    cancelledAt: serverTimestamp(),
  }));
