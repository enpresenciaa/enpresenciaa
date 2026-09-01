# Exercise domain foundation

> Fase de auditoría y diseño. No implementa conexiones, no aplica SQL y no modifica el esquema.

# AI QUICK CONTEXT

## Problema que resuelve

Define una base revisable para que Camino, Nivel, Ejercicio, Bitácora y Home compartan un dominio normalizado de catálogo, progreso actual y finalizaciones históricas sin duplicar datos ni confiar en el cliente móvil.

## Evidencia y alcance

- Fuente principal: migraciones versionadas, tipos y código local al 2026-08-28.
- La migración `202608270001_create_journal_domain.sql` creó el dominio inicial.
- Después de la aplicación reportada, PostgREST confirmó la existencia remota de `exercise_contents` y `completion_reflections`; Storage confirmó el bucket privado `exercise-content`, y anon recibió `42501`. La paridad exacta de columnas, constraints, policies y triggers todavía no fue introspeccionada.
- Esta fase solo crea archivos en `phases/05-exercise-domain-foundation/`.

## Tablas y vista actuales

- `public.levels`: catálogo global mínimo; real, incompleto para Camino.
- `public.exercises`: catálogo global mínimo; real, sin posición ni contrato de contenido resuelto.
- `public.exercise_progress`: estado actual único por usuario/ejercicio; real, pero permite escritura directa excesiva.
- `public.exercise_completions`: eventos históricos de finalización/repetición; real.
- `public.journal_entries`: vista derivada de progreso parcial y finalizaciones; real y consumida por Bitácora.
- `auth.users`: propietario de datos privados; administrada por Supabase Auth.

## RPC y funciones actuales

- `complete_exercise(...)`: finalización atómica, `SECURITY DEFINER`, idempotencia por UUID, serialización por usuario/ejercicio, crea completion y lleva progreso a 100.
- `set_journal_updated_at()`: trigger genérico para `updated_at`.

## Vistas de app dependientes

- Bitácora: usa `journal_entries` mediante service + TanStack Query.
- Camino y detalle de nivel: aún usan `journey.mock.ts`.
- Ejercicio: placeholder; no lee catálogo ni escribe progreso.
- Home: perfil real, pero ejercicio actual, recientes, actividad y racha son mock.
- Notificaciones: mock; no existe tabla relacionada en este dominio.

## Decisiones cerradas

- Level 1:N Exercise.
- Coordenadas del mapa permanecen locales.
- `exercise_progress` representa estado actual.
- `exercise_completions` representa eventos históricos repetibles.
- `journal_entries` es un read model derivado, no una tercera fuente de historial.
- Catálogo global separado de datos del usuario.
- El cliente móvil no debe ser autoridad de finalización, propietario ni timestamps críticos.
- Un ejercicio puede ofrecer audio, video y texto como modalidades alternativas mediante `exercise_contents`.
- La reflexión pertenece a una completion concreta, no al read model de Bitácora.
- Premium pertenece al Level y sus ejercicios heredan el requisito de acceso.
- Un Level se desbloquea cuando todos los ejercicios publicados del anterior están completados.
- Sin pasos verificables no existe porcentaje parcial: el estado efectivo es 0 o 100; `complete_exercise` establece 100.
- Audio y video se almacenarán en el bucket privado `exercise-content`; la base guarda la ruta, no una URL pública permanente.
- La reflexión editable vive en una tabla 1:1 asociada a la completion.
- `is_premium` se persiste como metadata, pero todavía no bloquea acceso.
- La migración estructural no carga mocks ni inventa catálogo oficial.

## Decisiones abiertas

- Contenido oficial y cantidad real de ejercicios por nivel.
- Definición futura de pasos verificables si producto necesita porcentajes intermedios.

## No hacer todavía

- No aplicar la migración propuesta sin revisión, staging y autorización explícita.
- No conectar UI ni crear hooks/services de Camino.
- No modificar `database.ts`.
- No insertar catálogo ni convertir los nombres mock en contenido oficial.
- No eliminar mocks.
- No inventar entitlements, catálogo ni pasos de avance que todavía no están definidos.

# CURRENT STATE

## IMPLEMENTED

- Tablas `levels`, `exercises`, `exercise_progress`, `exercise_completions`.
- Vista `journal_entries`.
- RPC `complete_exercise` y triggers de `updated_at`.
- RLS local declarada en catálogo y datos privados.
- Bitácora conectada a Supabase.

## VALIDATED

- Evidencia local: migraciones, tipos y consumo frontend auditados.
- Evidencia REST previa: objetos expuestos por PostgREST y acceso `anon` denegado.
- No hubo mutación remota en esta fase.

## PARTIAL

- Catálogo carece de descripción, posición por nivel y estado editorial.
- `content_type` existe sin constraint ni semántica confirmada.
- RPC es atómica, pero acepta fecha del cliente y no valida publicación/acceso.
- RLS aísla propietario, pero permite INSERT/UPDATE directo de progreso.

## PENDING

- Aprobación de decisiones de producto.
- Introspección remota completa y matriz RLS con usuarios A/B.
- Catálogo oficial.
- Contratos y migración incremental definitivos.

## PROPOSED

- Estado editorial explícito para catálogo.
- `position` única dentro del nivel.
- Descripción y duración estimada.
- Escritura de progreso/finalización solo mediante operaciones servidoras validadas.
- Contratos `RemoteLevel`, `LocalJourneyLayout`, `JourneyLevel`, `LevelDetail` y `ExerciseDetail`.

## Documentos

- [AUDIT.md](./AUDIT.md): inventario verificable.
- [DOMAIN.md](./DOMAIN.md): entidades, invariantes y contratos.
- [DATABASE.md](./DATABASE.md): propuesta incremental e índices.
- [SECURITY.md](./SECURITY.md): RLS, zero trust y revisión de riesgos.
- [DECISIONS.md](./DECISIONS.md): ADRs y decisiones abiertas.
- [QUALITY.md](./QUALITY.md): estrategia de pruebas.
- [schema-proposal.dbml](./schema-proposal.dbml): ERD propuesto, no aplicado.
- [proposed-foundation-migration.sql](./proposed-foundation-migration.sql): SQL estructural revisable, no aplicado.
- [ROLLBACK.md](./ROLLBACK.md): estrategia de reversión y roll-forward.
- [REMOTE_VALIDATION.md](./REMOTE_VALIDATION.md): evidencia remota, límites y riesgo de reproducibilidad.
