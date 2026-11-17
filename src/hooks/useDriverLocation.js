import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { updateDriverLocation } from '../services/driversService';

export const LOCATION_UPDATE_INTERVAL_MS = 5000;

const TRACKING_OPTIONS = {
  accuracy: Location.Accuracy.High,
  timeInterval: LOCATION_UPDATE_INTERVAL_MS,
  distanceInterval: 5,
};

const PERMISSION_ERROR = 'errors.locationPermission';
const LOCATION_ERROR = 'errors.locationUnavailable';
const SYNC_ERROR = 'errors.locationSync';

const toCoords = ({ coords }) => ({
  latitude: coords.latitude,
  longitude: coords.longitude,
});

const requestPermission = async () => {
  const { granted } = await Location.requestForegroundPermissionsAsync();
  return granted;
};

export default function useDriverLocation({ driverId, isTracking }) {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const lastSyncRef = useRef(0);

  useEffect(() => {
    let active = true;

    const loadCurrentLocation = async () => {
      const granted = await requestPermission();
      if (!active) {
        return;
      }
      if (!granted) {
        setError(PERMISSION_ERROR);
        return;
      }
      try {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (active) {
          setLocation(toCoords(position));
        }
      } catch {
        if (active) {
          setError(LOCATION_ERROR);
        }
      }
    };

    loadCurrentLocation();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!driverId || !isTracking) {
      return undefined;
    }

    let active = true;
    let subscription = null;

    const syncLocation = (coords) => {
      const now = Date.now();
      if (now - lastSyncRef.current < LOCATION_UPDATE_INTERVAL_MS) {
        return;
      }
      lastSyncRef.current = now;
      updateDriverLocation(driverId, coords)
        .then(() => setError(''))
        .catch(() => setError(SYNC_ERROR));
    };

    const startTracking = async () => {
      const granted = await requestPermission();
      if (!active) {
        return;
      }
      if (!granted) {
        setError(PERMISSION_ERROR);
        return;
      }
      try {
        const watcher = await Location.watchPositionAsync(TRACKING_OPTIONS, (position) => {
          const coords = toCoords(position);
          setLocation(coords);
          syncLocation(coords);
        });
        if (active) {
          subscription = watcher;
        } else {
          watcher.remove();
        }
      } catch {
        if (active) {
          setError(LOCATION_ERROR);
        }
      }
    };

    startTracking();

    return () => {
      active = false;
      subscription?.remove();
      lastSyncRef.current = 0;
    };
  }, [driverId, isTracking]);

  return { location, error };
}
