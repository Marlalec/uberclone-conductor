export const toLatLng = ({ latitude, longitude }) => ({ lat: latitude, lng: longitude });

export const toCoordinate = ({ lat, lng }) => ({ latitude: lat, longitude: lng });

const decodeValue = (encoded, startIndex) => {
  let index = startIndex;
  let shift = 0;
  let result = 0;
  let byte;

  do {
    byte = encoded.charCodeAt(index) - 63;
    index += 1;
    result |= (byte & 0x1f) << shift;
    shift += 5;
  } while (byte >= 0x20);

  const value = result & 1 ? ~(result >> 1) : result >> 1;
  return { value, nextIndex: index };
};

export const decodePolyline = (encoded) => {
  const coordinates = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    const lat = decodeValue(encoded, index);
    const lng = decodeValue(encoded, lat.nextIndex);
    latitude += lat.value;
    longitude += lng.value;
    index = lng.nextIndex;
    coordinates.push({ latitude: latitude / 1e5, longitude: longitude / 1e5 });
  }

  return coordinates;
};
