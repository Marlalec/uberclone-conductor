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
