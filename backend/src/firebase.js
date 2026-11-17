import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

let db = null;
let messaging = null;

const ensureApp = () => {
  if (getApps().length === 0) {
    initializeApp({
      credential: applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
};

export const getDb = () => {
  ensureApp();
  db ??= getFirestore();
  return db;
};

export const getMessagingService = () => {
  ensureApp();
  messaging ??= getMessaging();
  return messaging;
};

export { FieldValue };
