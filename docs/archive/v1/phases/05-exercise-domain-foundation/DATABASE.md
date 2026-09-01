# Propuesta incremental de base de datos

> **DRAFT — DO NOT APPLY**. La propuesta estructural revisable está en `proposed-foundation-migration.sql`. No publica catálogo, no activa bloqueo premium y no debe aplicarse sin validar primero el esquema remoto y staging.

# MIGRATION PLAN

## M1 — Estado editorial y descripción de Level

### CURRENT

`levels(id, number, name, created_at, updated_at)`.

### PROBLEM

Camino necesita descripción y el catálogo futuro necesita distinguir draft/publicado/archivado. La policy actual expone todas las filas authenticated.

### PROPOSED CHANGE

- Añadir `description text nullable`.
- Añadir `publication_status text` con dominio restringido `draft|published|archived`.
- Default seguro para filas nuevas: `draft`.
- Añadir `is_premium boolean not null default false`; premium pertenece al Level y se hereda a sus Exercise.

### BACKFILL

- No copiar nombres/descripciones del mock.
- Catálogo existente permanece `draft` hasta revisión editorial.
- Descripción se completa solo con contenido oficial.

### CONSTRAINT

- CHECK de valores editoriales.
- `number` conserva UNIQUE y tipo `smallint`.

### INDEX

- No agregar índice aislado de status inicialmente: el catálogo será pequeño y la consulta ordena por `number`.
- Si la consulta predominante filtra published y ordena, evaluar índice parcial `number WHERE publication_status='published'` después de medir.

### RLS IMPACT

- SELECT móvil debe limitarse a `publication_status = 'published'`.

### ROLLBACK / RISK

- Ocultar por error todo el catálogo si no se publica contenido tras backfill.
- Rollback lógico: policy temporal controlada; no eliminar columnas con datos editoriales.

## M2 — Posición y metadatos mínimos de Exercise

### CURRENT

`exercises(id, level_id, name, content_type, created_at, updated_at)` y UNIQUE (`level_id`, `name`).

### PROBLEM

No existe orden estable dentro del nivel, descripción, duración ni estado editorial. `content_type` no tiene semántica validada.

### PROPOSED CHANGE

- Añadir `position smallint` inicialmente nullable.
- Añadir `description text nullable`.
- Añadir `estimated_duration_minutes smallint nullable`.
- Añadir `publication_status text` con default `draft`.
- Conservar `name`; no agregar `title` sin distinción semántica.
- Mantener temporalmente `content_type` como legado; no añadir URL hasta definir el payload de `exercise_contents`.

### BACKFILL

- Posiciones deben venir de catálogo oficial, no de `Array.from` mock.
- Tras backfill validado, hacer `position not null`.
- No publicar automáticamente filas sin contenido revisado.

### CONSTRAINT

- `position > 0`.
- `estimated_duration_minutes > 0` cuando no sea null.
- UNIQUE (`level_id`, `position`).
- CHECK editorial.

### INDEX

- UNIQUE (`level_id`, `position`) cubre lista ordenada por nivel.
- El UNIQUE existente (`level_id`, `name`) puede conservarse mientras nombres sean únicos dentro del nivel; reevaluar localización futura.

### RLS IMPACT

- SELECT solo publicado y cuyo level también sea visible.
- Mobile sin mutaciones.

### ROLLBACK / RISK

- La imposición NOT NULL falla sin backfill completo.
- Reorder puede chocar con UNIQUE; requiere estrategia administrativa transaccional futura.

## M3 — Endurecer escritura de ExerciseProgress

### CURRENT

Authenticated puede INSERT y UPDATE de su fila, incluyendo porcentaje y `last_activity_at`.

### PROBLEM

RLS protege propiedad, no integridad de negocio. El cliente puede declararse completo sin completion.

### PROPOSED CHANGE

- Diseñar una función `save_exercise_progress` o equivalente.
- Derivar `user_id` y tiempo en servidor.
- Validar ejercicio publicado/accesible y transición de porcentaje.
- Revocar INSERT/UPDATE directo a authenticated solo después de que todos los escritores migren.

### BACKFILL

- Auditar filas con 100 sin completion, fechas futuras y ejercicios inexistentes antes de endurecer.

### CONSTRAINT

- Conservar PK y CHECK 0..100.
- No agregar status redundante.

### INDEX

- Conservar PK y `user_activity`.
- `user_percentage_activity` solo se conserva si Journey/Home ejecutarán esa forma de consulta; de lo contrario es candidato a eliminación posterior a EXPLAIN.

### RLS IMPACT

- SELECT propio permanece.
- Mutación directa se elimina; execute de RPC solo authenticated.

### ROLLBACK / RISK

- Revocar antes de desplegar el nuevo escritor rompe guardado parcial.
- Requiere rollout coordinado backend/app.

## M4 — Endurecer `complete_exercise`

### CURRENT

RPC atómica e idempotente; recibe fecha cliente y no valida publicación/acceso. Idempotencia es global por usuario.

### PROBLEM

- Timestamp manipulable.
- Una llave reutilizada con otro ejercicio devuelve una completion incorrecta.
- No hay concepto de catálogo publicado ni entitlement.

### PROPOSED CHANGE

