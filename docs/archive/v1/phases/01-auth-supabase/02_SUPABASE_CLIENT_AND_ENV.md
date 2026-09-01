# Cliente Supabase y variables de entorno

## 1. Objetivo

Añadir la base técnica mínima para que En Presenciaa pueda usar Supabase Auth sin conectar todavía datos de Home.

---

## 2. Dependencias

Codex debe revisar primero `package.json`.

Instalar únicamente si faltan y si la implementación elegida las requiere.

Base:

```bash
npx expo install @supabase/supabase-js expo-secure-store
```

Para OAuth basado en navegador/deep link normalmente también se necesitarán:

```bash
npx expo install expo-auth-session expo-web-browser
```

`expo-linking` ya fue detectado en el proyecto; no reinstalarlo si sigue presente.

### Web

Si el proyecto necesita soportar Expo Web en esta fase, usar el adaptador soportado por la documentación vigente y agregar almacenamiento web únicamente si es necesario.

No agregar soporte web por inercia si el objetivo de pruebas es Android/iOS.

---

## 3. Variables

Crear un ejemplo versionable:

```text
.env.example
```

Contenido recomendado:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

El archivo con valores reales debe permanecer fuera de Git cuando corresponda a configuración local.

No incluir:

```text
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLIENT_SECRET
```

---

## 4. Validación de entorno

Crear una capa pequeña que falle de manera explícita si falta configuración.

Estructura sugerida:

```text
src/config/env.ts
```

Responsabilidad:

- leer variables;
- validar que existan;
- no imprimir valores;
- exportar configuración tipada.

Ejemplo conceptual:

```ts
export const env = {
  supabaseUrl: requireEnv("EXPO_PUBLIC_SUPABASE_URL"),
  supabasePublishableKey: requireEnv(
    "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  ),
} as const;
```

No loggear las claves.

---

## 5. Cliente Supabase

Ubicación recomendada:

```text
src/lib/supabase.ts
```

Responsabilidades:

- crear una sola instancia;
- usar storage de Auth adecuado para React Native;
- `persistSession: true`;
- `autoRefreshToken: true`;
- `detectSessionInUrl: false` para native;
- no incluir lógica de UI;
- no incluir queries de dominio.

Contrato conceptual:

```ts
createClient(url, publishableKey, {
  auth: {
    storage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
```

---

## 6. Persistencia

### Recomendación de esta fase

En móvil usar un adaptador basado en `expo-secure-store`, siguiendo el patrón oficial actual de Supabase para Expo Social Auth.

No persistir la sesión además en:

- Zustand persist;
- MMKV;
- AsyncStorage duplicado;
- archivos propios.

Debe existir **una sola persistencia de sesión**, controlada por Supabase Auth mediante el storage adapter.

### MMKV

El MMKV actual puede seguir existiendo para preferencias no sensibles.

No guardar manualmente:

- access token;
- refresh token;
- contraseña.

---

## 7. Auto refresh y AppState

En React Native, revisar el patrón recomendado por Supabase para detener/reanudar auto-refresh según el estado de la app.

Conceptualmente:

```text
App active
→ startAutoRefresh()

App background/inactive
→ stopAutoRefresh()
```

Centralizar este comportamiento; no registrarlo desde múltiples pantallas.

---

## 8. Archivos esperados

Posibles archivos nuevos:

```text
.env.example
src/config/env.ts
src/lib/supabase.ts
src/lib/auth-storage.ts
```

No crear todos si una implementación más simple cubre correctamente el caso.

---

## 9. Pruebas de esta etapa

- [ ] App inicia con variables válidas.
- [ ] Variable faltante produce error de configuración claro.
- [ ] No se muestran valores sensibles en logs.
- [ ] Existe una sola instancia Supabase.
- [ ] `type-check` pasa.
- [ ] `lint` pasa.
- [ ] Home y Notificaciones no fueron modificados.

---

## 10. Criterio de aceptación

La etapa termina cuando el cliente puede inicializarse y ejecutar una operación de Auth sin que todavía exista dependencia entre Supabase y los mocks de dominio.
