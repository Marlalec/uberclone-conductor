const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const BASE_URL = 'https://maps.googleapis.com/maps/api';

export const toLatLngParam = ({ lat, lng }) => `${lat},${lng}`;

export const metersToKm = (meters) => Math.round(meters / 100) / 10;

export const secondsToMinutes = (seconds) => Math.max(1, Math.round(seconds / 60));

const buildQuery = (params) =>
  Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

export const fetchGoogleMaps = async (path, params) => {
  const query = buildQuery({ ...params, language: 'es', key: API_KEY });
  const response = await fetch(`${BASE_URL}/${path}/json?${query}`);
  return response.json();
};
