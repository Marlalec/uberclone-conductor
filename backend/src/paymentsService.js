import { FieldValue, getDb } from './firebase.js';
import { createPreference, getPayment, searchPaymentsByReference } from './mercadoPago.js';
import { PAYMENT_STATUS, buildPreferencePayload, extractPaymentId, mapPaymentStatus } from './payments.js';

export const TRIP_NOT_FOUND = 'TRIP_NOT_FOUND';
export const TRIP_NOT_PAYABLE = 'TRIP_NOT_PAYABLE';
export const AMOUNT_MISMATCH = 'AMOUNT_MISMATCH';

const applyPaymentToTrip = async (payment) => {
  const tripId = payment.external_reference;
  if (!tripId) {
    return null;
  }

  const paymentStatus = mapPaymentStatus(payment.status);
  const db = getDb();
  const tripRef = db.collection('trips').doc(tripId);

  return db.runTransaction(async (transaction) => {
    const tripSnap = await transaction.get(tripRef);
    if (!tripSnap.exists) {
      throw new Error(TRIP_NOT_FOUND);
    }

    const trip = tripSnap.data();
    if (trip.status === 'paid') {
      return trip.paymentStatus;
    }

    if (paymentStatus === PAYMENT_STATUS.APPROVED) {
      const driverRef = db.collection('drivers').doc(trip.driverId);
      const driverSnap = await transaction.get(driverRef);
      const balance = driverSnap.get('balance') ?? 0;

      transaction.update(tripRef, {
        status: 'paid',
        paymentStatus,
        paymentId: String(payment.id),
        paymentMethod: 'mercadopago',
        paidAt: FieldValue.serverTimestamp(),
      });
      transaction.update(driverRef, { balance: balance + trip.driverEarnings });
    } else {
      transaction.update(tripRef, { paymentStatus, paymentId: String(payment.id) });
    }

    return paymentStatus;
  });
};

export const createTripPreference = async (tripId, amount) => {
  const db = getDb();
  const tripSnap = await db.collection('trips').doc(tripId).get();

  if (!tripSnap.exists) {
    throw new Error(TRIP_NOT_FOUND);
  }

  const trip = tripSnap.data();
  if (trip.status !== 'completed') {
    throw new Error(TRIP_NOT_PAYABLE);
  }
  if (amount != null && Number(amount) !== trip.fare) {
    throw new Error(AMOUNT_MISMATCH);
  }

  const preference = await createPreference(
    buildPreferencePayload({ tripId, trip, publicUrl: process.env.PUBLIC_URL })
  );
  await tripSnap.ref.update({ preferenceId: preference.id });

  return { preferenceId: preference.id, initPoint: preference.init_point };
};

export const processWebhook = async ({ body, query }) => {
  const paymentId = extractPaymentId({ body, query });
  if (!paymentId) {
    return null;
  }

  const payment = await getPayment(paymentId);
  return applyPaymentToTrip(payment);
};

export const syncTripPayment = async (tripId) => {
  const payments = await searchPaymentsByReference(tripId);
  if (payments.length === 0) {
    return { paymentStatus: null };
  }

  const paymentStatus = await applyPaymentToTrip(payments[0]);
  return { paymentStatus };
};
