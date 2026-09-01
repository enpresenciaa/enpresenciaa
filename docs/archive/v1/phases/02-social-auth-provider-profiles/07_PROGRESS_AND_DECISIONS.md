# Progreso y decisiones — Social Auth y perfiles

## Estado general

```text
Fase: Social Auth y perfiles de proveedor
Estado: IN_PROGRESS
```

Estados permitidos:

```text
PLANNED
IN_PROGRESS
READY_FOR_EXTERNAL_CONFIG
READY_FOR_TEST
DONE
BLOCKED
```

## Progreso

- [x] Alcance inicial acordado.
- [x] Disponibilidad de cuenta y aplicación de Meta confirmada.
- [x] Ausencia actual de privacidad pública documentada.
- [x] Restricciones actuales de Apple documentadas.
- [x] PR de corrección de sesión integrado a `main`.
- [x] Inspector seguro implementado y probado con Google.
- [x] Servicio OAuth generalizado.
- [ ] Facebook configurado en Meta y Supabase.
- [ ] Facebook probado de extremo a extremo.
- [ ] Apple preparado en código.
- [ ] Apple configurado y probado externamente.
- [ ] Comparativa de datos completada.
- [ ] Modelo normalizado aprobado.

## Decisiones

### ADR-SOCIAL-001 — Inspector antes del perfil definitivo

**Estado:** aprobada

Se observarán datos reales sanitizados antes de definir una tabla o contrato persistente de perfil.

### ADR-SOCIAL-002 — Facebook en modo Development

**Estado:** aprobada

El desarrollo se validará únicamente con cuentas que tengan rol en Meta mientras no existan privacidad y eliminación de datos públicas.

### ADR-SOCIAL-003 — Apple nativo en iOS

**Estado:** aprobada

La primera implementación usará autenticación nativa de Apple. Android y web quedan fuera de alcance hasta una aprobación independiente.

### ADR-SOCIAL-004 — Estado de Apple verificable

**Estado:** aprobada

La implementación puede quedar preparada, pero no se marcará terminada sin credenciales, firma y prueba real en iOS.

## Registro de datos por proveedor

| Campo | Google | Facebook | Apple | Decisión |
|---|---|---|---|---|
| email | Disponible y verificado | Pendiente | Pendiente | Candidato normalizado |
| display name | Disponible en `full_name` y `name` | Pendiente | Sólo primera autorización por validar | Priorizar `full_name` |
| avatar | Disponible en `avatar_url` y `picture` | Pendiente | No esperado | Priorizar `avatar_url` |
| phone | Cadena vacía | Pendiente | No esperado | Tratar vacío como ausente |
| provider identity | Disponible | Pendiente | Pendiente | Conservar sólo para vinculación |

## Bloqueos activos

- Apple Developer Program no disponible actualmente.
- Prueba iOS firmada pendiente.
- Política de privacidad pública pendiente para publicación de Facebook.
- Eliminación de datos pública pendiente para publicación de Facebook.
