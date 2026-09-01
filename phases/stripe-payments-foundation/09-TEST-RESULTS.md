# Resultados de pruebas

| ID | Fecha | Ambiente | Pasos | Esperado/observado | Estado | Evidencia |
|---|---|---|---|---|---|---|
| BASE-TS-01 | 2026-08-31 | local/Windows | `npm.cmd run type-check` | Compilar / compiló sin errores | PASS | salida del comando |
| BASE-LINT-01 | 2026-08-31 | local/Windows | `npm.cmd run lint` | Auditoría global / 71 errores y 3 warnings previos | FAIL BASE | lista sanitizada; fuera de alcance |
| BASE-DIFF-01 | 2026-08-31 | local/Windows | `git diff --check` | Sin whitespace inválido / solo avisos LF→CRLF | PASS | salida del comando |
| BASE-SECRET-01 | 2026-08-31 | working tree | buscar Stripe/secrets trackeados | Ninguna clave Stripe / ninguna detectada | PASS ESTÁTICO | nombres, no valores |
| UNIT-EDGE-01 | 2026-08-31 | Bun 1.3.14 | helpers URL/UUID/status/timestamp | 4 casos / 4 PASS | PASS | 9 assertions |
| UNIT-APP-01 | 2026-08-31 | Bun 1.3.14 | flag, URL, cancelación, doble tap | 4 casos / 4 PASS | PASS | 11 assertions |
| APP-TS-01 | 2026-08-31 | local/Windows | type-check tras billing | Compilar / compiló | PASS | salida del comando |
| EDGE-RUNTIME-01 | 2026-08-31 | local | `deno check`/serve | Validar Functions | NO EJECUTADO | Deno/Supabase CLI ausentes |
| DB-LOCAL-01 | 2026-08-31 | local | ejecutar migración | Esquema limpio | NO EJECUTADO | faltan CLI/Docker |
| E2E-STRIPE-01 | 2026-08-31 | Stripe/Supabase test | Checkout + webhook + DB | Estado confirmado | PENDIENTE | configuración remota y retorno |
| DOC-TRACK-01 | 2026-08-31 | working tree | `git check-ignore` sobre la carpeta de fase | Documentación incluible / excepción acotada agregada | PASS ESTÁTICO | `.gitignore` |

La decisión de aplazar el puente HTTPS no convierte `E2E-STRIPE-01` en PASS. Para cerrarlo todavía se requiere una URL HTTPS estable, configuración test remota y evidencia de webhook firmado con persistencia autoritativa.

## Revalidación después de diferir el puente web

- `bun test src/features/billing/utils/billing.utils.test.mjs supabase/functions/_shared/billing.test.ts`: 8 PASS, 0 FAIL, 20 assertions.
- `npm.cmd run type-check`: PASS.
- lint dirigido a billing, ruta de retorno y Edge Functions: PASS.
- `git diff --check`: PASS; únicamente avisos de conversión LF→CRLF del entorno Windows.
- búsqueda acotada de patrones `sk_test_`, `sk_live_` y `whsec_`: sin coincidencias.
- flujo Stripe/Supabase remoto: no ejecutado y no inferido a partir de estas pruebas.

| DB-REMOTE-OWNER-01 | 2026-08-31 | Supabase remoto | Propietario aplica migración | Migración aplicada / confirmada por propietario | REPORTADO | mensaje del propietario |
| DB-REMOTE-ANON-01 | 2026-08-31 | workspace local → Supabase | Consultar cuatro tablas con publishable key sin sesión | Relaciones existentes; `anon` no puede leer | PASS | `401`, PostgreSQL `42501 permission denied` en las cuatro tablas |
| EDGE-REMOTE-WEBHOOK-01 | 2026-08-31 | Supabase remoto | POST sin firma | Rechazar antes de procesar | PASS | `400 SIGNATURE_REQUIRED` |
| EDGE-REMOTE-CHECKOUT-01 | 2026-08-31 | Supabase remoto | POST sin sesión | Rechazar antes de Stripe | PASS | `401 AUTH_REQUIRED` |
