export const PAYMENT_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
};

const STATUS_MAP = {
  approved: PAYMENT_STATUS.APPROVED,
  pending: PAYMENT_STATUS.PENDING,
  in_process: PAYMENT_STATUS.PENDING,
  authorized: PAYMENT_STATUS.PENDING,
  rejected: PAYMENT_STATUS.REJECTED,
  cancelled: PAYMENT_STATUS.REJECTED,
};

export const mapPaymentStatus = (status) => STATUS_MAP[status] ?? PAYMENT_STATUS.PENDING;

export const extractPaymentId = ({ body = {}, query = {} }) => {
  if (body?.type === 'payment' && body?.data?.id) {
    return String(body.data.id);
  }
  if (query['data.id']) {
    return String(query['data.id']);
  }
  if (query.topic === 'payment' && query.id) {
    return String(query.id);
  }
  return null;
};

export const buildPreferencePayload = ({ tripId, trip, publicUrl }) => {
  const payload = {
    items: [
      {
        id: tripId,
        title: 'Viaje UberClone — Conductor',
        quantity: 1,
        unit_price: trip.fare,
        currency_id: 'COP',
      },
    ],
    external_reference: tripId,
  };

  if (publicUrl) {
    payload.notification_url = `${publicUrl}/payments/webhook`;
    payload.back_urls = {
      success: `${publicUrl}/payments/result`,
      pending: `${publicUrl}/payments/result`,
      failure: `${publicUrl}/payments/result`,
    };
    payload.auto_return = 'approved';
  }

  return payload;
};
