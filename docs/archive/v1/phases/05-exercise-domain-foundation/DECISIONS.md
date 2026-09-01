# Decisiones arquitectónicas

## ADR-001 — Level 1:N Exercise

- Estado: **Accepted**
- Decisión: un nivel contiene N ejercicios y cada ejercicio tiene un único `level_id`.
- Motivo: soporta uno, trece o cientos sin tablas/columnas por nivel.
- Consecuencia: orden único (`level_id`, `position`).

## ADR-002 — Coordenadas locales

- Estado: **Accepted**
- Decisión: posiciones de cueva/cámara viven en `journey-layout.ts`, unidas por `level.number`.
- Motivo: son configuración de una implementación visual móvil, no negocio.
- Consecuencia: no agregar x/y/map_position a PostgreSQL.

## ADR-003 — Progress separado de Completion

- Estado: **Accepted**
- Decisión: progreso es snapshot único; completion es evento histórico repetible.
- Motivo: evita sobrescribir historial y duplicar snapshots por repetición.
- Consecuencia: una repetición agrega completion y actualiza el mismo progress.

## ADR-004 — Journal como read model

- Estado: **Accepted**
- Decisión: `journal_entries` permanece derivada mientras no posea información independiente.
- Motivo: Bitácora necesita una forma de lectura, no una tercera copia del historial.
- Consecuencia: no crear otra tabla `history`.

## ADR-005 — Catálogo global

- Estado: **Accepted**
- Decisión: niveles/ejercicios no llevan user_id; datos del usuario viven aparte.
- Motivo: catálogo compartido y administrado por la empresa.

## ADR-006 — Cliente sin autoridad definitiva

- Estado: **Accepted**
- Decisión: usuario, fecha autoritativa, repetición, finalización, desbloqueo y acceso deben derivarse/validarse en servidor.
- Motivo: RLS por propietario no impide manipular datos propios.

## ADR-007 — Estado editorial en vez de DELETE

- Estado: **Proposed**
- Propuesta: `draft|published|archived` en catálogo.
- Motivo: conservar progreso/historial y ocultar contenido no publicado.
- Pendiente: nomenclatura final y herramientas administrativas.

## ADR-008 — No duplicar name/title

- Estado: **Proposed**
- Propuesta: conservar `name` como título visible.
- Alternativa: agregar `title` solo si `name` pasa a ser identificador interno o existe localización.

## ADR-009 — Attempt key

- Estado: **Proposed**
- Propuesta: conservar `idempotency_key` como attempt key, validar correspondencia con Exercise y definir explícitamente su scope.
- Motivo: la implementación actual ya resuelve retries del mismo ejercicio, pero falla silenciosamente ante reutilización entre ejercicios.

# Decisiones confirmadas el 2026-08-28

## Q1 — Audio, video y texto

- Estado: **Accepted**
- Decisión: son modalidades alternativas del mismo Exercise.
- Implementación conceptual: Exercise 1:N ExerciseContent.
- Pendiente subordinado: payload, Storage y localización.

## Q2 — Reflexión

- Estado: **Accepted** para pertenencia
- Decisión: pertenece a una ExerciseCompletion concreta, no a JournalEntry.
- Pendiente subordinado: si será editable/versionable; esto decide columna frente a tabla 1:1.

## Q3 — Premium

- Estado: **Accepted**
- Decisión: pertenece al Level; sus Exercise lo heredan.
- Pendiente subordinado: fuente y validación de entitlement.

## Q4 — Cantidad real de ejercicios

- Estado: **Blocked** para contenido, no para arquitectura.
- La relación N soporta cualquier cantidad; falta catálogo oficial.

## Q5 — Desbloqueo

- Estado: **Accepted**
- Decisión: un Level se desbloquea al completar todos los Exercise publicados del Level anterior.
- Premium exige además entitlement; draft/archived no participan.

## Q6 — Progreso parcial

- Estado: **Accepted**
- Decisión: mientras no existan pasos verificables, solo 0 y 100 son estados efectivos.
- `complete_exercise` establece 100; playback no completa automáticamente.
- Si aparecen pasos obligatorios, PostgreSQL derivará el porcentaje de pasos completados/requeridos.

# Decisiones todavía abiertas

- Catálogo oficial y cantidad real de Exercise por Level.

## Q7 — Almacenamiento de contenido

- Estado: **Accepted**
- Decisión: audio y video viven en el bucket privado `exercise-content`; PostgreSQL guarda `storage_path`, no una URL pública permanente.
- Texto vive en `exercise_contents.text_content`.
- Cada contenido declara modalidad, locale, MIME y estado editorial según corresponda.

## Q8 — Edición de reflexión

- Estado: **Accepted**
- Decisión: `completion_reflections` mantiene una relación 1:1 con `exercise_completions` y permite editar el texto sin volver mutable el evento de finalización.
- Seguimiento solicitado: explicar posteriormente y con más detalle la relación 1:1 y por qué se separa.

## Q9 — Premium antes de entitlements

- Estado: **Accepted**
- Decisión: persistir `levels.is_premium`, pero no bloquear acceso hasta que exista una fuente real de suscripción/entitlement validable en servidor.

## Q10 — Catálogo inicial

- Estado: **Accepted**
- Decisión: la migración crea estructura, no convierte mocks en seeds ni inventa contenido oficial.

## Decisiones deprecated

- **Deprecated:** tratar “Puerta” como entidad diferente de Level. El término correcto acordado es Nivel.
- **Deprecated:** usar el mock como catálogo oficial o seed de producción.
