# Bitácora de uso de IA - UberClone Versión Conductor

- Proyecto: UberClone Versión Conductor (React Native + Expo)
- Integrante: Marlon Castañeda
- Herramienta: Claude (Anthropic), usado desde claude.ai con acceso a la carpeta del proyecto y al navegador
- Periodo: 8 al 17 de noviembre de 2026

## Cómo se trabajó

El integrante definió las fases y su orden, revisó el resultado, probó la app en su celular con Expo Go, reportó los errores con su mensaje exacto y tomó las decisiones de alcance, diseño y proveedores. Claude generó el código de las funcionalidades a partir de esos pedidos. Las demás entradas registran consultas, decisiones, revisiones y corrección de errores.

La configuración inicial del proyecto (commits del 4 y 5 de noviembre) es anterior a estas sesiones y no está cubierta por esta bitácora.

## Resumen

| # | Fecha | Tipo | Tema | Commit |
|---|-------|------|------|--------|
| 1 | 2026-11-08 | Consulta | Revisión del taller y división en fases | - |
| 2 | 2026-11-12 | Consulta | Directions y Distance Matrix frente a Routes API | - |
| 3 | 2026-11-15 | Decisión | OSRM en lugar de Google Directions y Distance Matrix por el cobro | Pendiente |
| 4 | 2026-11-16 | Revisión | Cuatro fallas de lógica detectadas por el integrante | Pendiente |
| 5 | 2026-11-16 | Bug | Expo no arrancaba y Firebase nativo fallaba en Expo Go | Pendiente |
| 6 | 2026-11-16 | Bug | El registro no subía las fotos | Pendiente |
| 7 | 2026-11-16 | Bug | Idioma, carro, ganancias y filtros reportados en el celular | Pendiente |
| 8 | 2026-11-17 | Consulta | Saldo negativo del conductor | - |
| 9 | 2026-11-17 | Verificación | Pago con Mercado Pago de principio a fin | - |
| 10 | 2026-11-17 | Consulta | Login, varios usuarios y bitácora | - |

"Pendiente" indica que el cambio está en la rama `feature/trip-requests` y se completa con el hash al hacer el commit.

## Declaración sobre datos sensibles

La regla de la bitácora pide no pegar en un prompt llaves de API, `access_token` ni datos personales reales. Durante el trabajo esa regla no se cumplió del todo: se compartieron fotos del documento de identidad del integrante para un trámite en Mercado Pago, se adjuntó la llave de servicio de Firebase, Claude leyó el `access_token` de prueba de Mercado Pago desde el panel de developers, y el número de documento real se usó como identificador del conductor en las pruebas. Ninguno de esos datos se copia aquí. Los archivos con credenciales están en `.gitignore` y la llave de servicio de Firebase se reemplazará al cerrar el proyecto.

---

### Entrada #1
- Fecha: 2026-11-08
- Integrante: Marlon Castañeda
- Herramienta: Claude
- Objetivo: Recordar el enunciado del taller y conocer el estado real del repositorio.
- Prompt: "recuerdas este trabajo ???" (con el PDF del taller adjunto) y "bueno quiero que lo dividas en fases para que veas su estado esta es la siguiente ruta C:\Users\marlo\Documents\Repos U\uberclone-conductor"
- Resumen de la respuesta: Claude leyó el PDF y el repositorio, y propuso ocho fases: registro, disponibilidad y ubicación, solicitudes, navegación, pagos, ganancias e historial, perfil y notificaciones, y entrega.
- Qué se usó / modificó / descartó: Se usó la división en fases como plan de trabajo. El integrante decidió el orden y aplazó la bitácora para el final.
- Archivos y commit: Ninguno.
- Verificación: Comparación de las fases con las secciones del PDF.
- Aprendizaje: _Por completar por el integrante._

