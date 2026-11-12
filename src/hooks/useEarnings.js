import { useEffect, useMemo, useState } from 'react';
import { subscribeToTripHistory } from '../services/tripsService';
import { buildEarningsSummaries, earningsQueryStart } from '../utils/earnings';

const SUBSCRIPTION_ERROR = 'No se pudieron cargar las ganancias, revisa tu conexión';
const INDEX_ERROR = 'Firestore necesita un índice para esta consulta, abre el enlace que aparece en la consola de Expo';

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
