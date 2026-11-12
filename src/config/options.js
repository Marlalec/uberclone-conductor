export const GENDERS = [
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' },
  { label: 'Otro', value: 'other' },
  { label: 'Prefiero no decirlo', value: 'not_specified' },
];

export const LANGUAGES = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
];

export const CATEGORIES = [
  { label: 'Económico', value: 'economy' },
  { label: 'XL', value: 'xl' },
  { label: 'Premium', value: 'premium' },
];

export const VEHICLE_COLORS = [
  { label: 'Blanco', value: 'white' },
  { label: 'Negro', value: 'black' },
  { label: 'Gris', value: 'gray' },
  { label: 'Plata', value: 'silver' },
  { label: 'Rojo', value: 'red' },
  { label: 'Azul', value: 'blue' },
  { label: 'Verde', value: 'green' },
  { label: 'Amarillo', value: 'yellow' },
  { label: 'Otro', value: 'other' },
];

export const optionLabel = (options, value) => options.find((option) => option.value === value)?.label ?? value;

export const PAYMENT_STATUS_LABELS = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  cash: 'Efectivo',
};

export const paymentStatusLabel = (status) => PAYMENT_STATUS_LABELS[status] ?? 'Sin cobrar';

export const PAYMENT_METHOD = {
  MERCADOPAGO: 'mercadopago',
  CASH: 'cash',
};

export const PAYMENT_METHODS = [
  { label: 'Mercado Pago', value: PAYMENT_METHOD.MERCADOPAGO },
  { label: 'Efectivo', value: PAYMENT_METHOD.CASH },
];
