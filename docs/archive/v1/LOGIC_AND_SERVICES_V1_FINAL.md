# Lógica, hooks y servicios V1

- Fecha: 2026-08-31
- Rama/HEAD: `feature/journey-journal-foundation` / `c302f0e96aa46b9afb26dc4e4f1ccf0cf726068f`
- Evidencia: inspección estática y pruebas unitarias indicadas.

## Contextos y persistencia

| Elemento | Entrada/salida/efecto | Consumidores | Validación/riesgo V2 |
|---|---|---|---|
| `AuthProvider` | URLs/eventos Supabase → session/status/user/comandos; limpia queries | root, toda app | estático; complejo por doble callback |
| `authStorage` | strings → chunks SecureStore | cliente Supabase | reutilizable; sin test unitario |
| `registerSupabaseAutoRefresh` | AppState → start/stop refresh | root layout | reutilizable |
| `queryClient` | cache retry=1/stale=60s | Profile/Journal/Billing | reutilizable |
| `storage/zustandStorage` | MMKV theme/state | no store encontrado | residual salvo theme |

## Servicios

| Servicio | Entradas → salidas | Efectos/errores | Consumidores |
|---|---|---|---|
| Auth | credenciales/provider/URL → sesión/resultados | Supabase Auth, navegador; errores normalizados | login/signup/provider/callback/profile |
| Profile | user/id/update → profile | SELECT, UPSERT, UPDATE; `ensureProfile` | hooks Profile |
| Journal | user/filter/search/page → DTO page | query view, fecha MX, `or ilike`, paginación | `useJournal` |
| Billing | attemptId → URL; userId → subscription | invoke Function/select billing | hooks Billing |

El servicio de Auth no confía en UI para identidad. Profile usa metadata Auth como semilla/fallback. `EditProfileScreen` primero guarda profile y después email; puede quedar éxito parcial y lo comunica.

## Hooks

- `useAuth`: exige provider y expone contexto.
- `useProfile`: query por user; llama `ensureProfile`, por lo que una lectura puede producir UPSERT.
- `useUpdateProfile`: mutación y actualización de caché.
- `useJournal`: infinite query de 20, búsqueda debounced 300 ms y query key aislada por user/filter/search.
- `useBillingSubscription`: query/poll cada 3 s cuando se solicita; sin límite temporal.
- `useCreateStripeCheckout`: mutación; doble tap además bloqueado por ref en UI.
- `useInvalidateBillingSubscription`: invalidación por usuario.

## Utilidades y negocio

| Área | Lógica | Nivel |
|---|---|---|
| Auth redirect | `Linking.createURL(auth/callback)` con scheme | estático |
| Sanitize Auth | allowlist de metadata/identidades | estático |
| Journal | mapeo, filtros semana/mes MX, búsqueda, estado lista | 6 tests PASS |
| Billing | HTTPS, flag dev, cancelación, lock | 4 tests PASS |
| Edge billing | UUID, status, timestamps | 4 tests PASS |
| Calendario | nivel de actividad y grilla | sin tests encontrados |
| Journey | status/opening/posiciones | hardcode mock |

## Manejo de estados

Auth distingue loading/authenticated/unauthenticated. Profile y Journal presentan loading/error/retry/empty. Billing distingue idle/opening/browser_open/cancelled/pending/confirmed/error. Home, notifications y Journey no tienen backend loading/empty porque consumen mocks; Camino sí sincroniza carga visual del asset.

## Idempotencia

- Signup/UI y OAuth usan locks de ref.
- Callback reutiliza promesa para una URL de autorización de un solo uso.
- `complete_exercise` usa idempotency UUID y advisory lock en SQL, pero no tiene consumidor UI.
- Checkout usa attempt UUID, índice parcial e idempotency keys Stripe.
- Webhook reclama `event.id` y protege contra eventos antiguos.

## Riesgos

- `complete_exercise` permite `p_completed_at` del cliente y el progreso tiene escrituras directas autenticadas; la migración posterior lo registra como deuda.
- Búsqueda Journal construye expresión PostgREST después de sanitización limitada; revisar caracteres especiales en V2.
- Tipos DB son manuales y excluyen Edge Functions del type-check principal.
- No hay logger/telemetría central ni clasificación uniforme de errores.

Referencias: `DATABASE_V1_FINAL.md`, `AUTH_V1_FINAL.md`, `PAYMENTS_V1_FINAL.md`.
