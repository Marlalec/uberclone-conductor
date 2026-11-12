import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import { useIsFocused } from '@react-navigation/native';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { useDriver } from '../../context/DriverContext';
import useDriverLocation from '../../hooks/useDriverLocation';
import useTripRequests from '../../hooks/useTripRequests';
import { DRIVER_STATUS } from '../../services/driversService';
import { DISTANCE_MATRIX_ERROR } from '../../services/distanceMatrixService';
import { simulateTripRequest } from '../../services/tripSimulator';
import { toLatLng } from '../../utils/maps';

const STATUS_LABELS = {
  [DRIVER_STATUS.PENDING]: 'Pendiente de aprobación',
  [DRIVER_STATUS.APPROVED]: 'Aprobado',
};

const MAP_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function HomeScreen({ navigation }) {
  const { driver, driverId, activeTrip, isApproved, updateAvailability } = useDriver();
  const isFocused = useIsFocused();
  const isTracking = Boolean(driver?.isAvailable) && isFocused;
  const { location, error: locationError } = useDriverLocation({ driverId, isTracking });
  const { request, error: requestError } = useTripRequests({ driverId, isAvailable: Boolean(driver?.isAvailable) });
  const mapRef = useRef(null);
  const lastRequestIdRef = useRef(null);
  const [updating, setUpdating] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (location) {
      mapRef.current?.animateToRegion({ ...location, ...MAP_DELTA }, 500);
    }
  }, [location]);

  useEffect(() => {
    if (activeTrip && isFocused) {
      navigation.navigate('Trip', { screen: 'TripInProgress', params: { tripId: activeTrip.id } });
    }
  }, [activeTrip, isFocused, navigation]);

  useEffect(() => {
    if (request && !activeTrip && isFocused && request.id !== lastRequestIdRef.current) {
      lastRequestIdRef.current = request.id;
      navigation.navigate('Trip', { screen: 'TripRequest', params: { tripId: request.id } });
    }
  }, [request, activeTrip, isFocused, navigation]);

  if (!driver) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const canGoAvailable = isApproved && Boolean(location);
  const switchDisabled = updating || (!driver.isAvailable && !canGoAvailable);
  const canSimulate = driver.isAvailable && Boolean(location) && !simulating;

  const handleToggle = async (value) => {
    setUpdating(true);
    setError('');
    try {
      await updateAvailability(value);
    } catch {
      setError('No se pudo actualizar tu disponibilidad, intenta de nuevo');
    } finally {
      setUpdating(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    setError('');
    try {
      await simulateTripRequest({
        driverId,
        category: driver.vehicle.category,
        location: toLatLng(location),
      });
    } catch (simulateError) {
      setError(
        simulateError.message === DISTANCE_MATRIX_ERROR
          ? 'No se pudo calcular la distancia con Google Distance Matrix, revisa la API key'
          : 'No se pudo crear la solicitud simulada, intenta de nuevo'
      );
    } finally {
      setSimulating(false);
    }
  };

  return (
    <View style={styles.container}>
      {location ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={{ ...location, ...MAP_DELTA }}
          showsUserLocation
          showsMyLocationButton
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.centered]}>
          {locationError ? null : <ActivityIndicator size="large" color="#000" />}
        </View>
      )}
      <View style={styles.panel}>
        <Text style={styles.greeting}>Hola, {driver.fullName}</Text>
        <View style={[styles.badge, isApproved ? styles.approved : styles.pending]}>
          <Text style={styles.badgeText}>{STATUS_LABELS[driver.status] ?? driver.status}</Text>
        </View>
        <View style={styles.availability}>
          <Text style={styles.availabilityLabel}>{driver.isAvailable ? 'Disponible' : 'No disponible'}</Text>
          <Switch value={driver.isAvailable} onValueChange={handleToggle} disabled={switchDisabled} />
        </View>
        {!isApproved ? (
          <Text style={styles.hint}>
            Tu cuenta está pendiente de aprobación. Podrás ponerte Disponible cuando sea aprobada.
          </Text>
        ) : null}
        {isTracking ? <Text style={styles.hint}>Compartiendo tu ubicación en tiempo real</Text> : null}
        {locationError ? <Text style={fieldStyles.error}>{locationError}</Text> : null}
        {requestError ? <Text style={fieldStyles.error}>{requestError}</Text> : null}
        {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
        <Pressable
          style={[buttonStyles.button, !canSimulate && buttonStyles.disabled]}
          onPress={handleSimulate}
          disabled={!canSimulate}
        >
          {simulating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={buttonStyles.text}>Simular solicitud de pasajero</Text>
          )}
        </Pressable>
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
    gap: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  pending: {
    backgroundColor: '#fff4e5',
  },
  approved: {
    backgroundColor: '#e8f5e9',
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    color: '#555',
  },
});
