# Configuración Supabase

## Migración local

`202608310001_create_stripe_billing_foundation.sql` crea:

- `billing_customers`: relación 1:1 usuario/Customer Stripe.
- `billing_subscriptions`: estados Stripe autoritativos, sin entitlements.
- `billing_checkout_attempts`: guard backend-only contra solicitudes concurrentes.
- `stripe_webhook_events`: deduplicación/auditoría sin payload de pago.
- índices por usuario/estado y procesamiento.
- RLS de lectura por propietario; ninguna escritura de cliente.
- RPC backend-only para reclamar eventos y sincronizar evitando retrocesos por eventos antiguos.

## Configuración y secretos esperados

`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_TEST_PRICE_ID`, `STRIPE_CHECKOUT_SUCCESS_URL` y `STRIPE_CHECKOUT_CANCEL_URL`. Las dos URLs deben ser HTTPS y siguen pendientes. `SUPABASE_URL`, publishable/secret keys son provistos por el runtime de Edge Functions.

## Estado de ejecución

- Migración escrita: implementado localmente.
- Revisión SQL estática: realizada; la validación funcional de constraints/RLS sigue pendiente.
- Aplicación local: no ejecutada; faltan Supabase CLI y Docker.
- Aplicación remota: reportada como realizada por el propietario el 2026-08-31 y corroborada parcialmente mediante el cliente público: las cuatro tablas responden y rechazan al rol `anon` con `401 / 42501`.
- RLS con dos usuarios: pendiente.
- `STRIPE_SECRET_KEY` y `STRIPE_TEST_PRICE_ID`: configuración remota reportada por el propietario; valores no leídos ni almacenados por Codex.
- `STRIPE_WEBHOOK_SECRET`: pendiente hasta registrar el endpoint desplegado en Stripe.
- URLs HTTPS success/cancel: pendientes por decisión de diferir el puente web.
- Supabase CLI: `2.116.0` disponible temporalmente mediante `npx`; autenticación confirmada por el propietario y despliegue ejecutado.
- Edge Functions remotas: `stripe-webhook` y `create-stripe-checkout` desplegadas el 2026-08-31 mediante CLI `2.116.0` y bundling API.
- Autenticación de despliegue: webhook sin JWT de Supabase; Checkout con JWT.
- Smoke tests remotos: webhook sin firma → `400 SIGNATURE_REQUIRED`; Checkout sin sesión → `401 AUTH_REQUIRED`.

Comandos futuros, sin secretos:

```bash
supabase db reset
supabase functions serve --env-file supabase/.env.local
supabase db push
```

Test/producción deben usar proyectos y secretos separados. Esta fase no cambia ambientes remotos.
