# Fast-fix: sesión de Facebook al regresar a la app

## Identificación

- ID: `FF-20260824-03`
- Estado: `en progreso`
- Fecha de detección: `2026-08-24`
- Rama base: rama de trabajo local
- Commit base: cambios locales sin commit; consultar `git status`

## Problema actual

Después de aprobar correctamente Facebook, la app podía regresar al video de introducción. Facebook y Supabase habían completado el tramo externo, pero `AuthProvider` podía hidratar primero una sesión vacía y establecer `unauthenticated` antes de procesar el deep link OAuth.

La prueba posterior confirmó que la sesión sí se persistía: al cerrar y volver a abrir la app, el usuario aparecía autenticado, llegaba a Empezar y sus datos se cargaban correctamente. La causa restante era que el método OAuth expuesto por el contexto delegaba directamente al servicio y dependía del evento `onAuthStateChange`; en este retorno de Facebook el estado React no se actualizaba aunque SecureStore ya tuviera la sesión.

En un retorno que reiniciaba la app, el callback se procesaba en un efecto separado y sus errores se descartaban. Esa combinación permitía que Expo Router habilitara temporal o permanentemente las rutas públicas de onboarding.

Una segunda reproducción confirmó que el esquema `enpresenciaa` sí está incluido en el `AndroidManifest` instalado. También reveló que cualquier callback sin sesión terminaba en el índice público, que redirigía a splash/video y ocultaba la causa real. Algunos errores OAuth llegan en el parámetro estándar `error`, mientras el intercambio solo trataba como error de proveedor el campo `errorCode` de Expo.

## Comportamiento esperado

El callback OAuth debe procesarse antes de decidir que el usuario no está autenticado. Una vez creada la sesión, el guard debe llevar al usuario autenticado a Empezar, nunca al video inicial.

## Corrección mínima

- Durante un callback OAuth, mantener Auth en estado `loading`.
- Procesar `Linking.getInitialURL()` antes de la hidratación normal en un arranque en frío.
- Procesar también callbacks recibidos con la app abierta.
- Consultar nuevamente la sesión después del intercambio antes de actualizar los guards.
- Evitar reprocesar la misma URL dentro de `AuthProvider`.
- Conservar la ruta `/auth/callback` cuando el retorno contiene parámetros OAuth pero no existe sesión, en lugar de reiniciar onboarding.
- Interpretar tanto `errorCode` como `error` para mostrar el rechazo real del proveedor/Supabase.
- Tras un resultado OAuth exitoso iniciado desde la app, volver a leer la sesión y actualizar explícitamente `session` y `status` en `AuthProvider`.

## Hallazgo nativo adicional (2026-08-27)

La pantalla de Expo Development Client observada al volver de Facebook no era evidencia de que Supabase rechazara la autenticación. Los logs mostraron que el cliente instalado fallaba al reanudar porque `MainActivity` requería `expo-splash-screen`, pero el paquete nativo no estaba instalado. El launcher quedaba visible mientras la sesión ya se había persistido, lo que explica que al cerrar y abrir la app el usuario apareciera autenticado.

Se agregó `expo-splash-screen` en la versión compatible con Expo 55 y se reconstruyó e instaló el cliente Android. El nuevo arranque mantiene activa `com.enpresenciaa.app/.MainActivity` y ya no registra `SplashScreenManager`, `ClassNotFoundException` ni una excepción fatal.

## Validación

- [x] `npm.cmd run type-check` pasó.
- [x] ESLint pasó sobre provider, servicio, callback y layout de Auth.
- [x] Cliente Android reconstruido con `expo-splash-screen` enlazado.
- [x] Arranque nativo verificado sin la excepción anterior del splash screen.
- [ ] Facebook con app cerrada antes del retorno.
- [ ] Facebook con app abierta en segundo plano.
- [ ] Regresión de Google OAuth.
