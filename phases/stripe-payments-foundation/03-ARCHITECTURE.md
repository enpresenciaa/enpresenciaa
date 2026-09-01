# Arquitectura

```text
Camino (__DEV__ + flag)
  → billing mutation (attempt UUID)
  → Supabase Function create-stripe-checkout (JWT usuario)
     → Customer Stripe idempotente + billing_customers
     → Checkout Session subscription con Price secreto
  → navegador HTTPS
  → página HTTPS de retorno (pendiente URL)
  → enpresenciaa://billing/return
  → estado "confirmando" + invalidación React Query

Stripe
  → stripe-webhook (sin JWT Supabase)
     → cuerpo crudo + Stripe-Signature
     → claim atómico de event.id
     → recupera/sincroniza Subscription
     → billing_subscriptions (orden por event.created)
```

## Responsabilidades

- App: solicita un intento, valida URL HTTPS, abre navegador y consulta estado. No decide precio ni activación.
- Checkout Function: valida JWT, deriva user ID, reutiliza Customer y crea sesión con configuración secreta.
- Webhook Function: autentica a Stripe por firma, deduplica y persiste el objeto autoritativo.
- PostgreSQL: constraints, RLS, auditoría mínima y rechazo de eventos antiguos.
- Stripe: cobro test y ciclo de vida de la suscripción.

## Idempotencia y errores

Customer usa clave estable por usuario. Checkout usa `attemptId` UUID: reintentos del mismo intento reciben la misma operación; un intento nuevo crea otra sesión. El cliente bloquea doble tap. Eventos fallidos pueden reclamarse otra vez; procesados/ignorados se consideran duplicados. Los errores HTTP son códigos sanitizados.

## Retorno

Se requiere HTTPS controlado con fallback a `enpresenciaa://billing/return`. Falta la URL y no se inventará. App abierta/fría convergen en una ruta privada de retorno que invalida la consulta.

## Archivos previstos

`supabase/migrations/*billing*`, `supabase/functions/create-stripe-checkout`, `supabase/functions/stripe-webhook`, `src/features/billing/*`, `src/app/billing/return.tsx` y una integración mínima en JourneyScreen.
