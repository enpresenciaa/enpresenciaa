# Estado técnico de En Presenciaa

Fecha: 2026-08-25. Fuente: repositorio local y registros de `phases/`; actualización de Camino sobre snapshot global del 2026-08-22, sin reauditar paneles remotos. **Implementado** significa que existe en código; **validado**, que hay evidencia de ejecución; **parcial**, que falta prueba o integración; **mock**, que simula backend.

## 1. Resumen ejecutivo

App móvil de bienestar con onboarding, Supabase Auth, navegación privada, Home, Camino, notificaciones, perfil y ejercicios. Camino ya no es placeholder: implementa un mapa vertical inmersivo con 13 niveles mock, Journey moderada, LevelFocus, entrada cinematográfica y ruta parametrizada. Panorama fue retirado tras evidencia visual. Auth/Profile conservan el estado del snapshot previo. Ejercicios, progreso de Camino, historial, actividad, racha y notificaciones siguen simulados. Clasificación: **parcialmente conectado a backend**.

## 2. Stack real

| Área | Tecnología |
|---|---|
| Core | Expo `~55.0.28`, RN `0.83.10`, React `19.2.0`, TypeScript `~5.9.2` estricto |
| Navegación | Expo Router: Stack raíz/onboarding, Tabs y Stack de Yo |
| Estado | Auth Context; TanStack Query `^5.90.20`; estado local |
| Persistencia | Expo SecureStore para sesión; MMKV/Zustand instalados sin store activo |
| Backend | Supabase JS `^2.112.3`; Auth y `public.profiles` |
| OAuth | Expo WebBrowser, AuthSession QueryParams y Linking |
| UI | StyleSheet, Uniwind/Tailwind 4, componentes propios |

## 3. Estructura simplificada

```text
assets/                 recursos visuales/video
plugins/                configuración nativa
src/app/                rutas Expo Router
src/components/         UI presentacional
src/config/             entorno y tema
src/features/auth/      contexto, provider, servicio, utilidades
src/features/profile/   pantallas, hooks y servicio
src/features/*/         pantallas por dominio
src/lib/                Supabase, SecureStore, QueryClient, MMKV
src/mocks/              Home y notificaciones
src/types/              contratos UI y Database manual
supabase/migrations/    migración de profiles
phases/                 contexto local ignorado por Git
```

## 4. Arquitectura actual

```text
Router → pantallas → Auth Context / hooks React Query → services → Supabase
                ↘ Home/Notifications → mocks → componentes por props
```

Auth y Profile separan UI, estado y acceso remoto. Los otros dominios importan mocks desde sus pantallas. No hay repositories ni stores Zustand activos. `Database` es manual, no generado.

## 5. Navegación

| Ruta | Acceso/Auth | Estado |
|---|---|---|
| `/` | entrada; decide Splash o Empezar | implementado, cambio sin commit |
| onboarding: splash, video, bienvenida, ejercicio inicial, evaluación, poder del cambio | público | funcional local/parcial |
| onboarding: crear cuenta, login | público | Supabase real; recuperación pendiente |
| `/auth/callback` | callback OAuth | implementado |
| `/onboarding/empezar` | autenticado; luego Tabs | implementado; regresión pendiente |
| `/(tabs)` Inicio | auth + onboarding completo | perfil real + mocks |
| Camino | tab privada | mapa inmersivo implementado; mocks y validación visual pendiente |
| `/camino/nivel/[levelId]` | Stack privado | detalle parametrizado implementado con ejercicios mock |
| Ejercicios, Para Ti | Tabs privadas | placeholders |
| Notificaciones | tab privada oculta | UI con mocks |
| Auth inspector | tab privada oculta, `__DEV__` | sanitizado; probado con Google |
| Yo, Editar perfil, Suscripción | Stack privado de Yo | perfil parcial; suscripción no verificada |
| `/exercise/[exerciseId]` | privada desde Home | incompleta; solo ID |
| `+not-found` | URL inválida | funcional |

Los guards están centralizados con `Stack.Protected`; durante hidratación se muestra loading.

## 6. Supabase

