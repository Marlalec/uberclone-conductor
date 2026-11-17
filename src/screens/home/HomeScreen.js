import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import MapView from 'react-native-maps';
import { useIsFocused } from '@react-navigation/native';
import { buttonStyles, fieldStyles } from '../../components/formStyles';
import { useDriver } from '../../context/DriverContext';
import { useLanguage } from '../../context/LanguageContext';
import useDriverLocation from '../../hooks/useDriverLocation';
import useTripRequests from '../../hooks/useTripRequests';
import usePushNotifications from '../../hooks/usePushNotifications';
import { DRIVER_STATUS } from '../../services/driversService';
import { DISTANCE_MATRIX_ERROR } from '../../services/distanceMatrixService';
import { simulateTripRequest } from '../../services/tripSimulator';
import { toLatLng } from '../../utils/maps';
import { colors, radius } from '../../theme';

const STATUS_LABELS = {
  [DRIVER_STATUS.PENDING]: 'home.statusPending',
  [DRIVER_STATUS.APPROVED]: 'home.statusApproved',
};

const SWITCH_TRACK = { true: colors.amber, false: colors.border };

const MAP_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function HomeScreen({ navigation }) {
  const { driver, driverId, activeTrip, isApproved, updateAvailability } = useDriver();
  const { t } = useLanguage();
  const isFocused = useIsFocused();
  const isTracking = Boolean(driver?.isAvailable) && isFocused;
  const { location, error: locationError } = useDriverLocation({ driverId, isTracking });
  const { request, error: requestError } = useTripRequests({ driverId, isAvailable: Boolean(driver?.isAvailable) });
  usePushNotifications(driverId);
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
        <ActivityIndicator size="large" color={colors.ink} />
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
      setError('home.errors.availability');
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
          ? 'home.errors.distance'
          : 'home.errors.simulate'
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
          {locationError ? null : <ActivityIndicator size="large" color={colors.ink} />}
        </View>
      )}
      <View style={styles.panel}>
        <Text style={styles.greeting}>{t('home.greeting', { name: driver.fullName })}</Text>
        <View style={[styles.badge, isApproved ? styles.approved : styles.pending]}>
          <Text style={styles.badgeText}>{t(STATUS_LABELS[driver.status] ?? driver.status)}</Text>
        </View>
        <View style={styles.availability}>
          <Text style={styles.availabilityLabel}>{t(driver.isAvailable ? 'home.available' : 'home.unavailable')}</Text>
          <Switch
            value={driver.isAvailable}
            trackColor={SWITCH_TRACK}
            onValueChange={handleToggle}
            disabled={switchDisabled}
          />
        </View>
        {!isApproved ? (
          <Text style={styles.hint}>
            {t('home.pendingHint')}
          </Text>
        ) : null}
        {isTracking ? <Text style={styles.hint}>{t('home.sharingLocation')}</Text> : null}
        {locationError ? <Text style={fieldStyles.error}>{t(locationError)}</Text> : null}
        {requestError ? <Text style={fieldStyles.error}>{t(requestError)}</Text> : null}
        {error ? <Text style={fieldStyles.error}>{t(error)}</Text> : null}
        <Pressable
          style={[buttonStyles.button, !canSimulate && buttonStyles.disabled]}
          onPress={handleSimulate}
          disabled={!canSimulate}
        >
          {simulating ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <Text style={buttonStyles.text}>{t('home.simulate')}</Text>
          )}
        </Pressable>
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
  panel: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    padding: 16,
    gap: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    shadowColor: colors.ink,
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  pending: {
    backgroundColor: colors.warningSoft,
  },
  approved: {
    backgroundColor: colors.successSoft,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.background,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  hint: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
