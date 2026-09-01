# Identidad Expo y Deep Links

## 1. Problema actual

La auditoría detectó configuración heredada:

```text
subscribed.local
subscribed.preview
subscribed
```

y package/bundle IDs de la plantilla `Subscribed`.

OAuth móvil necesita una identidad y un scheme coherentes con En Presenciaa.

---

## 2. Decisión sobre scheme

Recomendación:

```text
local:      enpresenciaa.local
preview:    enpresenciaa.preview
production: enpresenciaa
```

Si se prefiere un único scheme:

```text
enpresenciaa
```

también es válido, pero debe quedar documentado.

### Gate

Antes de cambiar `android.package` e `ios.bundleIdentifier`, confirmar los identificadores definitivos.

No inventar un reverse-domain definitivo si el propietario/dominio no está decidido.

Registrar la decisión en:

```text
08_AUTH_PROGRESS_AND_DECISIONS.md
```

---

## 3. Callback interno

Ruta recomendada:

```text
/auth/callback
```

Ejemplos:

```text
enpresenciaa.local://auth/callback
enpresenciaa.preview://auth/callback
enpresenciaa://auth/callback
```

La URL elegida debe coincidir entre:

```text
app.config.ts
↕
makeRedirectUri / Linking
↕
Supabase Authentication → Redirect URLs
```

---

## 4. Google no redirige directamente a la app

Flujo:

```text
App
→ Supabase Auth
→ Google
→ https://<PROJECT_REF>.supabase.co/auth/v1/callback
→ Supabase
→ enpresenciaa://auth/callback
→ App
```

En Google Cloud se mantiene como Authorized Redirect URI el callback web de Supabase.

El custom scheme móvil pertenece a la allow list de redirects de Supabase.

---

## 5. Expo Router

Expo Router ya proporciona routing basado en archivos y soporte de deep links.

No añadir React Navigation manual ni un segundo linking config salvo que exista una necesidad demostrada.

Crear un handler específico de Auth solo para:

- recibir resultado OAuth;
- extraer parámetros de sesión/código según el flujo;
- entregar sesión a Supabase;
- redirigir al destino autenticado.

No mezclar ahí lógica de Home.

---

## 6. Expo Go vs Development Build

Para validar el custom scheme real y comportamiento nativo de OAuth, considerar **development build** como objetivo principal de pruebas.

No declarar la fase terminada basándose solamente en Expo Go.

---

## 7. Archivos que probablemente cambian

```text
app.config.ts
app-env.js / app-env.ts     // si siguen siendo la fuente de configuración
src/app/_layout.tsx
```

Posibles archivos nuevos:

```text
src/features/auth/utils/auth-redirect.ts
src/features/auth/services/oauth.service.ts
```

Adaptar nombres a la arquitectura existente.

---

## 8. Configuración no relacionada

No limpiar todavía todos los residuos `Subscribed`.

Solo cambiar lo estrictamente necesario para:

- identidad de aplicación;
- scheme;
- package/bundle ID cuando se confirme;
- OAuth/deep linking.

El cleanup general será una tarea independiente.

---

## 9. Pruebas manuales

### Deep link directo

Con development build instalada:

```text
enpresenciaa://auth/callback
```

debe abrir En Presenciaa.

### OAuth

```text
Login
→ Google
→ navegador
→ seleccionar cuenta
→ callback
→ volver a app
```

### Cancelación

```text
Login
→ Google
→ cancelar
→ permanecer en Login
→ no crear sesión falsa
```

---

## 10. Criterio de aceptación

- Scheme de En Presenciaa definido.
- Package/bundle ID no permanece accidentalmente ligado a `Subscribed` una vez aprobados los identificadores.
- Redirect registrado en Supabase.
- Development build puede abrirse por deep link.
- Callback OAuth vuelve correctamente a la aplicación.
