import { fetchRouting, metersToKm, secondsToMinutes } from './routingClient';

export const DISTANCE_MATRIX_ERROR = 'DISTANCE_MATRIX_FAILED';

export const getDistanceMatrix = async (origin, destination) => {
  const data = await fetchRouting(
    'table',
    origin,
    destination,
    'sources=0&destinations=1&annotations=distance,duration'
  );
  const distance = data.distances?.[0]?.[0];
  const duration = data.durations?.[0]?.[0];

  if (data.code !== 'Ok' || distance == null || duration == null) {
    throw new Error(DISTANCE_MATRIX_ERROR);
  }

  return {
    distanceKm: metersToKm(distance),
    durationMin: secondsToMinutes(duration),
  };
};
