import { request } from './backendClient';

export const createPaymentPreference = (tripId, amount) => request('/payments/preference', { tripId, amount });

export const syncTripPayment = (tripId) => request('/payments/sync', { tripId });
