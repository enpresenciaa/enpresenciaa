# Fast-fix: navegación de onboarding y autenticación

## Identificación

- ID: `FF-20260823-01`
- Estado: `en progreso`
- Fecha de detección: `2026-08-23`
- Rama base: rama de trabajo local
- Commit base: cambios locales sin commit; consultar `git status`

## Problemas reportados

1. El botón de regreso del video de introducción ejecutaba una acción sin historial disponible.
2. La pantalla Empezar mostraba etiquetas que ya no forman parte del diseño.
3. Un callback OAuth exitoso podía mostrar fugazmente un error antes de continuar.
4. El registro por correo no comunicaba correctamente todos los resultados de Supabase.
5. Facebook muestra que la aplicación de Meta no está activa.

## Causas confirmadas

- La ruta del video se abre con `router.replace` desde splash; no siempre existe una ruta anterior.
- El mismo callback OAuth podía llegar a `openAuthSessionAsync`, Expo Linking y la ruta de callback. El código de autorización es de un solo uso.
- Supabase no entrega sesión al registrarse cuando está habilitada la confirmación de correo. Para una cuenta confirmada ya existente también puede devolver una respuesta ofuscada sin identidades.
- El rechazo de Facebook ocurre en `m.facebook.com`: la aplicación de Meta está inactiva o la cuenta no tiene un rol autorizado.

## Corrección mínima

- Eliminar el botón de regreso del video.
- Conservar únicamente el botón animado en Empezar.
- Hacer idempotente en memoria el procesamiento del último callback OAuth.
- Detectar la respuesta de registro de una cuenta existente y navegar explícitamente cuando Supabase sí devuelve sesión.

## Validación pendiente

- [x] `npm.cmd run type-check` pasó.
- [x] ESLint pasó sobre los cuatro archivos modificados.
- [ ] Probar navegación video → bienvenida sin acción de regreso.
- [ ] Probar registro nuevo con confirmación de correo activada y desactivada.
- [ ] Probar Google OAuth sin pantalla de error transitoria.
- [ ] Activar Meta App o probar Facebook con una cuenta administradora/desarrolladora/tester.

## Verificación pública de configuración — 2026-08-25

- Signup: habilitado.
- Email/password: habilitado.
- Confirmación automática de correo (`mailer_autoconfirm`): desactivada.
- Resultado esperado del formulario: crear usuario pendiente de confirmación y devolver `session: null`; la app debe pedir revisar el correo y volver a Login.
- Validación manual confirmada el 2026-08-25: el usuario creado mediante el formulario pudo confirmar su correo e iniciar sesión.
- El registro ahora envía `emailRedirectTo` al callback móvil para evitar terminar en una página en blanco después de confirmar.
- El mensaje de la app fue reemplazado por instrucciones en español con el correo destino y revisión de spam.
- Se agregó una plantilla versionada de confirmación en `supabase/templates/confirmation.html`; debe aplicarse en el Dashboard del proyecto alojado.
- Si otro entorno habilita confirmación automática y Supabase devuelve sesión, `AuthProvider` vuelve a leerla y actualiza explícitamente sus guards antes de continuar.

No se creó una cuenta automática durante esta verificación para evitar dejar usuarios basura o enviar correo a una dirección no controlada.

El lint global continúa fallando por errores preexistentes fuera de este fast-fix (`app-env.ts`, `eas.json`, plugins y componentes de Home, entre otros). No se modificaron para evitar ampliar el alcance.

## Configuración externa de Facebook

En Meta for Developers, confirmar el modo de la app. Mientras esté en desarrollo solo pueden iniciar sesión cuentas con rol asignado y que hayan aceptado la invitación. Para público general se requiere publicar la app y completar los requisitos/revisión que Meta solicite. También deben coincidir el App ID/secret configurados en Supabase y la URL de callback de Supabase autorizada en Facebook Login.