### Entrada #2
- Fecha: 2026-11-12
- Integrante: Marlon Castañeda
- Herramienta: Claude
- Objetivo: Decidir qué API de Google usar para distancia y rutas.
- Prompt: "sigue lo que dice el pdf solo lo que pide el pdf"
- Resumen de la respuesta: Claude advirtió que Distance Matrix y Directions estaban marcadas como versión Legacy y que Google recomendaba Routes API. Por la instrucción del integrante, se usaron Distance Matrix y Directions como pide el PDF.
- Qué se usó / modificó / descartó: Se usaron Distance Matrix y Directions. Se descartó Routes API en ese momento. La decisión se revisó en la entrada #3.
- Archivos y commit: `src/services/distanceMatrixService.js`, `src/services/directionsService.js` - 2c5b1f1
- Verificación: Revisión del PDF, que nombra las dos APIs en las secciones 1 y 5.
- Aprendizaje: _Por completar por el integrante._

### Entrada #3
- Fecha: 2026-11-15
- Integrante: Marlon Castañeda
- Herramienta: Claude
- Objetivo: Calcular distancia, duración y ruta sin pagar Google Maps Platform.
- Prompt: "ven eso gratuito no es me trato de cobrar 98" y "bueno quiero que termines con el proyecto"
- Resumen de la respuesta: Al intentar habilitar las APIs, la consola de Google indicó que desde octubre de 2026 Distance Matrix (Legacy) ya no se puede habilitar en proyectos nuevos. Su reemplazo, Routes API, exige verificar la cuenta con datos de pago, y al registrar la tarjeta la página le mostró al integrante un cobro de 98. Claude presentó tres caminos: usar una tarjeta con saldo limitado, cambiar a un proveedor gratuito o consultar al profesor. El integrante decidió no registrar tarjeta.
- Qué se usó / modificó / descartó: Se usó OSRM (`router.project-osrm.org`), gratuito y sin llave, para la matriz de distancia y las rutas. Las direcciones se obtienen con `reverseGeocodeAsync` de `expo-location`. El PDF lista "OSRM u OpenRouteService" como alternativa gratuita en la sección 7, pero las secciones 1 y 5 nombran Google Directions y Distance Matrix, así que esta es una diferencia con el enunciado. Se descartó la migración a Routes API, y se eliminó `googleMapsClient.js`.
- Archivos y commit: `src/services/routingClient.js`, `src/services/distanceMatrixService.js`, `src/services/directionsService.js`, `src/services/addressService.js`, `src/services/tripsService.js`, `README.md` - pendiente
- Verificación: Pruebas con Node y respuestas simuladas de OSRM, incluidos los casos de error. En el celular se trazaron rutas reales (1,4 km y 1,6 km) y se calcularon tarifas.
- Aprendizaje: _Por completar por el integrante._

### Entrada #4
- Fecha: 2026-11-16
- Integrante: Marlon Castañeda
- Herramienta: Claude
- Objetivo: Corregir cuatro fallas de lógica que el integrante encontró al revisar el código.
- Prompt: "A nivel de código quedan cuatro correcciones concretas: Prioridad Pendiente Qué debes cambiar Alta Aceptación de solicitudes vencidas En src/services/tripsService.js, validar expiresAtMs dentro de la transacción antes de aceptar. Actualmente solo comprueba el estado. Alta Validación del pago recibido En backend/src/paymentsService.js, comparar el monto y la moneda del pago con la tarifa del viaje antes de marcarlo paid y sumar el saldo. Reproduje que acepta un pago con valores diferentes. Media Comisión correspondiente al viaje En src/utils/calculateFare.js y el cierre del viaje, usar el commissionRate guardado en ese viaje, evitando recalcular con un porcentaje global que pudo cambiar. Media Calificación del pasajero En src/services/tripsService.js, retirar la calificación aleatoria. Guardar la recibida o dejarla pendiente; si se simula para la demostración, debe ser explícito y permitir valores de 1 a 5."
  Seguimiento: "Solo queda este ajuste en esos cuatro puntos: en acceptTrip, cambiar: Date.now() > trip.expiresAtMs por: Date.now() >= trip.expiresAtMs tambien ten presente que los carros pueden ser modelo 2026 para abajo" y "dejalo en año actual"
