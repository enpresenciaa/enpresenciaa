# Estado actual auditado

## Repositorio

- Rama: `feature/journey-journal-foundation`.
- Base: `c302f0e feat: add journey and journal domain foundation`.
- Cambios preexistentes preservados: cinco archivos de Camino modificados y `assets/images/CaminoBG.png` no trackeado.
- `phases/` y archivos Markdown están ignorados por Git.

## App

- Expo 55, Expo Router, Supabase JS y TanStack Query.
- Scheme real: `enpresenciaa`; package/bundle: `com.enpresenciaa.app`.
- Camino vive en `/(tabs)/camino` y está bajo guards privados.
- Existe `expo-web-browser`; no existe ni se requiere SDK Stripe nativo.
- La pantalla Yo/Suscripción muestra metadata Auth ad hoc; no es fuente autoritativa y no se reutiliza como modelo billing.

## Supabase

- Migraciones existentes: Profile, Journal/Progress y Exercise foundation.
- Tipos DB son manuales en `src/types/database.ts`.
- No existían `supabase/config.toml`, `supabase/functions/` ni tablas billing.
- CLI Supabase, Deno y Docker no están instalados localmente; Bun 1.3.14 sí.

## Validación base

- TypeScript: PASS.
- `git diff --check`: PASS con avisos LF→CRLF.
- ESLint global: FAIL, 71 errores y 3 warnings preexistentes fuera de esta fase.
- Secretos Stripe trackeados: no detectados.

La documentación global de `phases/state` está desactualizada respecto al código y no se toma como evidencia primaria.