Cliente: `src/lib/supabase.ts`. Variables: `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Persistencia: `src/lib/auth-storage.ts`; auto-refresh por AppState.

- Auth: signUp, signInWithPassword/OAuth, exchangeCodeForSession, set/getSession, getUser, listener, updateUser y signOut.
- SELECT: perfil propio.
- UPSERT: recuperación idempotente de perfil faltante.
- UPDATE: perfil propio.
- DELETE/RPC/Storage/Realtime: ninguno.

La migración local crea `profiles`, constraints, grants, RLS de propietario, triggers y backfill. El historial de fase dice que fue aplicada manualmente y anon fue denegado; esta auditoría no lo revalidó remotamente.

## 7. Autenticación

```text
Login/Registro → Auth service → Supabase Auth → AuthProvider/listener
→ SecureStore → Empezar → onboarding_completed → Tabs
```

- Email/password: real, validado localmente y con confirmación contemplada.
- Google: OAuth web, callback `enpresenciaa://auth/callback`, PKCE/tokens, cancelación y deduplicación. **Validado funcionalmente**.
- Facebook: provider y UI implementados. **Prueba final pendiente**.
- Apple: **pendiente**.
- Sesión: hidratación + listener con cleanup; tokens gestionados por Supabase/SecureStore.
- Logout: real y limpia caché de perfil.

## 8. Expo y OAuth

Slug `enpresenciaa`; scheme `enpresenciaa`; package/bundle `com.enpresenciaa.app` en todos los ambientes. No hay intent filters/associated domains explícitos. Riesgos: ambientes no separados, EAS project ID placeholder, `NSAllowsArbitraryLoads`, y script `build:local` sin perfil `local` (el perfil se llama `development`).

## 9. Mocks

| Dominio | Fuente | Datos/consumo | Backend futuro |
|---|---|---|---|
| Usuario | `homeMock.user` | nombre | profiles |
| Motivación | `homeMock.motivation` | Home | esquema no definido |
| Racha | `homeMock.streak` | HomeHeroSection | no definido |
| Ejercicio | `currentExercise` | tarjeta/detalle | no definido |
| Historial | 3 `recentExercises` | Home | no definido |
| Actividad | 3 `activityDays` + agosto 2026 | calendario | no definido |
| Notificaciones | 6 registros + conteo | lista/badge | no definido |
| Suscripción | metadata ad hoc | pantalla Yo | no definido |

### Camino

`journey.mock` aporta 13 niveles, coordenadas, estados y 39 ejercicios. `JourneyScreen` compone datos, focus y navegación. `CaminoMap` conserva una sola escena PNG + overlay, usa 2.45 anchos de viewport, amortigua el seguimiento lateral y extiende el tramo útil hasta nivel 1. Reanimated ejecuta CloudReveal, descenso nivel 13→actual, LevelFocus y pulso; reduced motion posiciona directamente. Panorama fue eliminado. No hay SVG, Skia, backend, paywall, persistencia nueva ni assets adicionales. Type-check y lint dirigido pasan; nuevas capturas, rendimiento y remount entre tabs siguen pendientes.

Hay **16 registros mock activos** más hardcodes. `src/data/static/*` y `src/types/index.ts` son residuos no consumidos.

## 10. Componentes conectados

`HomeHeader`, `MotivationRow`, `HomeHeroSection`, `CurrentExerciseCard`, `RecentExerciseCard`, `ActivityCalendar`, `NotificationButton`, `NotificationCard/List` y `NotificationsHeader` reciben props. Pueden sustituir mocks sin cambiar su UI; solo HomeHeader ya consume perfil/fallback Auth.

## 11. Modelos frontend

- `Profile`: id, nombre, nacimiento, teléfono, idioma, avatar y timestamps.
- `CurrentExercise`: id, nivel, nombre, minutos y estado.
- `RecentExercise`: id, nivel, nombre y fecha completada.
- `ActivityDay`: fecha y cantidad completada.
- `NotificationItem`: id, tipo, textos, fecha y leído.
- Auth usa `Session` y `User` oficiales.

No hay modelos completos verificados de catálogo, progreso, racha o suscripción.

## 12. Frontend frente a Supabase

| Tabla | Referencia | Uso |
|---|---|---|
| `auth.users` | sí | identidad, sesión y metadata onboarding |
| `public.profiles` | sí | Home y Yo |
| ejercicios/progreso/historial/actividad/rachas/notificaciones | no | no verificable; no inventar columnas |

## 13. Flujo autenticado

Ya existe: proveedor/email → Auth → sesión → Empezar → Tabs → perfil. Falta validar la regla exacta de Empezar, Profile en dispositivo y cargar los dominios mock desde esquemas todavía inexistentes.

## 14. Prioridades

| Prioridad | Acción | Riesgo/dependencia |
|---|---|---|
| P0 Auth | regresión de rutas y Facebook | callbacks/configuración externa |
| P1 Perfil | SELECT/UPSERT/UPDATE profiles | cambios sin commit; RLS y éxito parcial |
| P2 Ejercicio | definir tabla y SELECT | reglas de catálogo/asignación |
| P3 Progreso/historial | definir SELECT/UPSERT | idempotencia |
| P4 Actividad/racha | definir fuente | zona horaria/regla de racha |
| P5 Notificaciones | SELECT/UPDATE | generación, lectura y paginación |

