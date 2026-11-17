import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import useDriverLocation from '../../hooks/useDriverLocation';
import useRouteSimulation from '../../hooks/useRouteSimulation';
import {
  TRIP_STATUS,
  cancelTrip,
  completeTrip,
  startPickup,
  startTrip,
  subscribeToTrip,
} from '../../services/tripsService';
import { decodePolyline, toCoordinate, toLatLng } from '../../utils/maps';
import { colors, radius } from '../../theme';

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

const CAR_ANCHOR = { x: 0.5, y: 0.5 };

const STATUS_TITLES = {
  [TRIP_STATUS.ACCEPTED]: 'trip.calculatingPickup',
  [TRIP_STATUS.DRIVER_ARRIVING]: 'trip.goToPickup',
  [TRIP_STATUS.IN_PROGRESS]: 'trip.goToDestination',
};

const PICKUP_ROUTE_ERROR = 'trip.errors.pickupRoute';
const TRIP_ROUTE_ERROR = 'trip.errors.tripRoute';
const COMPLETE_ERROR = 'trip.errors.complete';
const CANCEL_ERROR = 'trip.errors.cancel';

export default function TripInProgressScreen({ navigation, route }) {
  const { tripId } = route.params;
  const { driverId } = useDriver();
  const { t, locale } = useLanguage();
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

  const carPosition = useRouteSimulation(routeCoordinates);
  const carCoordinate = carPosition
    ? { latitude: carPosition.latitude, longitude: carPosition.longitude }
    : null;
  const remainingRoute = carPosition
    ? [carCoordinate, ...routeCoordinates.slice(carPosition.nextIndex)]
    : routeCoordinates;

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
        <ActivityIndicator size="large" color={colors.ink} />
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
        <Marker coordinate={toCoordinate(origin)} title={t('trip.pickupPoint')} pinColor="green" />
        {isInProgress ? <Marker coordinate={toCoordinate(destination)} title={t('trip.destination')} /> : null}
        {remainingRoute.length > 1 ? (
          <Polyline coordinates={remainingRoute} strokeWidth={5} strokeColor={colors.ink} />
        ) : null}
        {carPosition ? (
          <Marker
            coordinate={carCoordinate}
            anchor={CAR_ANCHOR}
            title={t('trip.simulatedDriver')}
          >
            <Text style={[styles.car, carPosition.facingEast && styles.carFacingEast]}>🚗</Text>
          </Marker>
        ) : null}
      </MapView>
      <View style={styles.panel}>
        <Text style={styles.title}>{t(STATUS_TITLES[status])}</Text>
        <Text style={styles.address}>{target.address}</Text>
        {activeLeg ? (
          <Text style={styles.eta}>
            {activeLeg.durationMin} min · {activeLeg.distanceKm.toLocaleString(locale)} km
          </Text>
        ) : null}
        {locationError ? <Text style={fieldStyles.error}>{t(locationError)}</Text> : null}
        {error ? <Text style={fieldStyles.error}>{t(error)}</Text> : null}
        {status === TRIP_STATUS.ACCEPTED && error === PICKUP_ROUTE_ERROR ? (
          <Pressable style={buttonStyles.button} onPress={loadPickupRoute} disabled={updating}>
            <Text style={buttonStyles.text}>{t('common.retry')}</Text>
          </Pressable>
        ) : null}
        {status === TRIP_STATUS.DRIVER_ARRIVING ? (
          <Pressable
            style={[buttonStyles.button, updating && buttonStyles.disabled]}
            onPress={handlePassengerOnBoard}
            disabled={updating}
          >
            {updating ? <ActivityIndicator color={colors.surface} /> : <Text style={buttonStyles.text}>{t('trip.passengerOnBoard')}</Text>}
          </Pressable>
        ) : null}
        {isInProgress ? (
          <Pressable
            style={[buttonStyles.button, updating && buttonStyles.disabled]}
            onPress={handleComplete}
            disabled={updating}
          >
            {updating ? <ActivityIndicator color={colors.surface} /> : <Text style={buttonStyles.text}>{t('trip.complete')}</Text>}
          </Pressable>
        ) : null}
        {canCancel ? (
          <Pressable style={[buttonStyles.button, styles.cancel]} onPress={handleCancel} disabled={updating}>
            <Text style={[buttonStyles.text, styles.cancelText]}>{t('trip.cancel')}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  car: {
    fontSize: 28,
  },
  carFacingEast: {
    transform: [{ scaleX: -1 }],
  },
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    padding: 16,
    gap: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  address: {
    fontSize: 15,
    color: colors.text,
  },
  eta: {
    fontSize: 14,
    color: colors.textMuted,
  },
  cancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.danger,
  },
  cancelText: {
    color: colors.danger,
  },
});
