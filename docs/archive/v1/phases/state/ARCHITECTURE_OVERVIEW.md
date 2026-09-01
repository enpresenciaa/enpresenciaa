# Arquitectura resumida

En Presenciaa es una app Expo/React Native organizada por rutas y dominios. Expo Router decide pantallas; AuthProvider decide acceso; hooks coordinan estado remoto; servicios encapsulan Supabase; componentes reciben datos por props.

```text
Expo Router
  ↓
Pantallas por feature
  ↓
Auth Context / React Query
  ↓
Servicios Auth y Profile
  ↓
Supabase Auth + PostgreSQL con RLS
```

Auth y Profile ya siguen esta arquitectura. Home y Notificaciones aún leen mocks directamente.

Camino sigue una arquitectura local presentacional:

```text
JourneyRoute → JourneyScreen (mock + perspectiva + navegación)
  → CaminoMap (viewport + scroll + cámara Reanimated)
    → una escena: MapBackground + LevelOverlay/LevelNode
    → MapLoadingState / CloudReveal
LevelRoute → LevelScreen parametrizada → mock de ejercicios
```

`journey` y `level-focus` son estado local efímero. Panorama fue retirado tras validación visual. Fondo, overlay y nodos se transforman juntos; `scrollY` permanece en shared values. No existe fuente remota verificada para Camino.

## Componentes técnicos

| Pieza | Responsabilidad |
|---|---|
| Expo Router | Stack/Tabs, deep links y guards |
| AuthProvider | sesión, usuario, hidratación y comandos Auth |
| SecureStore | sesión Supabase cifrada en dispositivo |
| Supabase Auth | email, Google y Facebook |
| TanStack Query | caché y mutaciones del perfil |
| `profile.service` | SELECT/UPSERT/UPDATE de profiles |
| PostgreSQL/RLS | persistencia y aislamiento por `auth.uid()` |
| UI por props | independencia entre presentación y fuente |

`auth.users` representa identidad; `public.profiles` contiene datos editables y comparte UUID. Metadata Auth sirve como semilla/fallback. El onboarding actual usa `user_metadata.onboarding_completed`.

## Flujo

1. Se hidrata sesión desde SecureStore.
2. Los guards esperan antes de mostrar rutas.
3. Auth crea sesión y AuthProvider recibe el evento.
4. El usuario pasa por Empezar y entra a Tabs.
5. React Query solicita/asegura el perfil.
6. PostgreSQL aplica RLS.
7. Home/Yo muestran perfil con fallback Auth.

## Límites

Profile es el único dato de aplicación conectado a PostgreSQL. Ejercicios, progreso, historial, actividad, rachas y notificaciones no tienen esquema verificado. No deben escribirse queries antes de acordar reglas y contratos SQL. Zustand/MMKV no deben duplicar sesión ni caché remota.

## Recomendaciones de documentación y control

`phases/` ignorado es apropiado como memoria local privada, pero puede perderse y no debe ser la única fuente de decisiones de equipo. Mantener:

- `PROJECT_STATE.md` como snapshot regenerable y ligado a branch/commit.
- `VALIDATION_STATUS.md` con fecha y evidencia, no solo checks.
- Decisiones por fase con motivo, alternativas y estado.
- Migraciones SQL como fuente versionada del esquema; no depender del SQL Editor.
- Issues/PR para alcance, aceptación y pruebas, sin subir documentación privada.

Actualizar el snapshot al cerrar cada PR; distinguir implementado/validado/reportado/pendiente; anonimizar evidencia; versionar código y migración juntos; mantener matriz Android/iOS/proveedor; convertir decisiones estables en pruebas o configuración real. La documentación no sustituye RLS, rulesets ni redirects.

## Próximo paso

Validar y fusionar Profile con prueba RLS multiusuario, cerrar Facebook/Apple según disponibilidad y luego diseñar ejercicios, progreso, actividad y notificaciones conservando la UI actual.
