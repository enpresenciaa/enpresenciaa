# Decisiones de V1 que deben preservarse

- Fecha: 2026-08-31
- Rama/HEAD: `feature/journey-journal-foundation` / `c302f0e96aa46b9afb26dc4e4f1ccf0cf726068f`
- Alcance: decisiones confirmadas por código/migración o fases; no implica conservar cada implementación.

| Decisión | Motivo/evidencia | Aplicación en V2 |
|---|---|---|
| Supabase Auth es fuente de sesión | evita token store duplicado | conservar |
| Session en SecureStore | tokens no deben ir manualmente a MMKV | conservar/adaptar |
| Estados auth loading/authenticated/unauthenticated | evita flash privado | conservar |
| Guards centralizados en layouts | no duplicar checks por pantalla | conservar, rediseñando guest |
| `auth.users` ≠ `profiles` | identidad vs datos editables | conservar |
| TanStack Query para remoto | cache/invalidation por usuario | conservar |
| No duplicar remoto en Zustand | reduce inconsistencias | conservar |
| UI presentacional por props | facilita sustituir mocks | conservar |
| Fondo debe cargar antes del contenido | evita flash blanco | generalizar |
| Completions inmutables + reflections separadas | historial confiable, reflexión editable | conservar con ajustes |
| Idempotencia en completions/Checkout/webhook | tolerar taps/retries | conservar |
| Webhook es autoridad billing | retorno navegador no confirma pago | conservar |
| Entitlements separados de billing | proveedor no debe definir acceso directo | diseñar en V2 |
| Stripe móvil solo test/guardado | cumplimiento store no resuelto | conservar restricción |
| Docs históricas no son evidencia primaria | pueden quedar desactualizadas | conservar disciplina |

## Decisiones a reconsiderar

- Onboarding completion en Auth metadata.
- Custom scheme como único deep link.
- Misma identidad/configuración para local/preview/production.
- Modelo de montaña/cuevas y estados premium mock.
- Racha/notificaciones como elementos centrales.
- Acceso obligatorio autenticado antes de tabs.

## Pendientes

Confirmar estrategia guest, entitlements, política diaria, nueva taxonomía de tabs, retiro de ATS permisivo, OAuth Apple/Facebook release y fuente de Comunidad.
