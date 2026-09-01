# Decisión de cumplimiento móvil

## Decisión

Stripe Checkout se valida solamente como arquitectura web/test. `Pagar prueba` debe requerir simultáneamente `__DEV__` y `EXPO_PUBLIC_ENABLE_STRIPE_TEST_CHECKOUT=true`, cuyo valor por defecto es `false`. No se usará para desbloquear ejercicios.

## Evidencia oficial consultada el 2026-08-31

- Apple 3.1.1 trata suscripciones y contenido premium digital como In-App Purchase, con excepciones y entitlements dependientes de storefront.
- Google Play incluye suscripciones y contenido digital en Play Billing salvo programas/excepciones aplicables.
- La política varía por región y programa; esta fase no afirma aprobación de publicación.

Fuentes: Stripe Checkout/Fulfillment, Supabase Edge Functions Auth/Webhooks, Expo Linking, Apple App Review Guidelines y Google Play Payments Policy indicadas en el prompt de fase.

## Pendiente de producción

Definir estrategia por plataforma, storefront y región con revisión legal/políticas vigente. No ampliar aquí a Apple IAP o Google Play Billing.
