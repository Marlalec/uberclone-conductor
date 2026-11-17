export const GENDERS = [
  { label: 'options.gender.male', value: 'male' },
  { label: 'options.gender.female', value: 'female' },
  { label: 'options.gender.other', value: 'other' },
  { label: 'options.gender.notSpecified', value: 'not_specified' },
];

export const LANGUAGES = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' },
];

export const CATEGORIES = [
  { label: 'options.category.economy', value: 'economy' },
  { label: 'options.category.xl', value: 'xl' },
  { label: 'options.category.premium', value: 'premium' },
];

export const VEHICLE_COLORS = [
  { label: 'options.color.white', value: 'white' },
  { label: 'options.color.black', value: 'black' },
  { label: 'options.color.gray', value: 'gray' },
  { label: 'options.color.silver', value: 'silver' },
  { label: 'options.color.red', value: 'red' },
  { label: 'options.color.blue', value: 'blue' },
  { label: 'options.color.green', value: 'green' },
  { label: 'options.color.yellow', value: 'yellow' },
  { label: 'options.color.other', value: 'other' },
];

export const optionLabel = (options, value) => options.find((option) => option.value === value)?.label ?? value;

export const PAYMENT_STATUS_LABELS = {
  approved: 'options.paymentStatus.approved',
  pending: 'options.paymentStatus.pending',
  rejected: 'options.paymentStatus.rejected',
  cash: 'options.paymentStatus.cash',
};

export const paymentStatusLabel = (status) => PAYMENT_STATUS_LABELS[status] ?? 'options.paymentStatus.unpaid';

export const PAYMENT_METHOD = {
  MERCADOPAGO: 'mercadopago',
  CASH: 'cash',
};

export const PAYMENT_METHODS = [
  { label: 'Mercado Pago', value: PAYMENT_METHOD.MERCADOPAGO },
  { label: 'options.paymentMethod.cash', value: PAYMENT_METHOD.CASH },
];
