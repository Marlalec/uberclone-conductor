import { fetchGoogleMaps, metersToKm, secondsToMinutes, toLatLngParam } from './googleMapsClient';

export const DIRECTIONS_ERROR = 'DIRECTIONS_FAILED';

export const getRoute = async (origin, destination) => {
  const data = await fetchGoogleMaps('directions', {
    origin: toLatLngParam(origin),
    destination: toLatLngParam(destination),
    mode: 'driving',
  });
  const route = data.routes?.[0];
  const leg = route?.legs?.[0];

  if (data.status !== 'OK' || !leg) {
    throw new Error(DIRECTIONS_ERROR);
  }

  return {
    polyline: route.overview_polyline.points,
    distanceKm: metersToKm(leg.distance.value),
    durationMin: secondsToMinutes(leg.duration.value),
  };
};
