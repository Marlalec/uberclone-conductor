import { fetchRouting, metersToKm, secondsToMinutes } from './routingClient';

export const DIRECTIONS_ERROR = 'DIRECTIONS_FAILED';

export const getRoute = async (origin, destination) => {
  const data = await fetchRouting('route', origin, destination, 'overview=full&geometries=polyline');
  const route = data.routes?.[0];

  if (data.code !== 'Ok' || !route?.geometry) {
    throw new Error(DIRECTIONS_ERROR);
  }

  return {
    polyline: route.geometry,
    distanceKm: metersToKm(route.distance),
    durationMin: secondsToMinutes(route.duration),
  };
};
