import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const DRIVER_STATUS = {
  PENDING: 'pending_approval',
  APPROVED: 'approved',
};

export const DRIVER_EXISTS_ERROR = 'DRIVER_EXISTS';

export const registerDriver = async ({ personalData, vehicle }) => {
  const driverRef = doc(db, 'drivers', personalData.documentId);
  const existing = await getDoc(driverRef);

  if (existing.exists()) {
    throw new Error(DRIVER_EXISTS_ERROR);
  }

  await setDoc(driverRef, {
    fullName: personalData.fullName.trim(),
    documentId: personalData.documentId,
    phone: personalData.phone,
    birthDate: personalData.birthDate.toISOString().slice(0, 10),
    gender: personalData.gender,
    email: personalData.email.trim().toLowerCase(),
    language: personalData.language,
    profilePhotoUrl: personalData.profilePhoto,
    vehicle: {
      category: vehicle.category,
      plate: vehicle.plate.toUpperCase(),
      brand: vehicle.brand.trim(),
      model: vehicle.model.trim(),
      year: Number(vehicle.year),
      color: vehicle.color,
      capacity: Number(vehicle.capacity),
      photoUrl: vehicle.vehiclePhoto,
    },
    status: DRIVER_STATUS.PENDING,
    isAvailable: false,
    createdAt: serverTimestamp(),
  });

  return driverRef.id;
};
