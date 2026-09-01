# Log de implementación

## 2026-08-31 — Auditoría

- Motivo: comprobar el repositorio antes de diseñar billing.
- Evidencia: rama `feature/journey-journal-foundation`, base `c302f0e`, seis cambios de Camino preservados.
- Resultado: no había billing, Functions ni config Supabase local; type-check PASS; lint global FAIL por deuda previa.
- Decisión: Checkout alojado sin SDK nativo, React Query y botón dev/flag.

## 2026-08-31 — Cumplimiento y arquitectura

- Fuentes: documentación oficial Stripe, Supabase, Expo, Apple y Google.
- Resultado: Stripe queda limitado a test; retorno no autoritativo; webhook firmado obligatorio.
- Problema: falta dominio HTTPS controlado para retorno.

## 2026-08-31 — Modelo local

- Archivo: `supabase/migrations/202608310001_create_stripe_billing_foundation.sql`.
- Resultado: tablas, RLS, deduplicación y protección de orden diseñadas.
- Evidencia pendiente: ejecución SQL/RLS; CLI y Docker no disponibles.

## 2026-08-31 — Edge Functions

- Archivos: `create-stripe-checkout`, `stripe-webhook`, helpers compartidos y `supabase/config.toml`.
- Resultado: JWT de usuario validado, precio fijo servidor, Customer/Checkout idempotentes, firma con cuerpo crudo, claim de eventos y sincronización autoritativa.
- Evidencia: 4 pruebas de helpers PASS; lint dirigido PASS tras formato.
- No ejecutado: runtime Deno, Stripe API, Supabase local/remoto.

## 2026-08-31 — App móvil

- Archivos: feature `billing`, ruta `/billing/return`, flag de entorno, botón temporal en Camino y limpieza de caché en logout.
- Resultado: URL HTTPS validada, doble tap bloqueado, estados cancelado/pendiente/error/confirmado e invalidación React Query.
- Evidencia: 4 pruebas de helpers móviles PASS; type-check PASS.
- Bloqueo: falta página/dominio HTTPS que conecte Stripe con el deep link.

## 2026-08-31 — Continuación sin puente web

- Decisión del propietario: continuar con la validación local y diferir la creación de la página HTTPS de retorno.
- Resultado: no se inventó ni codificó un dominio; `STRIPE_CHECKOUT_SUCCESS_URL` y `STRIPE_CHECKOUT_CANCEL_URL` siguen siendo configuración obligatoria exclusiva del servidor.
- Alcance verificable: código, pruebas automatizadas y revisión estática pueden continuar.
- Limitación: Checkout real, retorno navegador→app y confirmación autoritativa E2E permanecen pendientes.
- Corrección documental: se agregó una excepción acotada en `.gitignore` para que esta carpeta obligatoria pueda incluirse en una futura PR.

## 2026-08-31 — Migración remota reportada

- El propietario confirmó que aplicó la migración en Supabase.
- Clasificación: reportado por el propietario; no validado automáticamente por Codex.
- Corroboración: usando `.env.local`, las tablas `billing_customers`, `billing_subscriptions`, `billing_checkout_attempts` y `stripe_webhook_events` respondieron desde el proyecto remoto.
- Seguridad observada: el rol `anon` recibió `401 / 42501 permission denied` en las cuatro relaciones.
- Pendiente: comprobar lectura aislada entre dos usuarios autenticados y escrituras reservadas al backend.

## 2026-08-31 — Preparación de Product/Price test

- El propietario autorizó continuar con la configuración técnica de Stripe test.
- Diagnóstico: Stripe CLI no está instalado y `.env.local` no contiene credenciales Stripe.
- Resultado: se definió una configuración manual temporal de `10.00 MXN` mensual, explícitamente no comercial.
- Pausa: el propietario debe crear Product/Price en modo test y compartir únicamente el identificador `price_...`.

## 2026-08-31 — Product/Price test creado

- El propietario proporcionó el Price ID test y su formato `price_...` fue validado.
- El valor no se agregó al código móvil, variables `EXPO_PUBLIC_*`, documentación ni archivos trackeables.
- Siguiente pausa obligatoria: configurar `STRIPE_SECRET_KEY` y `STRIPE_TEST_PRICE_ID` como secretos remotos de Supabase.

## 2026-08-31 — Secretos iniciales reportados

- El propietario confirmó la configuración remota de `STRIPE_SECRET_KEY` y `STRIPE_TEST_PRICE_ID`.
- Codex no leyó, imprimió ni persistió sus valores.
- Revisión de despliegue: `create-stripe-checkout` exige JWT; `stripe-webhook` debe desplegarse sin verificación JWT de Supabase para aceptar solicitudes firmadas por Stripe.
- Próxima acción con autorización separada: desplegar Edge Functions; el webhook todavía no procesará eventos hasta configurar su signing secret.

## 2026-08-31 — Preparación del despliegue de Functions

- Autorización: el propietario autorizó instalar/ejecutar temporalmente Supabase CLI y desplegar ambas Edge Functions.
- Evidencia: `npx supabase --version` devolvió `2.116.0`.
- Bloqueo seguro: `supabase projects list` indicó que falta autenticación; no se solicitó ni expuso un access token en el chat.
- Acción del propietario: ejecutar `npx supabase login` directamente en su terminal y confirmar cuando termine.

## 2026-08-31 — Edge Functions desplegadas

- Autenticación de Supabase CLI confirmada por el propietario.
- `stripe-webhook`: desplegada con `--no-verify-jwt --use-api`.
- `create-stripe-checkout`: desplegada con verificación JWT predeterminada y `--use-api`.
- Smoke test webhook: POST sin firma rechazado con `400 SIGNATURE_REQUIRED`.
- Smoke test Checkout: POST sin bearer de usuario rechazado con `401 AUTH_REQUIRED`.
- No se creó Customer, Checkout Session, suscripción ni evento durante estas pruebas negativas.
