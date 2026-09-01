# Configuración Stripe test

## Producto técnico temporal

Crear manualmente en Stripe test un Product identificable como `En Presenciaa - Technical Checkout Test` y un Price recurrente mensual. Guardar `price_...` solo como `STRIPE_TEST_PRICE_ID` en Supabase; nunca en la app.

Configuración propuesta para esta prueba, sin valor comercial:

- nombre: `En Presenciaa - Technical Checkout Test`;
- descripción: `Producto técnico temporal para validar Stripe Checkout en modo test`;
- precio: `10.00 MXN`;
- recurrencia: mensual;
- tipo de precio: monto fijo;
- modo: test.

El monto es deliberadamente técnico y no constituye una decisión de precio comercial. El entorno local no tiene Stripe CLI ni credenciales Stripe, por lo que la creación queda como acción manual del propietario. Codex solo necesita recibir el identificador no secreto `price_...`.

## Webhook

Endpoint futuro: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`. Eventos previstos: `checkout.session.completed` y `customer.subscription.created|updated|deleted`. El primero recupera la Subscription; nunca activa por sí solo. Invoice events se omiten porque el estado autoritativo se sincroniza desde Subscription.

Estado actual: la función ya está desplegada y rechaza solicitudes sin `Stripe-Signature`. Falta registrar su URL como destino en Stripe test y guardar el signing secret resultante como `STRIPE_WEBHOOK_SECRET` en Supabase.

## Stripe CLI local

```bash
stripe login
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook
stripe trigger customer.subscription.updated
```

Usar tarjetas oficiales de test, por ejemplo las documentadas por Stripe; no registrar datos completos de tarjeta.

## Estado

Product/Price: creados manualmente y reportados por el propietario en modo test. Se recibió un identificador `price_...` con formato válido, pero no se persistió en cliente ni documentación. Stripe CLI no está disponible en el workspace. Secretos iniciales fueron reportados como configurados; registro del endpoint, signing secret y pruebas Stripe firmadas continúan pendientes.
