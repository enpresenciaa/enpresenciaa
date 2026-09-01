# Normalización del perfil

## Objetivo

Definir una interfaz estable para la aplicación sin acoplar las vistas a la forma variable de Google, Facebook o Apple.

## Momento de decisión

No crear una tabla o contrato definitivo hasta recopilar evidencia del inspector para cada proveedor disponible.

## Campos candidatos

```text
id
email
displayName
givenName
familyName
avatarUrl
phone
primaryProvider
providers
onboardingCompleted
createdAt
updatedAt
```

## Principios

- `id` corresponde al usuario de Supabase, no al ID del proveedor.
- Los campos normalizados son propios de la aplicación.
- Las identidades externas sirven para vinculación y diagnóstico, no como modelo de UI.
- No asumir que correo, nombre, teléfono o avatar siempre existen.
- No confiar en `user_metadata` para autorización o roles.
- Evitar que un proveedor sobrescriba datos editados deliberadamente por el usuario.

## Decisiones pendientes

- Si el perfil definitivo vivirá en una tabla `profiles` con RLS.
- Prioridad entre datos ingresados por el usuario y datos del proveedor.
- Política para vincular cuentas con el mismo correo.
- Campos obligatorios después del registro social.
- Tratamiento de correos privados de Apple.
