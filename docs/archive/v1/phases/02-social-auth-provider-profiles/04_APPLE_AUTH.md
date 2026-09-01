# Sign in with Apple

## Estrategia aprobada

Usar autenticación nativa en iOS mediante `expo-apple-authentication` y entregar el identity token a Supabase con `signInWithIdToken`.

## Alcance implementable ahora

- Dependencia compatible con la versión actual de Expo.
- Plugin y configuración declarativa de iOS.
- Detección de disponibilidad.
- Botón oficial de Apple sólo donde corresponda.
- Nonce seguro y validación de credenciales.
- Integración con AuthProvider, onboarding y guards.
- Captura inmediata del nombre si Apple lo entrega.
- Inspector sanitizado para los datos del proveedor.

## Consideraciones de datos

- Apple puede ocultar el correo mediante Private Relay.
- El nombre completo se entrega normalmente sólo durante la primera autorización.
- El identity token no incluye necesariamente el nombre.
- El nombre recibido debe guardarse inmediatamente en metadatos o perfil.
- La ausencia posterior de nombre no debe sobrescribir un valor ya guardado.

## Pendiente externo

- Apple Developer Program.
- App ID y capability.
- Credenciales y firma.
- Build iOS válida.
- Prueba en dispositivo real.

## Criterio de estado

- `READY_FOR_EXTERNAL_CONFIG`: código y validaciones estáticas completas.
- `READY_FOR_TEST`: build firmada disponible.
- `DONE`: inicio, persistencia, onboarding y logout verificados en iOS.
