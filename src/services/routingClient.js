const ROUTING_URL = 'https://router.project-osrm.org';

export const metersToKm = (meters = 0) => Math.round(meters / 100) / 10;

export const secondsToMinutes = (seconds) => Math.max(1, Math.round(seconds / 60));

const toCoordinatePair = ({ lat, lng }) => `${lng},${lat}`;

export const fetchRouting = async (service, origin, destination, params) => {
  const coordinates = `${toCoordinatePair(origin)};${toCoordinatePair(destination)}`;
  const response = await fetch(`${ROUTING_URL}/${service}/v1/driving/${coordinates}?${params}`);
  return response.json();
};