- Mantener la función y evolucionarla incrementalmente.
- Derivar `completed_at` en servidor; opcionalmente aceptar `client_recorded_at` no autoritativo.
- Al encontrar una idempotency key previa, verificar mismo `exercise_id`; conflicto explícito si no coincide.
- Validar ejercicio publicado.
- Validar que todos los ejercicios publicados del Level anterior estén completos.
- Validar entitlement cuando el Level sea premium; el proveedor de entitlement sigue pendiente.
- Mantener inserción completion + upsert progress en una transacción.

### BACKFILL

- No requerido para timestamp futuro; sí auditar fechas anómalas existentes.
- No cambiar scope de UNIQUE sin revisar llaves actuales.

### CONSTRAINT

- Conservar UNIQUE de repetición.
- Elegir después de auditoría entre UNIQUE global de attempt por usuario o compuesto por ejercicio.

### INDEX

- Los existentes soportan lookup histórico y cálculo por ejercicio.

### RLS IMPACT

- Completion continúa solo SELECT propio.
- RPC continúa solo authenticated, `SECURITY DEFINER`, search path fijo.

### ROLLBACK / RISK

- Cambiar firma exige compatibilidad con versiones móviles anteriores.
- Preferir overload temporal o despliegue coordinado.

## M5 — Estrategia de borrado del catálogo

### CURRENT

- Level → Exercise es RESTRICT.
- Exercise → Progress/Completion es CASCADE.

### PROBLEM

Un DELETE administrativo de Exercise puede borrar historial privado.

### PROPOSED CHANGE

- Usar `archived` para catálogo referenciado.
- Evaluar FKs desde progress/completion a Exercise con RESTRICT.
- Reservar cascade desde auth.users para eliminación integral del usuario.

### BACKFILL

- Marcar obsoletos como archived, no borrarlos.

### CONSTRAINT / INDEX / RLS

- Sin índice adicional.
- RLS oculta archived a app, pero relaciones históricas deben conservar nombres según política de producto.

### ROLLBACK / RISK

- RESTRICT cambia procesos administrativos; requiere procedimiento explícito.

## M6 — Reflexión vinculada a Completion

- La reflexión es editable y pertenece a una completion.
- Usar `completion_reflections` con `completion_id` como PK/FK y RLS por propietario derivado.
- La relación 1:1 evita volver mutable el evento `exercise_completions`.
- Nunca duplicar completion en una tabla de journal persistida solo para mostrar historial.

## M7 — Modalidades mediante `exercise_contents`

- Está aprobada la relación Exercise 1:N ExerciseContent para audio, video y texto alternativos.
- Usar UNIQUE (`exercise_id`, `modality`, `locale`).
- Audio/video guardan `storage_path` y MIME; los binarios viven en el bucket privado `exercise-content`.
- Texto guarda `text_content`. No persistir URLs públicas permanentes.
- `content_type` actual permanece como legado hasta un backfill aprobado.

## M8 — Premium en Level

- `is_premium` pertenece a Level y los Exercise heredan el requisito.
- La columna puede formar parte de la propuesta incremental.
- No bloquear acceso todavía: la autorización se activa solamente cuando exista una fuente real de entitlements.

## M9 — Desbloqueo y progreso binario

- Desbloqueo: todos los Exercise publicados del Level anterior completados.
- Sin pasos verificables, progreso efectivo 0 o 100.
- `complete_exercise` establece 100; tiempo reproducido no equivale a completar.
- No crear todavía una RPC de porcentaje parcial.
- Si aparecen pasos oficiales, diseñar entidades/eventos y derivar el porcentaje en PostgreSQL.

# Estrategia de índices

| Consulta futura | Índice actual/propuesto | Justificación |
|---|---|---|
| Levels ordenados | UNIQUE `levels(number)` | cubre catálogo ordenado |
| Exercises de Level | UNIQUE propuesto (`level_id`, `position`) | filtra y ordena |
| Progreso puntual | PK (`user_id`, `exercise_id`) | lookup/upsert |
| Actividad reciente parcial | (`user_id`, `last_activity_at desc`) | Home/Journal |
| Progreso por porcentaje | actual (`user_id`, `progress_percentage`, `last_activity_at`) | conservar solo si Journey usa filtro/rango |
| Historial reciente | (`user_id`, `completed_at desc`) | Journal/Home/calendario |
| Repeticiones de ejercicio | (`user_id`, `exercise_id`, `completed_at desc`) | detalle/repetición |
| Journal | sin índice propio | view usa índices base |

No se propone `exercise_progress(user_id, status)` porque `status` no existe ni debe duplicarse sin regla demostrada.

# Escalabilidad

- `smallint` admite mucho más de 100 niveles/posiciones.
- Relaciones normalizadas evitan columnas o arrays por nivel.
- Cada nivel puede tener N ejercicios.
- Paginación histórica opera sobre índices por usuario/fecha.
- La view puede evolucionar a función paginada/materialización solo si métricas reales lo justifican.

# Orden de una futura migración aprobada

1. Añadir columnas nullable/default seguro.
2. Cargar/backfill oficial revisado en proceso separado.
3. Validar duplicados y datos anómalos.
4. Añadir constraints/UNIQUE/NOT NULL.
5. Crear policies nuevas sin retirar todavía writers compatibles.
6. Desplegar app/RPC nueva.
7. Revocar escrituras directas.
8. Ejecutar matriz RLS/RPC/concurrencia.

La propuesta estructural puede revisarse independientemente del catálogo. La migración de activación seguirá pendiente hasta disponer de catálogo/backfill oficial y, para bloqueo premium, una fuente real de entitlements.
