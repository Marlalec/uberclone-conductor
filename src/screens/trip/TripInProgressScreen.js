import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { useDriver } from '../../context/DriverContext';
import useDriverLocation from '../../hooks/useDriverLocation';
import {
  TRIP_STATUS,
  cancelTrip,
  completeTrip,
  startPickup,
  startTrip,
  subscribeToTrip,
} from '../../services/tripsService';
import { decodePolyline, toCoordinate, toLatLng } from '../../utils/maps';

const MAP_DELTA = {
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const MAP_PADDING = {
  top: 60,
  right: 40,
  bottom: 320,
  left: 40,
};

const STATUS_TITLES = {
  [TRIP_STATUS.ACCEPTED]: 'Calculando la ruta al punto de recogida',
  [TRIP_STATUS.DRIVER_ARRIVING]: 'Ve al punto de recogida',
  [TRIP_STATUS.IN_PROGRESS]: 'Lleva al pasajero a su destino',
};

const PICKUP_ROUTE_ERROR = 'No se pudo calcular la ruta al punto de recogida';
const TRIP_ROUTE_ERROR = 'No se pudo calcular la ruta al destino, intenta de nuevo';
const COMPLETE_ERROR = 'No se pudo finalizar el viaje, intenta de nuevo';
const CANCEL_ERROR = 'No se pudo cancelar el viaje, intenta de nuevo';

export default function TripInProgressScreen({ navigation, route }) {
  const { tripId } = route.params;
  const { driverId } = useDriver();
  const { location, error: locationError } = useDriverLocation({ driverId, isTracking: true });
  const [trip, setTrip] = useState(undefined);
  const [mapReady, setMapReady] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const pickupRequestedRef = useRef(false);

  const status = trip?.status;
  const origin = trip?.origin;
  const destination = trip?.destination;

  useEffect(() => subscribeToTrip(tripId, setTrip), [tripId]);

  const loadPickupRoute = useCallback(async () => {
    if (!location || !origin) {
      return;
    }
    pickupRequestedRef.current = true;
    setUpdating(true);
    setError('');
    try {
      await startPickup({ tripId, driverLocation: toLatLng(location), origin });
    } catch {
      setError(PICKUP_ROUTE_ERROR);
    } finally {
      setUpdating(false);
    }
  }, [location, origin, tripId]);

  useEffect(() => {
    if (status === TRIP_STATUS.ACCEPTED && location && !pickupRequestedRef.current) {
      loadPickupRoute();
    }
  }, [status, location, loadPickupRoute]);

  useEffect(() => {
    if (status === TRIP_STATUS.COMPLETED || status === TRIP_STATUS.PAID) {
      navigation.replace('TripSummary', { tripId });
    }
    if (trip === null || status === TRIP_STATUS.CANCELLED) {
      navigation.goBack();
    }
  }, [navigation, status, trip, tripId]);

  const activePolyline = status === TRIP_STATUS.IN_PROGRESS ? trip?.route?.polyline : trip?.pickupRoute?.polyline;

  const routeCoordinates = useMemo(
    () => (activePolyline ? decodePolyline(activePolyline) : []),
    [activePolyline]
  );

  useEffect(() => {
    if (mapReady && routeCoordinates.length > 0) {
      mapRef.current?.fitToCoordinates(routeCoordinates, { edgePadding: MAP_PADDING, animated: true });
    }
  }, [mapReady, routeCoordinates]);

  const runAction = useCallback(async (action, errorMessage) => {
    setUpdating(true);
    setError('');
    try {
      await action();
    } catch {
      setError(errorMessage);
    } finally {
      setUpdating(false);
    }
  }, []);

  const handlePassengerOnBoard = useCallback(
    () => runAction(() => startTrip({ tripId, origin, destination }), TRIP_ROUTE_ERROR),
    [destination, origin, runAction, tripId]
  );

  const handleComplete = useCallback(() => runAction(() => completeTrip(tripId), COMPLETE_ERROR), [runAction, tripId]);

  const handleCancel = useCallback(() => runAction(() => cancelTrip(tripId), CANCEL_ERROR), [runAction, tripId]);

  if (!trip) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const isInProgress = status === TRIP_STATUS.IN_PROGRESS;
  const activeLeg = isInProgress ? trip.route : trip.pickupRoute;
  const target = isInProgress ? destination : origin;
  const canCancel = status === TRIP_STATUS.ACCEPTED || status === TRIP_STATUS.DRIVER_ARRIVING;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...toCoordinate(origin), ...MAP_DELTA }}
        showsUserLocation
        onMapReady={() => setMapReady(true)}
      >
        <Marker coordinate={toCoordinate(origin)} title="Punto de recogida" pinColor="green" />
        {isInProgress ? <Marker coordinate={toCoordinate(destination)} title="Destino" /> : null}
        {routeCoordinates.length > 0 ? (
          <Polyline coordinates={routeCoordinates} strokeWidth={5} strokeColor="#000" />
        ) : null}
      </MapView>
      <View style={styles.panel}>
        <Text style={styles.title}>{STATUS_TITLES[status]}</Text>
        <Text style={styles.address}>{target.address}</Text>
        {activeLeg ? (
          <Text style={styles.eta}>
            {activeLeg.durationMin} min · {activeLeg.distanceKm.toLocaleString('es-CO')} km
          </Text>
        ) : null}
        {locationError ? <Text style={fieldStyles.error}>{locationError}</Text> : null}
        {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
        {status === TRIP_STATUS.ACCEPTED && error === PICKUP_ROUTE_ERROR ? (
          <Pressable style={buttonStyles.button} onPress={loadPickupRoute} disabled={updating}>
            <Text style={buttonStyles.text}>Reintentar</Text>
          </Pressable>
        ) : null}
        {status === TRIP_STATUS.DRIVER_ARRIVING ? (
          <Pressable
            style={[buttonStyles.button, updating && buttonStyles.disabled]}
            onPress={handlePassengerOnBoard}
            disabled={updating}
          >
            {updating ? <ActivityIndicator color="#fff" /> : <Text style={buttonStyles.text}>Pasajero a bordo</Text>}
          </Pressable>
        ) : null}
        {isInProgress ? (
          <Pressable
            style={[buttonStyles.button, updating && buttonStyles.disabled]}
            onPress={handleComplete}
            disabled={updating}
          >
            {updating ? <ActivityIndicator color="#fff" /> : <Text style={buttonStyles.text}>Finalizar viaje</Text>}
          </Pressable>
        ) : null}
        {canCancel ? (
          <Pressable style={[buttonStyles.button, styles.cancel]} onPress={handleCancel} disabled={updating}>
            <Text style={[buttonStyles.text, styles.cancelText]}>Cancelar viaje</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    padding: 16,
    gap: 8,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  address: {
    fontSize: 15,
    color: '#222',
  },
  eta: {
    fontSize: 14,
    color: '#555',
  },
  cancel: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d32f2f',
  },
  cancelText: {
    color: '#d32f2f',
  },
});
