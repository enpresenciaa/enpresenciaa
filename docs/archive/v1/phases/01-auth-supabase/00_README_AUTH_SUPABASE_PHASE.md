# En Presenciaa — Fase Auth + Supabase

**Fecha base:** 2026-08-17
**Estado inicial:** UI + lógica local
**Objetivo de esta fase:** integrar Supabase en el cliente móvil y dejar autenticación real, sesión persistente, Google OAuth, deep links y protección de rutas funcionando **antes de reemplazar los mocks de Home**.

---

## 1. Contexto confirmado del repositorio

El estado técnico disponible indica:

- Expo SDK 55.
- React Native 0.83.10.
- React 19.2.
- TypeScript strict.
- Expo Router.
- No existe todavía `@supabase/supabase-js`.
- No existe cliente Supabase.
- No existe sesión real.
- No existen guards de autenticación.
- Login y registro son simulados.
- Google/Apple/Facebook son botones visuales.
- Los mocks de Home y Notificaciones siguen activos y **no forman parte de esta fase**.
- La configuración Expo conserva nombres heredados de `Subscribed`.
- MMKV existe, pero no debe convertirse automáticamente en almacenamiento de tokens.
- Zustand y TanStack Query están instalados, pero no forman parte todavía del flujo de Auth.

---

## 2. Resultado esperado

Al finalizar esta fase debe funcionar:

```text
Abrir app
→ hidratar sesión
→ determinar authenticated / unauthenticated
→ proteger rutas privadas

Usuario sin sesión
→ onboarding/login

Login email/password
→ Supabase Auth
→ sesión válida
→ ruta autenticada

Google OAuth
→ navegador seguro
→ Google
→ callback Supabase
→ deep link En Presenciaa
→ sesión válida
→ ruta autenticada

Cerrar app
→ abrir app
→ restaurar sesión

Logout
→ invalidar sesión
→ volver al flujo público
```

---

## 3. Fuera de alcance

No realizar todavía:

- reemplazo de `src/mocks/home.ts`;
- reemplazo de `src/mocks/notifications.ts`;
- queries de ejercicios;
- progreso;
- historial;
- calendario real;
- rachas;
- notificaciones reales;
- creación automática de perfil público sin confirmar el esquema;
- diseño definitivo de `public.usuarios`;
- eliminación de residuos `Subscribed` que no sean necesarios para configurar identidad/deep links;
- Apple Auth;
- Facebook Auth;
- push notifications.

---

## 4. Documentos de esta fase

| Orden | Archivo | Propósito |
|---|---|---|
| 1 | `01_EXTERNAL_CONFIG_AND_SECRETS.md` | Configuración de Supabase/Google que vive fuera del repositorio |
| 2 | `02_SUPABASE_CLIENT_AND_ENV.md` | Cliente Supabase, variables y persistencia |
| 3 | `03_EXPO_IDENTITY_AND_DEEPLINKS.md` | Scheme, callback móvil e identidad Expo |
| 4 | `04_AUTH_SESSION_AND_STATE.md` | Estado central, hidratación y listener |
| 5 | `05_AUTH_METHODS_EMAIL_GOOGLE.md` | Login, signup y Google OAuth |
| 6 | `06_AUTH_ROUTING_GUARDS.md` | Protección de rutas con Expo Router |
| 7 | `07_AUTH_TEST_PLAN.md` | Pruebas funcionales y de regresión |
| 8 | `08_AUTH_PROGRESS_AND_DECISIONS.md` | Control de progreso, decisiones y bloqueos |
| 9 | `09_CODEX_EXECUTION_PROMPTS.md` | Prompts por fase para Codex |

---

## 5. Orden obligatorio de implementación

```text
A. Auditoría previa
↓
B. Configuración externa
↓
C. Dependencias + variables
↓
D. Cliente Supabase
↓
E. Identidad Expo + deep links
↓
F. Estado central de Auth
↓
G. Email/password
↓
H. Google OAuth
↓
I. Guards de rutas
↓
J. Logout
↓
K. Pruebas
↓
L. Cierre de fase
```

No avanzar a la siguiente etapa si la anterior deja errores de TypeScript, lint o navegación.

---

## 6. Principios de arquitectura

### Supabase es la fuente de verdad de la sesión

No duplicar access token/refresh token en un store propio.

### El estado global solo refleja la sesión

El estado central puede exponer:

```ts
type AuthStatus = "loading" | "authenticated" | "unauthenticated";
```

y referencias tipadas a:

- `session`
- `user`
- `status`

pero no debe implementar un segundo sistema de persistencia de tokens.

### UI desacoplada

Los botones existentes de Login/Crear cuenta deben delegar a funciones de Auth; no deben contener configuración de Supabase dispersa.

### No mezclar perfil con sesión

En esta fase:

```text
Auth = identidad y sesión
Profile = siguiente fase
```

No bloquear el login porque `public.usuarios` todavía no esté conectado.

---

## 7. Reglas para Codex

1. Leer `PROJECT_STATE.md` y las reglas actuales del repositorio antes de cambiar código.
2. No tocar mocks de Home/Notificaciones.
3. No modificar diseño salvo estados mínimos de loading/error necesarios para Auth.
4. No usar `any`.
5. No guardar contraseñas.
6. No incluir Google Client Secret en la app.
7. No incluir Supabase `service_role` en la app.
8. Solo usar URL + publishable/anon key pública del proyecto en cliente.
9. No crear políticas RLS permisivas para “hacer funcionar” la app.
10. No crear tablas sin confirmación.
11. Mantener Expo Router como único sistema de navegación.
12. Ejecutar type-check y lint después de cada bloque.
13. Actualizar `08_AUTH_PROGRESS_AND_DECISIONS.md` después de cada bloque terminado.
14. Si una decisión externa es necesaria y no está definida, detener esa parte y registrar un `BLOCKER`.

---

## 8. Criterio de cierre de fase

La fase está terminada únicamente si:

- Supabase inicia sin errores.
- Las variables requeridas se validan.
- No existen secretos privados en el bundle.
- Login email/password funciona.
- Signup email/password funciona según la configuración de confirmación de correo.
- Google OAuth funciona en development build.
- Cancelar OAuth no rompe la app.
- Una sesión persiste al reiniciar.
- Logout elimina la sesión.
- Las rutas privadas no pueden abrirse sin sesión.
- Las rutas públicas no quedan bloqueadas para usuarios sin sesión.
- No aparece un flash de contenido privado durante hidratación.
- TypeScript y lint pasan.
- Los mocks de Home/Notificaciones permanecen intactos.

---

## 9. Referencias oficiales consultadas

- Supabase Docs — Build a Social Auth App with Expo React Native.
- Supabase Docs — Native Mobile Deep Linking.
- Supabase Docs — Login with Google.
- Expo Docs — Authentication in Expo Router / Protected Routes.
- Expo Docs — Using Supabase.
