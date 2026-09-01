# Archivos cambiados

| Ruta | Responsabilidad | Motivo/riesgo |
|---|---|---|
| `supabase/migrations/202608310001_create_stripe_billing_foundation.sql` | Persistencia, RLS y RPC backend-only | Autoridad webhook; requiere validar/aplicar antes de desplegar Functions |
| `supabase/config.toml` | JWT requerido en Checkout y desactivado en webhook firmado | Config crítica de autenticación |
| `supabase/functions/_shared/*` | Validación, HTTP y pruebas puras | No contiene secretos |
| `supabase/functions/create-stripe-checkout/index.ts` | Crea Customer y Checkout desde identidad validada | Requiere secretos y migración |
| `supabase/functions/stripe-webhook/index.ts` | Verifica firma y sincroniza suscripción | Endpoint público; la firma es obligatoria |
| `.env.example`, `src/config/env.ts` | Flag pública apagada por defecto | No es secreto; además exige `__DEV__` |
| `src/features/billing/*` | Servicio, queries, UI, tipos y pruebas | Estado remoto no se duplica en Zustand |
| `src/app/billing/return.tsx`, `src/app/_layout.tsx` | Retorno privado y consulta autoritativa | No confía en query params para activar |
| `src/features/journey/screens/JourneyScreen.tsx` | Botón temporal | Sin rediseño; invisible por defecto |
| `src/components/onboarding/AppButton.tsx` | Label accesible opcional | Cambio compatible con usos existentes |
| `src/features/auth/providers/AuthProvider.tsx` | Limpia caché billing al salir | Evita datos entre usuarios |
| `src/types/database.ts` | Tipos manuales billing/RPC | Deben regenerarse si cambia el SQL |
| `tsconfig.json`, `supabase/functions/deno.json` | Separa TypeScript Expo de Deno | Deno debe validarse con su runtime |
| `phases/stripe-payments-foundation/*` | Decisiones, setup, evidencia y pendientes | Documentación ignorada por Git; no sustituye configuración remota |

Los cambios preexistentes de `src/features/journey/*` y `assets/images/CaminoBG.png` pertenecen al usuario y no fueron revertidos.
