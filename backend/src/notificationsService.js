import { getDb, getMessagingService } from './firebase.js';
import { TRIP_NOT_FOUND } from './paymentsService.js';

export const sendTripRequestNotification = async (tripId) => {
  const db = getDb();
  const tripSnap = await db.collection('trips').doc(tripId).get();

  if (!tripSnap.exists) {
    throw new Error(TRIP_NOT_FOUND);
  }

  const trip = tripSnap.data();
  const driverSnap = await db.collection('drivers').doc(trip.driverId).get();
  const fcmToken = driverSnap.get('fcmToken');

  if (!fcmToken) {
    return { sent: false };
  }

  await getMessagingService().send({
    token: fcmToken,
    notification: {
      title: 'Nueva solicitud de viaje',
      body: `${trip.origin.address} → ${trip.destination.address}`,
    },
    data: { tripId },
    android: { priority: 'high' },
  });

  return { sent: true };
};
