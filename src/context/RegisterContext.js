import { createContext, useContext, useMemo, useState } from 'react';
import { validatePersonalData, validateVehicle } from '../utils/validators';

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

const RegisterContext = createContext(null);

export function RegisterProvider({ children }) {
  const [personalData, setPersonalData] = useState(initialPersonalData);
  const [vehicle, setVehicle] = useState(initialVehicle);
  const [touched, setTouched] = useState({});

  const updatePersonalData = (field, value) => {
    setPersonalData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const updateVehicle = (field, value) => {
    setVehicle((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const touchFields = (fields) => {
    setTouched((prev) => fields.reduce((acc, field) => ({ ...acc, [field]: true }), prev));
  };

  const resetRegister = () => {
    setPersonalData(initialPersonalData);
    setVehicle(initialVehicle);
    setTouched({});
  };

  const personalErrors = useMemo(() => validatePersonalData(personalData), [personalData]);
  const vehicleErrors = useMemo(() => validateVehicle(vehicle), [vehicle]);

  const value = {
    personalData,
    vehicle,
    touched,
    personalErrors,
    vehicleErrors,
    isPersonalValid: Object.keys(personalErrors).length === 0,
    isVehicleValid: Object.keys(vehicleErrors).length === 0,
    updatePersonalData,
    updateVehicle,
    touchFields,
    resetRegister,
  };

  return <RegisterContext.Provider value={value}>{children}</RegisterContext.Provider>;
}

export const useRegister = () => useContext(RegisterContext);
