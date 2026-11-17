import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { getDistanceMatrix } from './distanceMatrixService';
import { getRoute } from './directionsService';
import { getAddress } from './addressService';
import { COMMISSION_RATE } from '../config/pricing';
import { PAYMENT_METHOD } from '../config/options';
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

export const ACTIVE_TRIP_STATUSES = [
  TRIP_STATUS.ACCEPTED,
  TRIP_STATUS.DRIVER_ARRIVING,
  TRIP_STATUS.IN_PROGRESS,
  TRIP_STATUS.COMPLETED,
];

export const HISTORY_TRIP_STATUSES = [TRIP_STATUS.COMPLETED, TRIP_STATUS.PAID];

export const PAYMENT_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
  CASH: 'cash',
};

export const REJECTION_REASON = {
  DECLINED: 'declined',
  TIMEOUT: 'timeout',
};

export const REQUEST_TIMEOUT_MS = 15000;

export const TRIP_UNAVAILABLE_ERROR = 'TRIP_UNAVAILABLE';
export const TRIP_EXPIRED_ERROR = 'TRIP_EXPIRED';
export const INVALID_RATING_ERROR = 'INVALID_RATING';

export const MIN_RATING = 1;
export const MAX_RATING = 5;

const tripsRef = collection(db, 'trips');

const toTrip = (snapshot) => ({ id: snapshot.id, ...snapshot.data() });

export const createTripRequest = async ({ driverId, passengerId, origin, destination, category, paymentMethod }) => {
  const [matrix, originAddress, destinationAddress] = await Promise.all([
    getDistanceMatrix(origin, destination),
    getAddress(origin),
    getAddress(destination),
  ]);
  const estimate = calculateFare({
    distanceKm: matrix.distanceKm,
    durationMin: matrix.durationMin,
    category,
  });

  const tripRef = await addDoc(tripsRef, {
    driverId,
    passengerId,
    origin: { ...origin, address: originAddress },
    destination: { ...destination, address: destinationAddress },
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

export const subscribeToTripHistory = ({ driverId, from, to, pageSize }, onChange, onError) => {
  const constraints = [where('driverId', '==', driverId), where('status', 'in', HISTORY_TRIP_STATUSES)];
  if (from) {
    constraints.push(where('completedAt', '>=', Timestamp.fromDate(from)));
  }
  if (to) {
    constraints.push(where('completedAt', '<=', Timestamp.fromDate(to)));
  }
  constraints.push(orderBy('completedAt', 'desc'));
  if (pageSize) {
    constraints.push(limit(pageSize));
  }
  return onSnapshot(
    query(tripsRef, ...constraints),
    (snapshot) => onChange(snapshot.docs.map(toTrip)),
    onError
  );
};

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

  try {
    await updateTripIfStatus(tripId, [TRIP_STATUS.REQUESTED], (trip) => {
      if (Date.now() >= trip.expiresAtMs) {
        throw new Error(TRIP_EXPIRED_ERROR);
      }

      return {
        status: TRIP_STATUS.ACCEPTED,
        pickup,
        acceptedAt: serverTimestamp(),
      };
    });
  } catch (error) {
    if (error.message === TRIP_EXPIRED_ERROR) {
      await rejectTrip(tripId, REJECTION_REASON.TIMEOUT).catch(() => null);
    }
    throw error;
  }
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
      commissionRate: trip.commissionRate,
    });

    return {
      status: TRIP_STATUS.COMPLETED,
      fare,
      commission,
      driverEarnings,
      rating: null,
      completedAt: serverTimestamp(),
    };
  });

export const rateTrip = (tripId, rating) => {
  if (!Number.isInteger(rating) || rating < MIN_RATING || rating > MAX_RATING) {
    return Promise.reject(new Error(INVALID_RATING_ERROR));
  }

  return updateTripIfStatus(tripId, HISTORY_TRIP_STATUSES, (trip) => {
    if (trip.rating != null) {
      throw new Error(TRIP_UNAVAILABLE_ERROR);
    }

    return { rating, ratedAt: serverTimestamp() };
  });
};

export const markCashPayment = (tripId) =>
  runTransaction(db, async (transaction) => {
    const tripRef = doc(db, 'trips', tripId);
    const tripSnap = await transaction.get(tripRef);

    if (!tripSnap.exists() || tripSnap.data().status !== TRIP_STATUS.COMPLETED) {
      throw new Error(TRIP_UNAVAILABLE_ERROR);
    }

    const trip = tripSnap.data();
    const driverRef = doc(db, 'drivers', trip.driverId);
    const driverSnap = await transaction.get(driverRef);
    const balance = driverSnap.data()?.balance ?? 0;

    transaction.update(tripRef, {
      status: TRIP_STATUS.PAID,
      paymentStatus: PAYMENT_STATUS.CASH,
      paymentMethod: PAYMENT_METHOD.CASH,
      paidAt: serverTimestamp(),
    });
    transaction.update(driverRef, { balance: balance - trip.commission });
  });

export const cancelTrip = (tripId) =>
  updateTripIfStatus(tripId, [TRIP_STATUS.ACCEPTED, TRIP_STATUS.DRIVER_ARRIVING], () => ({
    status: TRIP_STATUS.CANCELLED,
    cancelledBy: 'driver',
    cancelledAt: serverTimestamp(),
  }));
