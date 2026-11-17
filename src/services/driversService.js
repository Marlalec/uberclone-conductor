import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { uploadImage } from './cloudinaryService';
import { COMMISSION_RATE } from '../config/pricing';
import { toDateString } from '../utils/dates';
import { requiresTechnicalInspection } from '../utils/validators';

export const DRIVER_STATUS = {
  PENDING: 'pending_approval',
  APPROVED: 'approved',
};

export const DRIVER_EXISTS_ERROR = 'DRIVER_EXISTS';

const uploadDriverPhotos = async (driverId, { personalData, vehicle, documents }, needsInspection) => {
  const folder = `uberclone-conductor/drivers/${driverId}`;
  const [profilePhotoUrl, vehiclePhotoUrl, licensePhotoUrl, soatPhotoUrl, technicalInspectionPhotoUrl] =
    await Promise.all([
      uploadImage(personalData.profilePhoto, folder),
      uploadImage(vehicle.vehiclePhoto, folder),
      uploadImage(documents.licensePhoto, folder),
      uploadImage(documents.soatPhoto, folder),
      needsInspection ? uploadImage(documents.technicalInspectionPhoto, folder) : null,
    ]);

  return { profilePhotoUrl, vehiclePhotoUrl, licensePhotoUrl, soatPhotoUrl, technicalInspectionPhotoUrl };
};

export const registerDriver = async ({ personalData, vehicle, documents }) => {
  const driverRef = doc(db, 'drivers', personalData.documentId);
  const existing = await getDoc(driverRef);

  if (existing.exists()) {
    throw new Error(DRIVER_EXISTS_ERROR);
  }

  const needsInspection = requiresTechnicalInspection(vehicle.year);
  const photos = await uploadDriverPhotos(driverRef.id, { personalData, vehicle, documents }, needsInspection);

  await setDoc(driverRef, {
    fullName: personalData.fullName.trim(),
    documentId: personalData.documentId,
    phone: personalData.phone,
    birthDate: toDateString(personalData.birthDate),
    gender: personalData.gender,
    email: personalData.email.trim().toLowerCase(),
    language: personalData.language,
    profilePhotoUrl: photos.profilePhotoUrl,
    vehicle: {
      category: vehicle.category,
      plate: vehicle.plate.toUpperCase(),
      brand: vehicle.brand.trim(),
      model: vehicle.model.trim(),
      year: Number(vehicle.year),
      color: vehicle.color,
      capacity: Number(vehicle.capacity),
      photoUrl: photos.vehiclePhotoUrl,
    },
    documents: {
      license: {
        number: documents.licenseNumber,
        photoUrl: photos.licensePhotoUrl,
        expiresAt: toDateString(documents.licenseExpiry),
      },
      soat: {
        photoUrl: photos.soatPhotoUrl,
        expiresAt: toDateString(documents.soatExpiry),
      },
      technicalInspection: needsInspection
        ? {
            required: true,
            photoUrl: photos.technicalInspectionPhotoUrl,
            expiresAt: toDateString(documents.technicalInspectionExpiry),
          }
        : { required: false },
    },
    paymentEmail: documents.paymentEmail.trim().toLowerCase(),
    termsAcceptedAt: serverTimestamp(),
    commissionRate: COMMISSION_RATE,
    status: DRIVER_STATUS.PENDING,
    isAvailable: false,
    createdAt: serverTimestamp(),
  });

  return driverRef.id;
};

export const subscribeToDriver = (driverId, onChange) =>
  onSnapshot(doc(db, 'drivers', driverId), (snapshot) =>
    onChange(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)
  );

export const setDriverAvailability = (driverId, isAvailable) =>
  updateDoc(doc(db, 'drivers', driverId), {
    isAvailable,
    availabilityUpdatedAt: serverTimestamp(),
  });

export const updateDriverFcmToken = (driverId, fcmToken) =>
  updateDoc(doc(db, 'drivers', driverId), { fcmToken });

export const updateDriverProfile = (driverId, { phone, email, language }) =>
  updateDoc(doc(db, 'drivers', driverId), {
    phone,
    email: email.trim().toLowerCase(),
    language,
  });

export const updateDriverLocation = (driverId, { latitude, longitude }) =>
  updateDoc(doc(db, 'drivers', driverId), {
    location: { lat: latitude, lng: longitude },
    locationUpdatedAt: serverTimestamp(),
  });
