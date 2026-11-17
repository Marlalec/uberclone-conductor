import { useEffect, useState } from 'react';
import { REJECTION_REASON, rejectTrip, subscribeToTripRequests } from '../services/tripsService';

const SUBSCRIPTION_ERROR = 'errors.requestsSubscription';

export default function useTripRequests({ driverId, isAvailable }) {
  const [request, setRequest] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!driverId || !isAvailable) {
      return undefined;
    }

    return subscribeToTripRequests(
      driverId,
      (trips) => {
        const now = Date.now();
        trips
          .filter((trip) => trip.expiresAtMs <= now)
          .forEach((trip) => rejectTrip(trip.id, REJECTION_REASON.TIMEOUT).catch(() => null));
        setRequest(trips.find((trip) => trip.expiresAtMs > now) ?? null);
        setError('');
      },
      () => setError(SUBSCRIPTION_ERROR)
    );
  }, [driverId, isAvailable]);

  return {
    request: isAvailable ? request : null,
    error: isAvailable ? error : '',
  };
}
