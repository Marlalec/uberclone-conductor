import { useEffect, useState } from 'react';
import { subscribeToTripHistory } from '../services/tripsService';

const SUBSCRIPTION_ERROR = 'No se pudo cargar el historial, revisa tu conexión';
const INDEX_ERROR = 'Firestore necesita un índice para esta consulta, abre el enlace que aparece en la consola de Expo';

export default function useTripHistory({ driverId, from, to, pageSize, enabled = true }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!driverId || !enabled) {
      setTrips([]);
      return undefined;
    }

    setLoading(true);
    return subscribeToTripHistory(
      { driverId, from, to, pageSize },
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
  }, [driverId, enabled, from?.getTime(), to?.getTime(), pageSize]);

  return { trips, loading, error };
}
