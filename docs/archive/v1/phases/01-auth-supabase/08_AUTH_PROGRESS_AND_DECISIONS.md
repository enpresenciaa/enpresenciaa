# Control de progreso y decisiones — Auth

Este archivo debe mantenerse vivo durante toda la fase.

---

## 1. Estado general

```text
Fase: Supabase + Auth
Estado: READY_FOR_TEST
Última actualización: 2026-08-17
```

Estados permitidos:

```text
NOT_STARTED
IN_PROGRESS
BLOCKED
READY_FOR_TEST
DONE
```

---

## 2. Checklist maestro

### A. Auditoría
- [x] Leer `PROJECT_STATE.md`.
- [x] Leer reglas Codex del repositorio.
- [x] Confirmar `package.json`.
- [x] Confirmar Expo Router.
- [x] Confirmar scripts type-check/lint.

### B. Configuración externa
- [x] Google provider Supabase.
- [x] callback Google → Supabase.
- [x] redirect Supabase → app.
- [x] Email/password configuration.
- [x] Confirm email documentado.

### C. Supabase
- [x] dependencia.
- [x] `.env.example`.
- [x] env validation.
- [x] cliente.
- [x] storage.
- [x] auto refresh.

### D. Expo/deep links
- [x] scheme aprobado.
- [x] package Android aprobado.
- [x] bundle ID iOS aprobado.
- [x] app config actualizado.
- [ ] development build regenerada.
- [ ] deep link probado.

### E. Estado Auth
- [x] provider/store central.
- [x] hidratación.
- [x] listener.
- [x] cleanup.
- [x] loading state.

### F. Métodos
- [x] email login.
- [x] email signup.
- [x] Google OAuth.
- [x] cancel Google.
- [x] logout.

### G. Navegación
- [x] tabs protegidas.
- [x] exercise protegido.
- [x] flujo público accesible.
- [x] sin flash de rutas privadas.

### H. Validación
- [x] type-check.
- [ ] lint.
- [ ] test Android.
- [ ] persistencia.
- [ ] logout.
- [ ] regresión UI.

---

## 3. Decisiones

### ADR-AUTH-001 — Fuente de verdad de sesión

**Estado:** propuesta recomendada
**Decisión:** Supabase Auth mantiene la sesión persistida. El estado central solo refleja Session/User/AuthStatus.

**No hacer:** persistir un duplicado de tokens en Zustand o MMKV.

---

### ADR-AUTH-002 — Estado central

**Estado:** aprobada
**Decisión:** `AuthProvider + Context` como implementación inicial.

**Alternativa aceptable:** Zustand in-memory si se decide estandarizar stores globales.

---

### ADR-AUTH-003 — OAuth Google

**Estado:** propuesta recomendada
**Decisión:** usar `supabase.auth.signInWithOAuth()` + navegador/deep link de Expo.

**No usar en esta fase:** SDK nativo de Google.

---

### ADR-AUTH-004 — Storage

**Estado:** aprobada
**Decisión:** almacenamiento compatible con Supabase y seguro en móvil; preferir `expo-secure-store` siguiendo la guía oficial vigente.

**No usar para tokens:** MMKV manual.

---

### ADR-AUTH-005 — Deep link

**Estado:** aprobada
**Decisión:**

```text
enpresenciaa://auth/callback
```

---

### ADR-AUTH-006 — Package / Bundle ID

**Estado:** aprobada

Identidad única inicial:

```text
Android package: com.enpresenciaa.app
iOS bundle identifier: com.enpresenciaa.app
Expo slug: enpresenciaa
```

---

### ADR-AUTH-007 — Confirmación de correo

**Estado:** confirmada

```text
Confirm email: ON
```

---

### ADR-AUTH-009 — Contrato de variables Supabase

**Estado:** aprobada

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

La publishable key es pública para el cliente. No registrar su valor en este documento.

---

### ADR-AUTH-008 — Perfil público

**Estado:** fuera de alcance

Auth debe poder finalizar sin depender todavía de `public.usuarios`.

La relación definitiva se tratará en la fase Perfil/DB.

---

## 4. Bloqueos

Usar este formato:

```text
BLOCKER-ID:
Fecha:
Etapa:
Descripción:
Qué falta:
Quién puede resolverlo:
Impacto:
```

```text
BLOCKER-ID: AUTH-QUALITY-001
Fecha: 2026-08-17
Etapa: Validación
Descripción: El lint global falla por errores preexistentes fuera de la Fundación Supabase.
Qué falta: Corregir la deuda de lint en una tarea separada sin mezclarla con Auth.
Quién puede resolverlo: Equipo de desarrollo.
Impacto: Los archivos de Prompt 2 pasan lint, pero el criterio global del repositorio continúa pendiente.
```

