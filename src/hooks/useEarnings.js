import { useEffect, useMemo, useState } from 'react';
import { subscribeToTripHistory } from '../services/tripsService';
import { buildEarningsSummaries, earningsQueryStart } from '../utils/earnings';

const SUBSCRIPTION_ERROR = 'errors.earningsLoad';
const INDEX_ERROR = 'errors.firestoreIndex';

export default function useEarnings(driverId) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!driverId) {
      return undefined;
    }

    setLoading(true);
    return subscribeToTripHistory(
      { driverId, from: earningsQueryStart() },
      (result) => {
        setTrips(result);
        setLoading(false);
        setError('');
      },
      (subscriptionError) => {
        console.warn(subscriptionError.message);
        setError(subscriptionError.code === 'failed-precondition' ? INDEX_ERROR : SUBSCRIPTION_ERROR);
        setLoading(false);
      }
    );
  }, [driverId]);

  const summaries = useMemo(() => buildEarningsSummaries(trips), [trips]);

  return { summaries, loading, error };
}