- Resumen de la respuesta: Claude validó el vencimiento dentro de la transacción y rechaza la solicitud vencida. Comparó monto y moneda del pago antes de marcarlo pagado y sumar el saldo. Hizo que `calculateFare` reciba la comisión guardada en el viaje. Cambió la calificación a pendiente, con la función `rateTrip` (enteros de 1 a 5) y un botón explícito de simulación.
- Qué se usó / modificó / descartó: Se usaron las cuatro correcciones. El integrante cambió la condición de vencimiento a `>=`. Se descartó fijar 2026 como año máximo del vehículo y se mantuvo el año actual.
- Archivos y commit: `src/services/tripsService.js`, `src/services/tripSimulator.js`, `src/utils/calculateFare.js`, `src/screens/trip/TripRequestScreen.js`, `src/screens/trip/TripSummaryScreen.js`, `backend/src/payments.js`, `backend/src/paymentsService.js` - pendiente
- Verificación: El integrante probó el vencimiento antes, en el límite exacto y después, y la validación del pago con montos y monedas distintos. Claude probó con Node la comisión guardada y la validación del pago, y compiló la app.
- Aprendizaje: _Por completar por el integrante._

### Entrada #5
- Fecha: 2026-11-16
- Integrante: Marlon Castañeda
- Herramienta: Claude
- Objetivo: Arrancar la app en Expo Go.
- Prompt: Salida de la terminal: "PluginError: Failed to resolve plugin for module \"@react-native-firebase/app\" relative to \"C:\Users\marlo\Documents\Repos U\uberclone-conductor\". Do you have node modules installed?" y luego el error en pantalla: "Native module NativeRNFBTurboApp is not registered."
- Resumen de la respuesta: El primer error se debía a dependencias agregadas al `package.json` y no instaladas; se resolvió con `npm install`. El segundo ocurre porque `@react-native-firebase` es código nativo que no existe en Expo Go, y el `try/catch` no evitaba que Expo mostrara el error al cargar el módulo. Claude hizo que el servicio de notificaciones consulte primero `TurboModuleRegistry.get` y solo cargue el módulo si existe.
- Qué se usó / modificó / descartó: Se usó la corrección. Las notificaciones push quedan disponibles solo en un build de desarrollo.
- Archivos y commit: `src/services/notificationsService.js` - pendiente
- Verificación: La app abrió en el celular con Expo Go en la pantalla de registro.
- Aprendizaje: _Por completar por el integrante._

### Entrada #6
- Fecha: 2026-11-16
- Integrante: Marlon Castañeda
- Herramienta: Claude
- Objetivo: Corregir el envío del registro, que fallaba con "No se pudo enviar el registro, revisa tu conexión e intenta de nuevo".
- Prompt: Captura de la pantalla con el error, y luego la salida de la terminal: "ERROR registerDriver UPLOAD_FAILED [Error: Unsupported FormDataPart implementation]"
- Resumen de la respuesta: Claude agregó primero un registro de la causa en la consola, porque el mensaje de la app era genérico. Con el error real identificó que esta versión de React Native ya no acepta el objeto `{ uri, name, type }` dentro de `FormData`. Cambió el selector de fotos para entregar la imagen en base64 y la subida para enviarla como texto a Cloudinary.
- Qué se usó / modificó / descartó: Se usó la corrección. Se descartaron la sospecha inicial sobre el formato HEIC de iOS y la revisión de las reglas de Firestore, que estaban bien.
- Archivos y commit: `src/components/PhotoField.js`, `src/services/cloudinaryService.js`, `src/screens/register/DocumentsScreen.js` - pendiente
- Verificación: Claude probó en el navegador que Cloudinary acepta la imagen en base64 con el preset del proyecto. El integrante completó el registro en el celular y las fotos quedaron en Cloudinary.
- Aprendizaje: _Por completar por el integrante._

