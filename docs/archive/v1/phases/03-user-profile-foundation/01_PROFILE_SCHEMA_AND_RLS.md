# Esquema y RLS de profiles

## Contrato aprobado

```text
public.profiles
  id uuid primary key references auth.users(id) on delete cascade
  full_name text null
  date_of_birth date null
  phone text null
  language text not null default 'es-MX'
  avatar_url text null
  created_at timestamptz not null default now()
  updated_at timestamptz not null default now()
```

## Responsabilidades

- `auth.users.email`: correo canónico de acceso.
- `auth.users.identities`: proveedores vinculados.
- `profiles.full_name`: nombre editable con prioridad sobre metadata social.
- `profiles.date_of_birth`: dato de producto, nunca credencial.
- `profiles.phone`: teléfono de perfil; no implica verificación Auth.
- `profiles.language`: preferencia regional futura.
- `profiles.avatar_url`: preparado para avatar propio; inicialmente puede copiar metadata social.

## RLS

Políticas requeridas:

- `SELECT`: `auth.uid() = id`.
- `INSERT`: `auth.uid() = id`.
- `UPDATE`: `auth.uid() = id`.
- No se concede `DELETE` desde el cliente.

## Automatización

- Trigger `after insert on auth.users` crea el perfil.
- La función usa `security definer` y `set search_path = ''`.
- La migración hace backfill idempotente de usuarios existentes.
- Trigger de `updated_at` evita depender del reloj del cliente.

## Restricciones

- nombre máximo 100 caracteres;
- nacimiento no puede estar en el futuro;
- idioma usa identificador BCP 47 corto;
- URLs y teléfono permanecen opcionales hasta definir validación de producto.
