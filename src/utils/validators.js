import { isAfterToday } from './dates';

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PLATE_REGEX = /^[A-Z]{3}[0-9]{3}$/;
const LICENSE_REGEX = /^\d{6,10}$/;

export const TECHNICAL_INSPECTION_EXEMPT_YEARS = 5;

export const getAge = (birthDate) => {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
};

export const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());

export const requiresTechnicalInspection = (year) =>
  /^\d{4}$/.test(year) && new Date().getFullYear() - Number(year) >= TECHNICAL_INSPECTION_EXEMPT_YEARS;

const getExpiryError = (date) => {
  if (!date) {
    return 'validation.expiryRequired';
  }
  if (!isAfterToday(date)) {
    return 'validation.expiryFuture';
  }
  return undefined;
};

export const validatePersonalData = (data) => {
  const errors = {};
  const fullName = data.fullName.trim();

  if (!data.profilePhoto) {
    errors.profilePhoto = 'validation.profilePhotoRequired';
  }

  if (!fullName) {
    errors.fullName = 'validation.fullNameRequired';
  } else if (fullName.length > 50) {
    errors.fullName = 'validation.max50';
  } else if (!NAME_REGEX.test(fullName)) {
    errors.fullName = 'validation.lettersOnly';
  }

  if (!data.documentId) {
    errors.documentId = 'validation.documentRequired';
  } else if (!/^\d{6,10}$/.test(data.documentId)) {
    errors.documentId = 'validation.digits6to10';
  }

  if (!data.phone) {
    errors.phone = 'validation.phoneRequired';
  } else if (!/^\d{10}$/.test(data.phone)) {
    errors.phone = 'validation.phoneDigits';
  }

  if (!data.birthDate) {
    errors.birthDate = 'validation.birthDateRequired';
  } else if (getAge(data.birthDate) < 18) {
    errors.birthDate = 'validation.adultOnly';
  }

  if (!data.gender) {
    errors.gender = 'validation.genderRequired';
  }

  if (!data.email.trim()) {
    errors.email = 'validation.emailRequired';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'validation.emailInvalid';
  }

  if (!data.language) {
    errors.language = 'validation.languageRequired';
  }

  return errors;
};

export const validateVehicle = (data) => {
  const errors = {};
  const currentYear = new Date().getFullYear();
  const plate = data.plate.toUpperCase();
  const brand = data.brand.trim();
  const model = data.model.trim();

  if (!data.category) {
    errors.category = 'validation.categoryRequired';
  }

  if (!plate) {
    errors.plate = 'validation.plateRequired';
  } else if (!PLATE_REGEX.test(plate)) {
    errors.plate = 'validation.plateFormat';
  }

  if (!brand) {
    errors.brand = 'validation.brandRequired';
  } else if (brand.length > 30) {
    errors.brand = 'validation.max30';
  }

  if (!model) {
    errors.model = 'validation.modelRequired';
  } else if (model.length > 30) {
    errors.model = 'validation.max30';
  }

  if (!data.year) {
    errors.year = 'validation.yearRequired';
  } else if (!/^\d{4}$/.test(data.year)) {
    errors.year = 'validation.yearDigits';
  } else if (Number(data.year) > currentYear) {
    errors.year = { key: 'validation.yearMax', params: { year: currentYear } };
  }

  if (!data.color) {
    errors.color = 'validation.colorRequired';
  }

  if (!data.capacity) {
    errors.capacity = 'validation.capacityRequired';
  } else if (!/^\d+$/.test(data.capacity) || Number(data.capacity) < 1) {
    errors.capacity = 'validation.capacityPositive';
  } else if (data.category === 'xl' && Number(data.capacity) < 6) {
    errors.capacity = 'validation.capacityXl';
  }

  if (!data.vehiclePhoto) {
    errors.vehiclePhoto = 'validation.vehiclePhotoRequired';
  }

  return errors;
};

export const validateDocuments = (data, vehicleYear) => {
  const errors = {};

  if (!data.licenseNumber) {
    errors.licenseNumber = 'validation.licenseRequired';
  } else if (!LICENSE_REGEX.test(data.licenseNumber)) {
    errors.licenseNumber = 'validation.digits6to10';
  }

  if (!data.licensePhoto) {
    errors.licensePhoto = 'validation.licensePhotoRequired';
  }

  const licenseExpiryError = getExpiryError(data.licenseExpiry);
  if (licenseExpiryError) {
    errors.licenseExpiry = licenseExpiryError;
  }

  if (!data.soatPhoto) {
    errors.soatPhoto = 'validation.soatPhotoRequired';
  }

  const soatExpiryError = getExpiryError(data.soatExpiry);
  if (soatExpiryError) {
    errors.soatExpiry = soatExpiryError;
  }

  if (requiresTechnicalInspection(vehicleYear)) {
    if (!data.technicalInspectionPhoto) {
      errors.technicalInspectionPhoto = 'validation.inspectionPhotoRequired';
    }

    const technicalInspectionExpiryError = getExpiryError(data.technicalInspectionExpiry);
    if (technicalInspectionExpiryError) {
      errors.technicalInspectionExpiry = technicalInspectionExpiryError;
    }
  }

  if (!data.paymentEmail.trim()) {
    errors.paymentEmail = 'validation.paymentEmailRequired';
  } else if (!isValidEmail(data.paymentEmail)) {
    errors.paymentEmail = 'validation.emailInvalid';
  }

  if (!data.termsAccepted) {
    errors.termsAccepted = 'validation.termsRequired';
  }

  return errors;
};
