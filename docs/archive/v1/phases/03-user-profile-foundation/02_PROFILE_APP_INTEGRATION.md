# Integración del perfil en la app

## Lectura

TanStack Query administrará el dato remoto `profiles`.

```text
query key: ["profile", userId]
enabled: sesión autenticada
staleTime: limitado; invalidar después de editar
```

No duplicar el perfil en Zustand ni en AuthContext.

## Escritura

Una operación de edición coordina dos fuentes:

1. `profiles`: nombre y fecha de nacimiento.
2. Supabase Auth: correo, sólo cuando cambia.

La UI debe informar si el nuevo correo requiere confirmación.

## Precedencia de datos

```text
displayName = profiles.full_name
  ?? auth.user_metadata.full_name
  ?? auth.user_metadata.name
  ?? parte local del correo
  ?? "Usuario"

avatarUrl = profiles.avatar_url
  ?? auth.user_metadata.avatar_url
  ?? auth.user_metadata.picture
```

Un proveedor social no debe sobrescribir silenciosamente un nombre editado en `profiles`.

## Pantallas consumidoras

- YO: encabezado de perfil.
- Editar perfil: valores iniciales y guardado.
- Inicio: saludo.

## Estados

- loading: conservar layout estable con indicador discreto;
- error: mensaje con reintento;
- fila ausente: intentar `ensureProfile` para cuentas anteriores;
- sesión ausente: no ejecutar consultas.
