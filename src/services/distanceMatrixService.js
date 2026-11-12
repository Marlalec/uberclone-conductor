import { fetchGoogleMaps, metersToKm, secondsToMinutes, toLatLngParam } from './googleMapsClient';

export const DISTANCE_MATRIX_ERROR = 'DISTANCE_MATRIX_FAILED';

export const getDistanceMatrix = async (origin, destination) => {
  const data = await fetchGoogleMaps('distancematrix', {
    origins: toLatLngParam(origin),
    destinations: toLatLngParam(destination),
    mode: 'driving',
  });
  const element = data.rows?.[0]?.elements?.[0];

  if (data.status !== 'OK' || element?.status !== 'OK') {
    throw new Error(DISTANCE_MATRIX_ERROR);
  }

  return {
    distanceKm: metersToKm(element.distance.value),
    durationMin: secondsToMinutes(element.duration.value),
    originAddress: data.origin_addresses[0],
    destinationAddress: data.destination_addresses[0],
  };
};
