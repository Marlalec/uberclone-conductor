# UberClone — Versión Conductor

Aplicación móvil multiplataforma (iOS y Android) inspirada en Uber, versión conductor, construida con React Native y Expo. El conductor recibe solicitudes de viaje en tiempo real, las atiende, cobra con Mercado Pago (modo de prueba) o en efectivo y consulta sus ganancias netas después de la comisión de la plataforma.

## Tecnologías

- React Native + Expo
- React Navigation (Stack, Tabs, Drawer)
- react-native-maps y Google Maps Platform (Directions, Distance Matrix)
- Firebase (Firestore y Cloud Messaging)
- Mercado Pago Checkout Pro (credenciales de prueba)
- Cloudinary para imágenes

## Requisitos

- Node.js LTS
- Expo Go en el celular o un emulador Android / iOS
- Cuenta de Google Cloud, Firebase, Cloudinary y cuentas de prueba de Mercado Pago

## Instalación

```bash
git clone https://github.com/<usuario>/uberclone-conductor.git
cd uberclone-conductor
npm install
cp .env.example .env
npx expo start
```

## Variables de entorno

Copia `.env.example` como `.env` y completa los valores. El archivo `.env` no se sube al repositorio. Las llaves secretas de la pasarela de pago (`access_token` de Mercado Pago) solo van en el backend, nunca en la app.

| Variable | Uso |
| --- | --- |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Mapas, Directions y Distance Matrix |
| `EXPO_PUBLIC_API_URL` | URL del backend de pagos |
| `EXPO_PUBLIC_FIREBASE_*` | Configuración del proyecto Firebase |
| `EXPO_PUBLIC_CLOUDINARY_*` | Subida de fotos de perfil, vehículo y documentos |

## Flujo de trabajo con Git

- `main` está protegida: los cambios entran solo por Pull Request.
- Cada funcionalidad se desarrolla en su propia rama `feature/<nombre>`.

## Uso de IA

Todo uso de herramientas de inteligencia artificial está documentado en la bitácora [docs/AI_LOG.md](docs/AI_LOG.md). Los bloques de código asistidos por IA se marcan con un comentario que remite a la entrada correspondiente.

## Backend de pagos (Mercado Pago)

El backend en `backend/` crea las preferencias de Checkout Pro y procesa las notificaciones de pago. El `access_token` de Mercado Pago y la llave de servicio de Firebase solo viven ahí, nunca en la app.

1. `cd backend && npm install`
2. Copia `backend/.env.example` como `backend/.env` y completa:
   - `MP_ACCESS_TOKEN`: access token de prueba del vendedor (Mercado Pago → Tus integraciones → Cuentas de prueba).
   - `FIREBASE_PROJECT_ID` y la llave de servicio: en Firebase → Configuración del proyecto → Cuentas de servicio, genera la llave y guárdala como `backend/serviceAccountKey.json` (está en `.gitignore`).
   - `PUBLIC_URL` (opcional): URL pública del backend (por ejemplo ngrok) para recibir el webhook; sin ella, usa el botón "Verificar pago" de la app.
3. `npm run dev`
4. En el `.env` de la app pon `EXPO_PUBLIC_API_URL=http://<IP-de-tu-PC>:3333` (el celular debe estar en la misma red) y reinicia Expo con `npx expo start -c`.

Flujo: al finalizar el viaje, la app envía `tripId` y el monto al backend; este valida el monto contra la tarifa guardada, crea la preferencia con la llave secreta y la app abre el checkout. Cuando la pasarela confirma el pago (webhook o verificación manual), el viaje queda `paid` con `paymentStatus` y `paymentId`, y la ganancia neta se suma al saldo del conductor. El pago en efectivo se confirma desde la app y descuenta la comisión del saldo (puede quedar negativo).

## Índice de Firestore para el historial

El historial y las ganancias consultan la colección `trips` por conductor, estado y fecha, y Firestore exige un índice compuesto (`driverId` ascendente, `status` ascendente, `completedAt` descendente). La primera vez que abras Historial o Ganancias, la consola de Expo muestra un enlace para crearlo; ábrelo, confirma la creación y espera a que el índice quede en estado Enabled.

## Notificaciones push (FCM)

Las solicitudes nuevas se notifican con Firebase Cloud Messaging. `@react-native-firebase/messaging` usa código nativo, así que no funciona en Expo Go: necesitas un development build con `npx expo run:android`. En Expo Go la app sigue funcionando igual, solo que sin push.

1. `npm install` (agrega `@react-native-firebase/app` y `@react-native-firebase/messaging`).
2. En la consola de Firebase → Configuración del proyecto → Tus apps, registra una app Android con el paquete `com.uberclone.conductor` y descarga `google-services.json` a la raíz del proyecto (está en `.gitignore`).
3. `npx expo run:android`.

Al iniciar sesión, la app pide el permiso de notificaciones, guarda el token en `drivers/{id}.fcmToken` y lo renueva cuando cambia. Cuando el simulador crea una solicitud, llama a `POST /notifications/trip-request` en el backend, que envía el push con la llave de servicio; así la solicitud llega aunque la app esté en segundo plano.
