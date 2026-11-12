import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { DRIVER_STATUS, setDriverAvailability, subscribeToDriver } from '../services/driversService';
import {
  clearSession,
  getSession,
  saveLanguage,
  saveLastAvailability,
  saveSession,
} from '../services/storageService';

const DriverContext = createContext(null);

export function DriverProvider({ children }) {
  const [driverId, setDriverId] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const isApproved = driver?.status === DRIVER_STATUS.APPROVED;

  const endSession = useCallback(async () => {
    await clearSession();
    setDriverId(null);
    setDriver(null);
  }, []);

  useEffect(() => {
    getSession()
      .then(setDriverId)
      .finally(() => setLoadingSession(false));
  }, []);

  useEffect(() => {
    if (!driverId) {
      return undefined;
    }

    return subscribeToDriver(driverId, (data) => {
      if (data) {
        setDriver(data);
      } else {
        endSession();
      }
    });
  }, [driverId, endSession]);

  useEffect(() => {
    if (driver?.isAvailable && !isApproved) {
      setDriverAvailability(driverId, false);
      saveLastAvailability(false);
    }
  }, [driver, driverId, isApproved]);

  const startSession = useCallback(async (id, language) => {
    await Promise.all([saveSession(id), saveLanguage(language)]);
    setDriverId(id);
  }, []);

  const updateAvailability = useCallback(
    async (isAvailable) => {
      if (!isApproved) {
        return;
      }
      await setDriverAvailability(driverId, isAvailable);
      await saveLastAvailability(isAvailable);
    },
    [driverId, isApproved]
  );

  const logout = useCallback(async () => {
    if (driver?.isAvailable) {
      await setDriverAvailability(driverId, false);
    }
    await endSession();
  }, [driver, driverId, endSession]);

  const value = {
    driverId,
    driver,
    isApproved,
    loadingSession,
    startSession,
    updateAvailability,
    logout,
  };

  return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>;
}

export const useDriver = () => useContext(DriverContext);
