import * as Location from 'expo-location';

const fallbackAddress = ({ lat, lng }) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

export const getAddress = async (point) => {
  try {
    const [place] = await Location.reverseGeocodeAsync({ latitude: point.lat, longitude: point.lng });
    const street = [place?.street ?? place?.name, place?.streetNumber].filter(Boolean).join(' ');
    const address = [street, place?.district ?? place?.city].filter(Boolean).join(', ');
    return address || fallbackAddress(point);
  } catch {
    return fallbackAddress(point);
  }
};
