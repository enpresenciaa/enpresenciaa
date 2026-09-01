# En Presenciaa — Fase Perfil persistente de usuario

**Fecha base:** 2026-08-21
**Estado inicial:** Auth funcional; perfil UI usa `user_metadata`
**Objetivo:** crear `public.profiles` con RLS, sincronizar usuarios existentes/nuevos y conectar YO, Editar perfil e Inicio.

## Resultado esperado

```text
Usuario autenticado
→ obtiene su fila profiles
→ YO e Inicio consumen el perfil
→ Editar perfil guarda nombre y nacimiento en profiles
→ cambio de correo permanece en Supabase Auth
→ la UI se actualiza sin reiniciar sesión
```

## Dentro de alcance

- migración SQL versionada;
- tabla `public.profiles`;
- RLS por `auth.uid()`;
- trigger para usuarios nuevos;
- backfill seguro para usuarios existentes;
- tipos y servicio de perfil;
- consulta/cache con TanStack Query;
- edición de nombre y fecha de nacimiento;
- cambio de correo mediante Auth;
- estados loading, error y ausencia de perfil;
- conexión de YO e Inicio.

## Fuera de alcance

- pagos y suscripciones reales;
- carga de avatar;
- almacenamiento de archivos;
- roles administrativos;
- progreso, rachas y ejercicios reales;
- preferencias de notificaciones;
- Apple Auth;
- edición de identidades sociales.

## Orden obligatorio

1. Documentar modelo y decisiones.
2. Crear migración y revisar seguridad.
3. Implementar tipos/servicio.
4. Integrar consulta y actualización.
5. Conectar pantallas.
6. Ejecutar validaciones.
7. Registrar evidencia y bloqueos.

## Criterio de cierre

- migración reproducible;
- RLS no permite leer o editar perfiles ajenos;
- usuarios existentes reciben perfil;
- usuarios nuevos reciben perfil;
- nombre y nacimiento persisten;
- correo conserva confirmación de Supabase;
- YO e Inicio reflejan cambios;
- TypeScript y lint dirigido pasan;
- pruebas funcionales documentadas.
