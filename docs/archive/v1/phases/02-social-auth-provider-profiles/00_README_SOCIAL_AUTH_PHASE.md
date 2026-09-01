# En Presenciaa — Fase Social Auth y perfiles de proveedor

## Objetivo

Incorporar Facebook Login y preparar Sign in with Apple, observar de forma segura los datos que entrega cada proveedor y definir después un perfil normalizado para la aplicación.

## Estado inicial

- Email/password y Google funcionan con Supabase.
- La sesión persiste y las rutas autenticadas están protegidas.
- La finalización del onboarding se guarda en `user_metadata`.
- Existe una cuenta de Meta y una aplicación creada.
- No existe todavía una URL pública de privacidad o eliminación de datos.
- No existe membresía activa de Apple Developer ni acceso continuo a Mac.

## Resultado esperado

- Inspector de usuario disponible sólo en desarrollo y sin secretos.
- Facebook funcional en modo Development con usuarios autorizados por Meta.
- Apple implementado a nivel de código y configuración de Expo, condicionado a credenciales y prueba real en iOS.
- Comparativa documentada de los campos recibidos por Google, Facebook y Apple.
- Modelo de perfil normalizado propuesto únicamente después de observar datos reales.

## Orden de ejecución

1. Cerrar e integrar la corrección de sesión y onboarding.
2. Implementar el inspector seguro usando Google como referencia.
3. Generalizar el servicio OAuth sin cambiar el comportamiento existente.
4. Configurar e implementar Facebook.
5. Preparar Apple nativo para iOS.
6. Ejecutar pruebas por proveedor.
7. Definir la normalización del perfil.

## Reglas de alcance

- Una rama y un PR por bloque funcional.
- No exponer access tokens, refresh tokens, provider tokens ni secretos.
- No añadir App Secret de Meta, claves `.p8` o variables reales al repositorio.
- No habilitar Facebook para público general sin privacidad y eliminación de datos.
- No declarar Apple terminado sin una prueba firmada en iOS.
- Los documentos de `phases/` son locales y no forman parte de los PR.

## Criterio de cierre

La fase queda `DONE` cuando Google y Facebook estén validados, Apple tenga claramente separado lo implementado de lo pendiente, el inspector no exponga secretos y exista una decisión aprobada sobre el perfil normalizado.
