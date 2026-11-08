const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PLATE_REGEX = /^[A-Z]{3}[0-9]{3}$/;

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

export const validatePersonalData = (data) => {
  const errors = {};
  const fullName = data.fullName.trim();

  if (!data.profilePhoto) {
    errors.profilePhoto = 'La foto de perfil es obligatoria';
  }

  if (!fullName) {
    errors.fullName = 'El nombre completo es obligatorio';
  } else if (fullName.length > 50) {
    errors.fullName = 'Máximo 50 caracteres';
  } else if (!NAME_REGEX.test(fullName)) {
    errors.fullName = 'Solo se permiten letras y espacios';
  }

  if (!data.documentId) {
    errors.documentId = 'El documento de identidad es obligatorio';
  } else if (!/^\d{6,10}$/.test(data.documentId)) {
    errors.documentId = 'Debe ser numérico, entre 6 y 10 dígitos';
  }

  if (!data.phone) {
    errors.phone = 'El número de celular es obligatorio';
  } else if (!/^\d{10}$/.test(data.phone)) {
    errors.phone = 'Debe ser numérico de 10 dígitos';
  }

  if (!data.birthDate) {
    errors.birthDate = 'La fecha de nacimiento es obligatoria';
  } else if (getAge(data.birthDate) < 18) {
    errors.birthDate = 'Debes ser mayor de 18 años';
  }

  if (!data.gender) {
    errors.gender = 'Selecciona un género';
  }

  if (!data.email.trim()) {
    errors.email = 'El correo electrónico es obligatorio';
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Ingresa un correo válido, por ejemplo nombre@dominio.com';
  }

  if (!data.language) {
    errors.language = 'Selecciona un idioma';
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
    errors.category = 'Selecciona una categoría';
  }

  if (!plate) {
    errors.plate = 'La placa es obligatoria';
  } else if (!PLATE_REGEX.test(plate)) {
    errors.plate = 'Formato inválido, debe ser como ABC123';
  }

  if (!brand) {
    errors.brand = 'La marca es obligatoria';
  } else if (brand.length > 30) {
    errors.brand = 'Máximo 30 caracteres';
  }

  if (!model) {
    errors.model = 'El modelo es obligatorio';
  } else if (model.length > 30) {
    errors.model = 'Máximo 30 caracteres';
  }

  if (!data.year) {
    errors.year = 'El año es obligatorio';
  } else if (!/^\d{4}$/.test(data.year)) {
    errors.year = 'Debe tener 4 dígitos';
  } else if (Number(data.year) > currentYear) {
    errors.year = `No puede ser mayor a ${currentYear}`;
  }

  if (!data.color) {
    errors.color = 'Selecciona un color';
  }

  if (!data.capacity) {
    errors.capacity = 'La capacidad es obligatoria';
  } else if (!/^\d+$/.test(data.capacity) || Number(data.capacity) < 1) {
    errors.capacity = 'Debe ser un número mayor a 0';
  } else if (data.category === 'xl' && Number(data.capacity) < 6) {
    errors.capacity = 'La categoría XL exige mínimo 6 pasajeros';
  }

  if (!data.vehiclePhoto) {
    errors.vehiclePhoto = 'La foto del vehículo es obligatoria';
  }

  return errors;
};
