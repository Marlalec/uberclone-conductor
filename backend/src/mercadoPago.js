const BASE_URL = 'https://api.mercadopago.com';

export const MERCADO_PAGO_ERROR = 'MERCADO_PAGO_FAILED';

const request = async (path, options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(MERCADO_PAGO_ERROR);
  }

  return response.json();
};

export const createPreference = (payload) =>
  request('/checkout/preferences', { method: 'POST', body: JSON.stringify(payload) });

export const getPayment = (paymentId) => request(`/v1/payments/${paymentId}`);

export const searchPaymentsByReference = async (reference) => {
  const data = await request(
    `/v1/payments/search?external_reference=${encodeURIComponent(reference)}&sort=date_created&criteria=desc`
  );
  return data.results ?? [];
};
