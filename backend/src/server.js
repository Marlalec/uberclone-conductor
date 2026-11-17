import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { MERCADO_PAGO_ERROR } from './mercadoPago.js';
import { sendTripRequestNotification } from './notificationsService.js';
import {
  AMOUNT_MISMATCH,
  TRIP_NOT_FOUND,
  TRIP_NOT_PAYABLE,
  createTripPreference,
  processWebhook,
  syncTripPayment,
} from './paymentsService.js';

const ERROR_RESPONSES = {
  [TRIP_NOT_FOUND]: { status: 404, error: 'El viaje no existe' },
  [TRIP_NOT_PAYABLE]: { status: 409, error: 'El viaje no está pendiente de cobro' },
  [AMOUNT_MISMATCH]: { status: 409, error: 'El monto no coincide con la tarifa del viaje' },
  [MERCADO_PAGO_ERROR]: { status: 502, error: 'Mercado Pago rechazó la operación, revisa el access token' },
};

const handleError = (res, error) => {
  const known = ERROR_RESPONSES[error.message];
  if (known) {
    return res.status(known.status).json({ error: known.error });
  }
  console.error(error);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/payments/preference', async (req, res) => {
  const { tripId, amount } = req.body ?? {};
  if (!tripId) {
    return res.status(400).json({ error: 'tripId es obligatorio' });
  }
  try {
    res.json(await createTripPreference(tripId, amount));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/payments/webhook', async (req, res) => {
  try {
    await processWebhook({ body: req.body, query: req.query });
    res.sendStatus(200);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/payments/sync', async (req, res) => {
  const { tripId } = req.body ?? {};
  if (!tripId) {
    return res.status(400).json({ error: 'tripId es obligatorio' });
  }
  try {
    res.json(await syncTripPayment(tripId));
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/notifications/trip-request', async (req, res) => {
  const { tripId } = req.body ?? {};
  if (!tripId) {
    return res.status(400).json({ error: 'tripId es obligatorio' });
  }
  try {
    res.json(await sendTripRequestNotification(tripId));
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/payments/result', (req, res) => {
  res.send('<html><body style="font-family:sans-serif;text-align:center;padding-top:40px"><h2>Pago procesado</h2><p>Ya puedes volver a la app del conductor.</p></body></html>');
});

const port = process.env.PORT ?? 3333;
app.listen(port, () => {
  console.log(`Backend de pagos escuchando en el puerto ${port}`);
});
