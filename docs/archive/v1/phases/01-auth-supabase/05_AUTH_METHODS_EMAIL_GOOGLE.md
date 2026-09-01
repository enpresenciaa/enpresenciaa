# Métodos de Auth — Email/Password + Google

## 1. Alcance

Implementar los métodos de autenticación ya representados por la UI actual:

- registro con email/password;
- login con email/password;
- Google OAuth;
- logout.

Apple y Facebook quedan fuera de esta fase.

---

# 2. Email/password

## Login

El submit actual debe dejar de usar `Promise.resolve()` y delegar a:

```ts
supabase.auth.signInWithPassword({
  email,
  password,
});
```

La navegación posterior debe depender del estado de sesión, no de una simulación.

## Signup

El submit debe delegar a:

```ts
supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      // únicamente metadata que haya sido aprobada
    },
  },
});
```

### Importante

No copiar automáticamente todos los campos del formulario a `user_metadata` sin una decisión explícita.

En particular:

- nombre;
- teléfono;
- consentimientos;
- fecha de nacimiento;
- mood inicial

deben tener un contrato de persistencia definido antes de usarse como modelo definitivo.

Esta fase puede autenticar al usuario sin resolver todavía el perfil público.

---

## 3. Confirmación de correo

Supabase puede estar configurado para requerir confirmación.

Por eso se deben soportar dos resultados:

```text
signUp
→ user + session
```

o:

```text
signUp
→ user + session null
→ mostrar estado "revisa tu correo"
```

No asumir cuál comportamiento está activo.

Registrar en `01_EXTERNAL_CONFIG_AND_SECRETS.md`:

```text
Confirm email: ON / OFF
```

---

# 4. Google OAuth móvil

## Estrategia de esta fase

Usar:

```ts
supabase.auth.signInWithOAuth({
  provider: "google",
  options: {
    redirectTo,
    skipBrowserRedirect: true,
  },
});
```

y abrir la URL resultante mediante el flujo de navegador soportado por Expo.

Después del callback, crear/establecer la sesión siguiendo el flujo vigente de Supabase para React Native.

No implementar un SDK nativo de Google en esta fase.

---

## 5. Flujo esperado

```text
Usuario pulsa Google
↓
Auth service solicita URL a Supabase
↓
WebBrowser abre sesión de auth
↓
Google
↓
callback de Supabase
↓
redirectTo custom scheme
↓
App recibe URL
↓
Supabase obtiene/establece Session
↓
onAuthStateChange
↓
authenticated
```

---

## 6. Errores y cancelación

Casos mínimos:

```text
SUCCESS
CANCELLED
PROVIDER_ERROR
NETWORK_ERROR
CONFIGURATION_ERROR
```

Cancelar Google no debe:

- navegar a tabs;
- mostrar usuario autenticado;
- dejar loading infinito.

---

## 7. Google Client Secret

Nunca debe existir en:

```text
.env
EXPO_PUBLIC_*
app.config.ts
TypeScript
JavaScript
EAS Update público
```

El Client Secret permanece configurado en Supabase.

---

## 8. UI existente

Reutilizar `OAuthOptions.tsx`.

Cambiar solamente comportamiento necesario:

- Google habilitado;
- Apple/Facebook pueden permanecer deshabilitados o sin handler según diseño actual;
- agregar loading/disabled durante petición;
- evitar doble tap.

No rediseñar la pantalla.

---

## 9. Logout

Implementar mediante:

```ts
supabase.auth.signOut()
```

El guard de navegación debe reaccionar al cambio.

No hacer:

```text
router.replace("/login")
```

como única lógica de logout sin invalidar la sesión.

---

## 10. Criterio de aceptación

### Email
- login correcto;
- login incorrecto;
- signup;
- email ya registrado;
- confirmación de correo cuando aplique.

### Google
- login exitoso;
- cancelar;
- cuenta nueva;
- cuenta previamente existente;
- retorno a app;
- sesión persistente.

### Logout
- sesión removida;
- ruta privada inaccesible;
- reinicio sigue sin sesión.
