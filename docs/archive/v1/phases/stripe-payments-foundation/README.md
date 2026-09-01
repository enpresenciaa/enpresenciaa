# Stripe Checkout foundation

- Fecha de inicio: 2026-08-31
- Rama: `feature/journey-journal-foundation`
- Commit base: `c302f0e`
- Estado: en progreso; implementación local, sin despliegues remotos

## Alcance

Base técnica en modo test para abrir Stripe Checkout alojado desde Camino, recibir webhooks firmados en Supabase y exponer a la app el estado remoto confirmado. No desbloquea contenido ni define precios comerciales.

## Arquitectura

App autenticada → Edge Function Checkout → Stripe Checkout → webhook firmado → tablas billing con RLS → React Query. El retorno solo inicia una consulta; nunca confirma el pago.

## Estado y resultados

- Implementado: migración local de billing con RLS, deduplicación y protección de orden de eventos.
- En progreso: Edge Functions y cliente móvil.
- Validado: auditoría inicial; type-check base PASS; lint global base FAIL por 71 errores preexistentes.
- No ejecutado: migración remota, Stripe test, webhook real y flujo E2E.
- Bloqueado para retorno E2E: falta URL HTTPS de un dominio controlado.

Consulta los documentos numerados para configuración, evidencia y pendientes.
