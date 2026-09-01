# Protección de rutas con Expo Router

## 1. Objetivo

Evitar que el usuario pueda entrar a contenido autenticado únicamente escribiendo/abriendo una ruta.

---

## 2. Estado actual

Las rutas principales son accesibles sin sesión.

La pantalla `Empezar` actualmente navega a `/(tabs)` de forma local, pero eso no constituye autenticación.

---

## 3. Fuente del guard

Usar únicamente:

```text
AuthStatus
```

del estado central.

Nunca usar como indicador:

- `routeName`;
- “ya pasó por Login”;
- boolean persistido manualmente;
- presencia de un nombre mock;
- pantalla `Empezar`.

---

## 4. Grupos

Modelo conceptual:

```text
Público
- onboarding
- login
- crear cuenta
- callback si aplica

Protegido
- (tabs)
- exercise/[exerciseId]
- futuras rutas privadas
```

No es obligatorio mover todos los archivos si Expo Router puede protegerlos limpiamente con la estructura actual.

Evitar un refactor masivo solo por Auth.

---

## 5. Protected Routes

Expo Router 5+ soporta guards/protected screens.

Patrón conceptual:

```tsx
<Stack>
  <Stack.Protected guard={isAuthenticated}>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="exercise/[exerciseId]" />
  </Stack.Protected>

  <Stack.Protected guard={!isAuthenticated}>
    <Stack.Screen name="onboarding" />
  </Stack.Protected>
</Stack>
```

Adaptar al API exacto disponible en la versión instalada.

No copiar código a ciegas sin verificar la versión real.

---

## 6. Hidratación

Mientras:

```text
status === loading
```

no ejecutar un redirect a Login ni a Tabs.

Resolver primero la sesión.

Esto evita:

```text
app abre
→ muestra Login 100 ms
→ detecta sesión
→ muestra Home
```

---

## 7. Comportamientos

### Sin sesión

Intento:

```text
/(tabs)
```

Resultado:

```text
flujo público
```

### Con sesión

Intento de abrir Login:

Definir comportamiento de producto.

Recomendación para esta fase:

```text
sesión válida → no permanecer en Login → entrar al área autenticada
```

### Logout

```text
SIGNED_OUT
→ guard cambia
→ área privada deja de estar disponible
```

---

## 8. Empezar

La pantalla `Empezar` es parte de la experiencia de onboarding.

No usarla como prueba de sesión.

Decisión pendiente:

```text
¿Un usuario autenticado nuevo debe pasar por Empezar una sola vez?
```

Eso pertenece al estado de onboarding/perfil y no debe bloquear la implementación base de Auth.

Registrar como pendiente sin inventar persistencia.

---

## 9. Deep links a rutas privadas

Caso:

```text
usuario sin sesión
→ abre deep link privado
```

Debe terminar en Auth, no mostrar contenido privado.

La preservación exacta del destino original puede quedar para una mejora posterior si no es requisito de esta fase.

---

## 10. Criterio de aceptación

- Ninguna ruta privada abre sin sesión.
- No hay flash de contenido privado.
- Logout bloquea rutas privadas inmediatamente.
- Reiniciar con sesión permite entrar sin login repetido.
- Deep link privado sin sesión no expone contenido.
- Expo Router sigue siendo el único sistema de navegación.
