import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  driverId: 'session.driverId',
  lastAvailability: 'session.lastAvailability',
  language: 'preferences.language',
};

export const saveSession = (driverId) => AsyncStorage.setItem(KEYS.driverId, driverId);

export const getSession = () => AsyncStorage.getItem(KEYS.driverId);

export const clearSession = () => AsyncStorage.multiRemove([KEYS.driverId, KEYS.lastAvailability]);

export const getLanguage = () => AsyncStorage.getItem(KEYS.language);

export const saveLanguage = (language) => AsyncStorage.setItem(KEYS.language, language);

export const saveLastAvailability = (isAvailable) => AsyncStorage.setItem(KEYS.lastAvailability, String(isAvailable));
