import { PermissionsAndroid, Platform } from 'react-native';
import { updateDriverFcmToken } from './driversService';
import { request } from './backendClient';

const loadMessaging = () => {
  try {
    return require('@react-native-firebase/messaging').default;
  } catch {
    return null;
  }
};

const ensurePermission = async (messagingModule, messaging) => {
  if (Platform.OS === 'android') {
    if (Platform.Version < 33) {
      return true;
    }
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }
  const status = await messaging.requestPermission();
  return (
    status === messagingModule.AuthorizationStatus.AUTHORIZED ||
    status === messagingModule.AuthorizationStatus.PROVISIONAL
  );
};

export const registerDeviceForNotifications = async (driverId) => {
  const messagingModule = loadMessaging();
  if (!messagingModule) {
    return () => {};
  }

  const messaging = messagingModule();
  const granted = await ensurePermission(messagingModule, messaging);
  if (!granted) {
    return () => {};
  }

  const token = await messaging.getToken();
  await updateDriverFcmToken(driverId, token);

  return messaging.onTokenRefresh((newToken) => updateDriverFcmToken(driverId, newToken));
};

export const registerBackgroundMessageHandler = () => {
  const messagingModule = loadMessaging();
  if (messagingModule) {
    messagingModule().setBackgroundMessageHandler(async () => null);
  }
};

export const notifyTripRequest = (tripId) => request('/notifications/trip-request', { tripId });
