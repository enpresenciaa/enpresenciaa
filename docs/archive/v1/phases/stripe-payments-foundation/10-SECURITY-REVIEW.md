# Revisión de seguridad

## Controles diseñados

- Precio, moneda e intervalo solo en secreto servidor.
- Identidad derivada del JWT validado; no del body.
- Webhook sin JWT pero con cuerpo crudo y firma Stripe obligatoria.
- IDs Stripe únicos, eventos reclamados atómicamente y orden monotónico.
- Clientes autenticados solo leen filas propias; escrituras billing backend-only.
- Sin PAN, CVC, payload completo ni secretos en tablas/logs/respuestas.
- Redirect no concede acceso.

## Pendientes

Revisión SQL ejecutada, pruebas RLS A/B, firmas reales, inspección de logs, rotación de secretos, rate limiting y validación de dominio HTTPS.

## Hallazgos existentes fuera de fase

ATS iOS permite cargas arbitrarias; ambientes comparten identidad; `.env.local` está ignorado. No se modifican sin alcance/autorización.
