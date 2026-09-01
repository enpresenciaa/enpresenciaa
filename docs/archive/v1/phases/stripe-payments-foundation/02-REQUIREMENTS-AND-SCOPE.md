# Requisitos y alcance

## Implementar

- Checkout alojado, `mode=subscription`, precio mensual técnico de test fijado en servidor.
- Customer Stripe idempotente por `auth.users.id`.
- Checkout autenticado y webhook público con firma verificada.
- Persistencia mínima, RLS, deduplicación y eventos fuera de orden.
- Consulta móvil con React Query, navegador externo y estados honestos.
- Botón temporal doblemente protegido en Camino.

## Fuera

Live mode, plan comercial, entitlements, paywall, reembolsos, portal, cambios/cancelaciones, impuestos, IAP/Play Billing, PaymentSheet, Elements y SDK nativo Stripe.

## Reglas de confianza

La app no envía usuario, email, precio, monto, moneda ni intervalo. El redirect no confirma pago. Solo el webhook firmado puede escribir el estado de suscripción.
