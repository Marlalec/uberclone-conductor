import { createContext, useContext, useMemo, useState } from 'react';
import { validateDocuments, validatePersonalData, validateVehicle } from '../utils/validators';

const initialPersonalData = {
  profilePhoto: null,
  fullName: '',
  documentId: '',
  phone: '',
  birthDate: null,
  gender: '',
  email: '',
  language: 'es',
};

const initialVehicle = {
  category: '',
  plate: '',
  brand: '',
  model: '',
  year: '',
  color: '',
  capacity: '',
  vehiclePhoto: null,
};

const initialDocuments = {
  licenseNumber: '',
  licensePhoto: null,
  licenseExpiry: null,
  soatPhoto: null,
  soatExpiry: null,
  technicalInspectionPhoto: null,
  technicalInspectionExpiry: null,
  paymentEmail: '',
  termsAccepted: false,
};

const RegisterContext = createContext(null);

export function RegisterProvider({ children }) {
  const [personalData, setPersonalData] = useState(initialPersonalData);
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [documents, setDocuments] = useState(initialDocuments);
  const [touched, setTouched] = useState({});

  const updatePersonalData = (field, value) => {
    setPersonalData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const updateVehicle = (field, value) => {
    setVehicle((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const updateDocuments = (field, value) => {
    setDocuments((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const touchFields = (fields) => {
    setTouched((prev) => fields.reduce((acc, field) => ({ ...acc, [field]: true }), prev));
  };

  const resetRegister = () => {
    setPersonalData(initialPersonalData);
    setVehicle(initialVehicle);
    setDocuments(initialDocuments);
    setTouched({});
  };

  const personalErrors = useMemo(() => validatePersonalData(personalData), [personalData]);
  const vehicleErrors = useMemo(() => validateVehicle(vehicle), [vehicle]);
  const documentErrors = useMemo(() => validateDocuments(documents, vehicle.year), [documents, vehicle.year]);

  const value = {
    personalData,
    vehicle,
    documents,
    touched,
    personalErrors,
    vehicleErrors,
    documentErrors,
    isPersonalValid: Object.keys(personalErrors).length === 0,
    isVehicleValid: Object.keys(vehicleErrors).length === 0,
    isDocumentsValid: Object.keys(documentErrors).length === 0,
    updatePersonalData,
    updateVehicle,
    updateDocuments,
    touchFields,
    resetRegister,
  };

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>;
}

export const useRegister = () => useContext(RegisterContext);
