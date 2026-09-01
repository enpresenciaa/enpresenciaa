# Sesión y estado central de autenticación

## 1. Objetivo

Tener una única capa que responda:

```text
¿La sesión ya fue hidratada?
¿Existe usuario autenticado?
¿Cuál es la Session actual?
¿Cuál es el User actual?
```

---

## 2. Estados mínimos

```ts
type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";
```

Modelo conceptual:

```ts
interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
}
```

No agregar `profile` todavía. Perfil pertenece a la fase siguiente.

---

## 3. Arquitectura recomendada

### Opción base recomendada

```text
AuthProvider + Context
```

Motivos:

- alineado con los patrones oficiales de Expo Router/Supabase;
- evita introducir un store global persistido solo para duplicar la sesión;
- suficiente para navegación y UI de Auth.

### Alternativa

Zustand puede utilizarse si se adopta como convención de arquitectura global, pero:

- debe ser in-memory para datos de sesión;
- no debe persistir tokens;
- Supabase sigue siendo fuente de verdad.

Registrar cualquier cambio de decisión en el documento de control.

---

## 4. Inicialización

Al montar la aplicación:

```text
status = loading
↓
leer sesión Supabase
↓
registrar onAuthStateChange
↓
session encontrada?
  sí → authenticated
  no → unauthenticated
```

Debe existir cleanup del listener al desmontar.

---

## 5. Eventos

El estado central debe reaccionar como mínimo a:

- sesión inicial;
- `SIGNED_IN`;
- `SIGNED_OUT`;
- refresh de token;
- cambios de sesión relevantes emitidos por Supabase.

No inventar estados a partir de la navegación.

Ejemplo incorrecto:

```text
router.replace("/(tabs)")
→ asumir authenticated
```

Ejemplo correcto:

```text
Supabase confirma Session
→ estado authenticated
→ guard permite /(tabs)
```

---

## 6. Loading inicial

Mientras `status === "loading"`:

- no renderizar brevemente tabs privadas;
- no mandar al usuario a Login prematuramente;
- no ejecutar redirects contradictorios.

La app necesita un único gate de hidratación.

No confundir:

```text
Splash nativo de arranque
```

con:

```text
/onboarding/splash
```

La pantalla de onboarding tiene una finalidad de producto distinta.

---

## 7. Responsabilidades de la capa Auth

Debe ofrecer funciones centralizadas o servicios para:

```ts
signInWithPassword()
signUpWithPassword()
signInWithGoogle()
signOut()
```

y lectura de:

```ts
session
user
status
```

No debe:

- consultar ejercicios;
- cargar historial;
- calcular rachas;
- cargar notificaciones;
- persistir tokens manualmente.

---

## 8. Archivos sugeridos

Opción Context:

```text
src/features/auth/context/AuthContext.tsx
src/features/auth/providers/AuthProvider.tsx
src/features/auth/hooks/useAuth.ts
src/features/auth/services/auth.service.ts
```

Simplificar si el repositorio prefiere menos archivos.

---

## 9. Manejo de errores

Distinguir:

```text
validation error
auth provider error
network error
OAuth cancelled
configuration error
unknown error
```

No mostrar al usuario mensajes técnicos completos de Supabase.

Mantener el error técnico disponible para desarrollo sin exponer secretos.

---

## 10. Criterio de aceptación

- Existe un solo origen de estado Auth.
- `loading/authenticated/unauthenticated` son inequívocos.
- Reiniciar app restaura la sesión.
- Logout actualiza estado sin intervención manual del router.
- No hay tokens persistidos en un store adicional.
- No hay dependencias con datos de Home.
