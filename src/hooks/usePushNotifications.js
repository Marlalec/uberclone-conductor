import { useEffect } from 'react';
import { registerDeviceForNotifications } from '../services/notificationsService';

export default function usePushNotifications(driverId) {
  useEffect(() => {
    if (!driverId) {
      return undefined;
    }

    let active = true;
    let unsubscribe = () => {};

    registerDeviceForNotifications(driverId)
      .then((cleanup) => {
        if (active) {
          unsubscribe = cleanup;
        } else {
          cleanup();
        }
      })
      .catch(() => null);

    return () => {
      active = false;
      unsubscribe();
    };
  }, [driverId]);
}
