# Progreso y decisiones — Perfil persistente

## Estado general

```text
Fase: Perfil persistente de usuario
Estado: READY_FOR_APP_TEST
Última actualización: 2026-08-21
Rama: feature/user-profile-foundation
```

## Progreso

- [x] Alcance aprobado.
- [x] Separación Auth/Profile aprobada.
- [x] Estructura documental creada.
- [x] Migración profiles.
- [x] RLS y triggers.
- [x] Servicio tipado.
- [x] Query/cache.
- [x] YO conectado.
- [x] Editar perfil conectado.
- [x] Inicio conectado.
- [x] Pruebas estáticas.
- [ ] Pruebas funcionales.

## Decisiones

### ADR-PROFILE-001 — Separación de fuentes

**Estado:** aprobada
**Decisión:** Auth conserva correo/identidades; `profiles` conserva datos editables de producto.

### ADR-PROFILE-002 — Nombre del usuario

**Estado:** aprobada
**Decisión:** `profiles.full_name` tiene prioridad sobre metadata del proveedor.

### ADR-PROFILE-003 — Seguridad

**Estado:** aprobada
**Decisión:** RLS limita select/insert/update a `auth.uid() = id`; el cliente no puede borrar perfiles.

### ADR-PROFILE-004 — Datos remotos

**Estado:** aprobada
**Decisión:** usar TanStack Query; no duplicar profiles en Zustand ni AuthContext.

### ADR-PROFILE-005 — Fecha de nacimiento

**Estado:** aprobada
**Decisión:** persistir como `date` ISO en base de datos y formatear sólo en UI.

### ADR-PROFILE-006 — Actualización de perfil y correo

**Estado:** aprobada
**Decisión:** guardar primero `profiles` y después solicitar el cambio de correo en Auth. Si Auth falla, informar que nombre/fecha sí se guardaron para no ocultar un resultado parcial.

### ADR-PROFILE-007 — Recuperación de perfiles ausentes

**Estado:** aprobada
**Decisión:** el trigger cubre usuarios nuevos, el backfill cubre existentes al aplicar la migración y el cliente ejecuta un `ensureProfile` protegido por RLS como recuperación idempotente.

### ADR-PROFILE-008 — Limpieza de cache

**Estado:** aprobada
**Decisión:** eliminar queries de perfil al recibir `SIGNED_OUT` para no conservar datos personales de una sesión anterior en memoria.

## Bloqueos/dependencias

```text
BLOCKER-ID: PROFILE-DEPENDENCY-001
Fecha: 2026-08-21
Etapa: Rama/PR
Descripción: el PR feature/facebook-auth aún no está fusionado a main.
Qué falta: fusionar el PR anterior y actualizar esta rama antes de abrir el PR de profiles.
Quién puede resolverlo: propietario del repositorio.
Impacto: no bloquea implementación local; el PR de esta fase será apilado hasta actualizar la base.
```

```text
BLOCKER-ID: PROFILE-DB-APPLY-001 — RESUELTO
Fecha: 2026-08-21
Etapa: Base de datos remota
Descripción: la migración está versionada, pero el entorno sólo dispone de URL y publishable key; esas credenciales no pueden ejecutar DDL.
Resolución: el propietario aplicó `supabase/migrations/202608210001_create_profiles.sql` directamente mediante SQL Editor el 2026-08-21.
Quién puede resolverlo: propietario del proyecto Supabase o Codex con una sesión administrativa autorizada.
Resultado: la API reconoce `public.profiles`; una solicitud anónima recibe `permission denied`, conforme a los grants definidos.
```

## Registro

| Fecha | Etapa | Cambio | Validación | Resultado |
|---|---|---|---|---|
| 2026-08-21 | planificación | alcance, esquema inicial, ADR y pruebas | revisión contra fases 01/02 | fase iniciada |
| 2026-08-21 | ramas | rama apilada desde feature/facebook-auth | referencias remotas actualizadas | dependencia registrada |
| 2026-08-21 | base de datos | tabla profiles, grants, RLS, triggers y backfill | revisión contra documentación oficial | migración creada; aplicación remota pendiente |
| 2026-08-21 | capa de datos | tipos, servicio get/ensure/update y QueryClient | type-check inicial | tipos aprobados |
| 2026-08-21 | integración | YO, Editar perfil, Suscripción e Inicio consumen profile con fallback Auth | inspección y type-check inicial | conectado |
| 2026-08-21 | registro email | signup ahora envía nombre y teléfono como metadata inicial | revisión de contrato | trigger puede poblar registros nuevos |
| 2026-08-21 | calidad | validación de código de la fase | TypeScript, lint dirigido, diff-check | aprobado |
| 2026-08-21 | estado | preparación para despliegue de esquema | revisión de credenciales disponibles | aplicación remota bloqueada por acceso administrativo |
| 2026-08-21 | base de datos remota | migración aplicada manualmente en SQL Editor | consulta REST con publishable key sin sesión | tabla disponible; acceso anon denegado |