### Entrada #7
- Fecha: 2026-11-16
- Integrante: Marlon Castañeda
- Herramienta: Claude
- Objetivo: Resolver cuatro problemas que el integrante vio al probar en el celular.
- Prompt: "Varias cosas Uno no veo que cambie de idioma Dos no veo el carro con la simulación de viaje Tres veo un error en las ganancias Cuatro veo un error en ellos filtro" (con capturas de Perfil, Ganancias e Historial)
- Resumen de la respuesta: Los puntos tres y cuatro eran el mismo: faltaba el índice compuesto de Firestore (`driverId`, `status`, `completedAt` descendente), que Claude creó en la consola de Firebase. Los botones de periodo en Ganancias se estiraban hasta abajo y se corrigieron. El carro no existía porque el mapa solo mostraba la ubicación real, así que se agregó un marcador que recorre la ruta. El idioma solo se guardaba y no traducía nada; se resolvió con una implementación de traducción que no tiene una entrada independiente en este extracto.
- Qué se usó / modificó / descartó: Se usaron las correcciones. El carro se identifica en el mapa como "Conductor (simulado)".
- Archivos y commit: `src/components/FilterChips.js`, `src/hooks/useRouteSimulation.js`, `src/screens/trip/TripInProgressScreen.js` - pendiente
- Verificación: Ganancias e Historial cargaron sin error cuando el índice quedó habilitado. El integrante vio el carro moverse en un viaje nuevo.
- Aprendizaje: _Por completar por el integrante._

### Entrada #8
- Fecha: 2026-11-17
- Integrante: Marlon Castañeda
- Herramienta: Claude
- Objetivo: Entender el saldo negativo en la pantalla Ganancias.
- Prompt: "Este cálculo no me cuadra" (con captura del saldo de $ -5.380) y "Como que menos ?"
- Resumen de la respuesta: Claude explicó que la tarjeta de "Hoy" muestra solo el viaje del día, mientras que el saldo acumula todos los viajes. En un viaje en efectivo el conductor recibe la tarifa completa y le debe la comisión a la plataforma, por eso el saldo baja. En uno con Mercado Pago la plataforma recibe el dinero y le debe la ganancia al conductor, por eso sube. Dos viajes en efectivo dieron 2.260 + 3.120 = 5.380 en comisiones adeudadas.
- Qué se usó / modificó / descartó: Sin cambios de código. Se confirmó que el cálculo seguía la sección 4 del PDF.
- Archivos y commit: Ninguno.
- Verificación: Cálculo manual con los valores de los dos viajes.
- Aprendizaje: _Por completar por el integrante._

### Entrada #9
- Fecha: 2026-11-17
- Integrante: Marlon Castañeda
- Herramienta: Claude
- Objetivo: Confirmar que el pago con Mercado Pago funciona de principio a fin.
- Prompt: "Pago con Mercado Pago de principio a fin. Abriste el checkout, pero no me confirmaste si el pago quedó aprobado, si \"Verificar pago\" actualizó el viaje y si subió el saldo." (fragmento de una respuesta de Claude) y "abre mercado pago y verifica esto"
- Resumen de la respuesta: Claude revisó en Firestore los viajes del conductor. Los dos pagos hechos con el comprador de prueba quedaron aprobados, con su identificador de pago, y el saldo guardado (18.860) coincide con la suma de ganancias de Mercado Pago menos las comisiones de los viajes en efectivo.
- Qué se usó / modificó / descartó: Sin cambios de código. Claude señaló que las reglas de Firestore permiten leer y escribir sin autenticación hasta el 5 de diciembre de 2026.
- Archivos y commit: Ninguno.
- Verificación: El integrante pagó en el checkout con el comprador de prueba y tocó "Verificar pago". Claude comparó los datos guardados con el cálculo esperado.
- Aprendizaje: _Por completar por el integrante._

### Entrada #10
- Fecha: 2026-11-17
- Integrante: Marlon Castañeda
- Herramienta: Claude
- Objetivo: Revisar si el taller exige login o varios usuarios, y qué pide la bitácora.
- Prompt: "el taller menciona alfo de login ?? o multiplex usuarios ?", "que dice del tema de la bitacora exactamente ??" y "dame las especificaciones de las bitacora y lo que necesita ??"
- Resumen de la respuesta: Claude buscó en el PDF y confirmó que no pide login con contraseña ni varios usuarios: solo la sesión en contexto y AsyncStorage, y el cierre de sesión en el perfil. Señaló que después de cerrar sesión no hay forma de volver a entrar. Resumió la sección 8 y propuso el formato de esta bitácora.
- Qué se usó / modificó / descartó: Se usó el formato. La entrada para volver a iniciar sesión queda como decisión pendiente del integrante.
- Archivos y commit: `docs/AI_LOG.md` - pendiente
- Verificación: Búsqueda en el texto completo del PDF.
- Aprendizaje: _Por completar por el integrante._