## 15. Plan de migración

1. Probar e integrar Profile y RLS.
2. Cerrar Facebook; documentar Apple hasta disponer de firma.
3. Diseñar ejercicios/asignaciones; conectar tarjeta y detalle.
4. Implementar progreso e historial idempotentes.
5. Definir actividad/racha con zona horaria.
6. Definir notificaciones, lectura y paginación.
7. Retirar mocks y residuos en tarea separada.

Cada fase requiere type-check, lint dirigido, diff-check, flujo feliz/error/restauración y RLS multiusuario cuando corresponda.

## 16. Código conservable

Los componentes de Home/Notificaciones, layouts de Auth, SecureStore y contratos por props son reutilizables. No necesitan refactor para cambiar la fuente.

## 17. Deuda técnica

- **ALTA:** Profile/Facebook sin validación concluyente; Apple pendiente; esquemas restantes inexistentes.
- **ALTA:** guardar perfil y email son operaciones separadas con posible éxito parcial.
- **MEDIA:** `Database` manual; identidad igual por ambiente; EAS placeholder; ATS permisivo.
- **MEDIA:** recuperación, calendario, contenido y suscripción incompletos.
- **BAJA:** dependencias/datos heredados sin uso y TODO visuales.

## 18. Seguridad

`.env.example` está trackeado; archivos `.env` no. No se detectaron service-role keys, Client Secrets ni tokens trackeados. La publishable key móvil requiere RLS. Sesiones usan SecureStore. `profiles` limita SELECT/INSERT/UPDATE a `auth.uid()` y no concede DELETE. Pendiente: validar políticas remotas, mantener inspector solo en dev, publicar privacidad/eliminación para Facebook y endurecer ATS.

## 19. Archivos que leer primero

`CODEX_PROJECT_RULES.md`, `package.json`, `app.config.ts`, `app-env.js`, `eas.json`, `src/app/_layout.tsx`, `src/app/index.tsx`, `src/app/onboarding/_layout.tsx`, `src/features/auth/providers/AuthProvider.tsx`, `src/features/auth/services/auth.service.ts`, `src/lib/supabase.ts`, `src/lib/auth-storage.ts`, `src/features/profile/services/profile.service.ts`, `src/features/profile/hooks/useProfile.ts`, `src/types/database.ts`, la migración profiles, HomeScreen y ambos mocks.

## 20. Información pendiente

- Regla exacta para mostrar Empezar. //La regla es, un usuario con sesión activa.
- Confirmar que migración local y remota coinciden.
- Modelo de puertas/ejercicios/asignaciones.
- Evento idempotente de finalización.
- Cálculo de racha y zona horaria.
- Generación/paginación de notificaciones.
- Fuente real de suscripción.
- Separación de identidad por ambiente.

## 21. Git

```text
Branch: feature/user-profile-foundation
Working tree: 10 modificados y 6 grupos no trackeados, cambios del usuario
Último commit: 19c58a9 feat: add social auth and profile flows
```

No se hizo commit, push, merge ni cambio de código.

# AI_HANDOFF_SUMMARY

En Presenciaa usa Expo 55, RN 0.83, React 19, TypeScript estricto y Expo Router. Auth se centraliza en Context/Provider, hidrata sesión con Supabase, escucha cambios con cleanup, persiste mediante SecureStore y protege rutas con estados loading/authenticated/unauthenticated. Email/password y Google funcionan; Google fue probado por el usuario. Facebook está implementado pero requiere prueba final con cuenta autorizada de Meta; Apple no está implementado.

La rama `feature/user-profile-foundation` contiene cambios sin commit sobre `19c58a9`. Añade TanStack Query, tipos manuales, servicio/hooks y migración de `public.profiles` con RLS, triggers y backfill. Los registros dicen que la migración fue aplicada manualmente, pero esta auditoría no consultó Supabase. Home y Yo consumen perfil con fallback Auth.

Home mantiene mocks de motivación, racha, ejercicio, historial y actividad; Notificaciones mantiene seis registros. El detalle solo muestra ID y varias tabs son placeholders. No existen esquemas verificados para ejercicios, progreso, actividad, rachas o notificaciones. Los componentes reciben props y pueden conservarse.

Validación actual: type-check, lint dirigido y diff-check pasan. No se detectaron secretos trackeados. Riesgos: integración Profile no probada, posible éxito parcial al actualizar perfil/email, tipo DB manual, configuración de ambientes no separada, ATS permisivo y recuperación pendiente.

Siguiente paso: ejecutar la matriz manual de Profile y RLS con dos usuarios en development build, corregir cualquier regresión de Empezar, integrar la rama y después cerrar Facebook antes de diseñar ejercicios.
