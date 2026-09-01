# Seguridad y zero trust

> Diseño futuro; no aplicado.

## Principio

La publishable key es pública por diseño. La seguridad depende de grants, RLS, constraints y funciones servidoras, no de filtros React Native.

## Catálogo

### Estado actual

- `authenticated`: SELECT de todos los niveles y ejercicios.
- `anon`: sin acceso.
- App móvil: sin grants de mutación.
- `service_role`: ALL.

### Estado esperado

- Authenticated puede SELECT únicamente contenido publicado y permitido.
- Mobile authenticated no puede INSERT, UPDATE ni DELETE catálogo.
- Draft/archived solo es visible a una futura función/panel administrativo autorizado.
- Administración futura mediante panel admin con claims/rol verificado, service role en entorno servidor o migraciones/seeds revisados. Nunca service role dentro de la app.

## Datos privados

### `exercise_progress`

| Operación | Diseño esperado |
|---|---|
| SELECT | propio, `auth.uid() = user_id` |
| INSERT | preferentemente RPC; no escritura arbitraria |
| UPDATE | preferentemente RPC; validar transición/porcentaje/fecha |
| DELETE | no permitido al cliente |

### `exercise_completions`

| Operación | Diseño esperado |
|---|---|
| SELECT | propio |
| INSERT | solo `complete_exercise` |
| UPDATE | no permitido; evento inmutable |
| DELETE | no permitido; retención/borrado de cuenta se resuelve en servidor |

### `journal_entries`

- SELECT autenticado bajo RLS de tablas base.
- Sin operaciones de escritura porque es view derivada.
- El filtro frontend por user ID es defensa/eficiencia, no autorización.

## Zero trust: autoridad por dato

| Dato | Cliente puede enviar | PostgreSQL debe derivar/validar |
|---|---|---|
| `exercise_id` | sí | existencia, publicación y acceso |
| `user_id` | no | `auth.uid()` |
| idempotency/attempt key | sí, UUID opaco | formato, correspondencia y unicidad |
| porcentaje parcial | puede reportar avance | rango y transición permitida |
| completion definitiva | solicita | servidor decide y persiste |
| `completed_at` autoritativo | no | `clock_timestamp()`/`now()` |
| duración observada | puede reportar | rango y límites razonables |
| puntuación emocional | sí | rango permitido |
| repetición | no | servidor calcula bajo transacción |
| desbloqueo | no | servidor deriva de progreso y reglas |
| acceso premium | no | no bloquea todavía; servidor validará entitlement cuando exista su fuente |

## Revisión de riesgos

### HIGH — progreso arbitrario

Authenticated tiene INSERT/UPDATE directo sobre `exercise_progress`. RLS impide escribir a otro usuario, pero permite poner 100%, fechas futuras o transiciones inválidas en el propio registro. Impacto: Camino, Home y Bitácora pueden mostrar estados no respaldados por completion.

Propuesta: revocar mutación directa. Mientras no existan pasos verificables, no exponer porcentaje parcial arbitrario; solo `complete_exercise` establece 100.

### HIGH — timestamp controlado por cliente

`complete_exercise` acepta `p_completed_at` y lo usa en completion y progreso. Impacta orden, filtros, calendario y racha.

Propuesta: timestamp autoritativo del servidor; si se requiere captura offline, guardar `client_recorded_at` separado y no usarlo para reglas críticas.

### HIGH — idempotency key reutilizada entre ejercicios

La lookup usa usuario+key y devuelve la fila previa sin verificar ejercicio. Una colisión/reutilización errónea puede responder con la completion de otro ejercicio.

Propuesta: validar coincidencia explícita y fallar; evaluar scope de UNIQUE por usuario+ejercicio+attempt.

### MEDIUM — catálogo sin estado editorial

Authenticated lee todas las filas porque policies usan `true`. Cuando existan drafts quedarán expuestos.

Propuesta: publication status y policies de SELECT publicado.

### MEDIUM — cascade desde Exercise

FK de progreso/completion usa `ON DELETE CASCADE`. Un borrado administrativo accidental de ejercicio elimina estado e historial.

Propuesta: evitar DELETE físico con archived y evaluar migrar FKs a RESTRICT antes de habilitar herramientas administrativas.

### MEDIUM — acceso no validado en RPC

La FK valida existencia, no publicación ni desbloqueo. La regla aprobada exige completar todos los Exercise publicados del Level anterior. `is_premium` será solo metadata hasta que exista un modelo real de entitlement; no debe producir un bloqueo prematuro.

### MEDIUM — semántica libre de `content_type`

Texto sin enum/check permite valores incompatibles. La propuesta mantiene `content_type` como legado y normaliza contenido nuevo en `exercise_contents`; audio/video se vinculan por ruta a un bucket privado.

### LOW — tipos manuales de relaciones

`database.ts` usa `Relationship[]` genérico; reduce seguridad del query builder para joins. Se corregirá al generar tipos tras aprobar/aplicar la migración.

### Controles correctos existentes

- UUIDs no secuenciales.
- `auth.uid()` determina propietario en RPC.
- `SECURITY DEFINER` fija `search_path = ''`.
- Execute de RPC revocado a anon/public.
- Completion no es mutable desde cliente.
- CHECKs de porcentaje, repetición, duración y puntuación.
- Transacción y constraints respaldan idempotencia/concurrencia.

## Idempotencia esperada

```text
misma attempt key + mismo user + mismo exercise
  → misma completion lógica
  → mismo resultado
  → sin segunda fila

misma attempt key + ejercicio diferente
  → error explícito de conflicto

attempt key diferente
  → repetición nueva válida si reglas de acceso lo permiten
```

El cliente debe persistir temporalmente la attempt key hasta recibir respuesta definitiva. Un timeout, reconexión o cierre posterior al envío debe reutilizar la misma llave.

## Concurrencia

La estrategia actual combina:

1. transacción de función;
2. búsqueda idempotente;
3. advisory transaction lock por usuario+ejercicio;
4. segunda búsqueda dentro del lock;
5. UNIQUE de idempotencia y repetición;
6. upsert de progreso.

El lock sí está justificado mientras `repetition_number` se calcule con `max + 1`. No agregar locks más amplios. Si el número de repetición deja de ser persistido, reevaluar la necesidad.

## Matriz RLS futura

| Escenario | Resultado esperado |
|---|---|
| A SELECT nivel publicado | permitido |
| B SELECT nivel publicado | permitido |
| A SELECT draft | denegado/oculto |
| A INSERT/UPDATE/DELETE level/exercise | denegado |
| A SELECT progreso A | permitido |
| A SELECT progreso B | cero filas/denegado |
| B UPDATE progreso A | denegado |
| A SELECT completion A | permitido |
| A SELECT completion B | cero filas/denegado |
| A SELECT journal A | permitido |
| A SELECT journal B | cero filas/denegado |
| anon SELECT catálogo/progreso/completion/journal | denegado |
| anon EXECUTE complete_exercise | denegado |

## Borrado

- Catálogo referenciado: archivar, no borrar.
- Progreso/completions: sin DELETE móvil.
- Eliminación integral de cuenta: cascades desde `auth.users` pueden cumplir privacidad, pero requieren prueba explícita y política de retención.