```text
BLOCKER-ID: AUTH-DEEPLINK-TEST-001
Fecha: 2026-08-17
Etapa: Expo/deep links
Descripción: La identidad, ruta callback y redirect están implementados, pero el custom scheme todavía no se ha probado en una development build instalada.
Qué falta: Regenerar development build y abrir `enpresenciaa://auth/callback` en Android/iOS.
Quién puede resolverlo: Equipo de desarrollo con dispositivo/emulador y build nativa.
Impacto: La configuración está lista, pero deep linking no puede marcarse como probado.
```

```text
BLOCKER-ID: AUTH-DEVICE-TEST-001
Fecha: 2026-08-17
Etapa: Validación funcional
Descripción: Las matrices de email/password, Google OAuth, persistencia, logout, guards y regresión visual no se han ejecutado en una development build instalada.
Qué falta: Regenerar/instalar la development build y ejecutar los casos E01-E08, G01-G08, S01-S05 y R01-R05.
Quién puede resolverlo: Equipo de desarrollo con dispositivo o emulador y acceso a las cuentas de prueba.
Impacto: El bundle Android y las validaciones estáticas pasan, pero la fase no puede marcarse DONE sin evidencia funcional.
```

---

## 5. Registro de cambios

| Fecha | Etapa | Cambio | Archivos | Validación | Resultado |
|---|---|---|---|---|---|
| 2026-08-17 | planificación | documentos iniciales | docs Auth | n/a | listo |
| 2026-08-17 | auditoría | contraste de documentación con repositorio actual | contexto, config, rutas, Auth, mocks | inspección estática | auditoría completada; implementación pendiente |
| 2026-08-17 | decisiones | SecureStore y AuthProvider + Context aprobados; configuración externa de Email/Google confirmada | control Auth | confirmación del propietario | quedan pendientes env, identidad, redirect y Confirm email |
| 2026-08-17 | decisiones | identidad única, deep link, publishable key y Confirm email aprobados | control Auth | confirmación del propietario | listo para preparar fundación Supabase; redirect móvil aún debe registrarse |
| 2026-08-17 | configuración externa | redirect móvil agregado a Supabase Redirect URLs | Supabase Dashboard | evidencia visual | `enpresenciaa://auth/callback` permitido |
| 2026-08-17 | fundación Supabase | dependencias, env tipado, cliente único, SecureStore fragmentado y auto-refresh | package/config/layout/lib | type-check, lint dirigido, Expo config, revisión de secretos/mocks | implementación lista; lint global bloqueado por deuda previa |
| 2026-08-17 | identidad/deep links | identidad En Presenciaa, route callback y redirect centralizado | app config/env, root layout, Auth utils/route | type-check, lint dirigido, Expo config, mocks | configuración lista; prueba en development build pendiente |
| 2026-08-17 | estado Auth | AuthProvider + Context, hidratación, listener y cleanup de sesión | contexto, provider, hook, root layout | type-check, lint dirigido, diff-check, mocks | estado central listo; guards y métodos Auth siguen fuera de este prompt |
| 2026-08-17 | email/password | login y registro reales con manejo de errores, confirmación de correo y bloqueo de submit duplicado | Auth service/context/provider, login, crear cuenta | type-check, lint dirigido, diff-check, mocks | métodos email listos; prueba funcional con Supabase pendiente |
| 2026-08-17 | Google OAuth | navegador seguro, callback, sesión, cancelación y Google habilitado en login/registro | Expo config/deps, Auth service/context/provider, callback, OAuthOptions, pantallas Auth | type-check, lint dirigido, Expo config, secretos, mocks | implementación lista; prueba en development build pendiente |
| 2026-08-17 | logout | cierre de sesión real desde la sección Yo | Auth service/context/provider, ProfileScreen, SectionScreen | type-check, lint dirigido, diff-check, mocks | implementación lista; redirección dependerá de guards en la siguiente fase |
| 2026-08-17 | guards | rutas públicas/privadas con Stack.Protected y gate de hidratación | root layout, Empezar | type-check, lint dirigido, matriz R01-R05 estática, mocks | configuración lista; matriz funcional pendiente en development build |
| 2026-08-17 | auditoría final | revisión de seguridad, variables, persistencia, rutas, mocks y bundle Android | Auth completo y configuración | type-check, lint global/dirigido, Expo export Android, búsqueda de secretos | Auth pasa lint dirigido y bundle; lint global y pruebas funcionales pendientes |
| 2026-08-17 | fix bundle | retiro de import Node incompatible con Metro y declaración ESLint de process | app-env.js, eslint config | type-check, lint dirigido, Expo export Android | bundle Android completado correctamente |

---

## 6. Cierre

Para marcar:

```text
Estado: DONE
```

deben estar completados:

- todos los criterios de aceptación;
- test plan sin fallos bloqueantes;
- secretos revisados;
- código compila;
- lint pasa;
- Google OAuth probado en development build;
- mocks de dominio sin modificación.
