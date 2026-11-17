const pad = (value) => String(value).padStart(2, '0');

export const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getTomorrow = () => {
  const today = startOfDay(new Date());
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
};

export const isAfterToday = (date) => startOfDay(date) > startOfDay(new Date());

export const endOfDay = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

export const startOfWeek = (date) => {
  const start = startOfDay(date);
  const offset = (start.getDay() + 6) % 7;
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() - offset);
};

export const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

export const formatDateTime = (date, locale) =>
  `${date.toLocaleDateString(locale)} ${date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;

export const toDateString = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
