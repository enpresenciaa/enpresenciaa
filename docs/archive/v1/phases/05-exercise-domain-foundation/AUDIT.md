# Auditoría del dominio actual

> Evidencia local al 2026-08-28. No se ejecutó introspección SQL remota: **estado remoto no verificado** para paridad exacta. Una prueba REST previa solo confirmó existencia y denegación a `anon`.

## Fuentes inspeccionadas

- `supabase/migrations/202608210001_create_profiles.sql`
- `supabase/migrations/202608270001_create_journal_domain.sql`
- `src/types/database.ts`
- `src/lib/supabase.ts`
- `src/features/journal/**`
- `src/features/journey/**`
- `src/features/home/screens/HomeScreen.tsx`, `src/mocks/home.ts`
- `src/features/notifications/screens/NotificationsScreen.tsx`, `src/mocks/notifications.ts`
- `src/app/exercise/[exerciseId].tsx`

## Resumen de responsabilidades actuales

| Objeto | Responsabilidad verificable | Fuente de verdad |
|---|---|---|
| `levels` | catálogo mínimo de niveles | sí, para identidad/número/nombre |
| `exercises` | catálogo mínimo de ejercicios por nivel | sí, para identidad/relación/nombre |
| `exercise_progress` | snapshot actual por usuario/ejercicio | sí, para porcentaje y última actividad |
| `exercise_completions` | eventos históricos/repeticiones | sí, para finalizaciones |
| `journal_entries` | proyección de lectura para Bitácora | derivada; no fuente independiente |

## TABLE: `public.levels`

### COLUMNS

| Columna | Tipo/condición |
|---|---|
| `id` | `uuid`, default `gen_random_uuid()` |
| `number` | `smallint not null`, `number > 0` |
| `name` | `text not null`, longitud trim 1..100 |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

### PK / FK / UNIQUE / CHECK

- PK: `id`.
- FK: ninguna.
- UNIQUE: `number`.
- CHECK: número positivo y nombre no vacío de máximo 100 caracteres.

### INDEXES / DEFAULTS / TRIGGERS

- Índices implícitos: PK y UNIQUE(`number`).
- Trigger `set_levels_updated_at` → `set_journal_updated_at()`.

### RLS / POLICIES / GRANTS

- RLS habilitado.
- `authenticated`: SELECT mediante policy `using (true)`.
- `authenticated`: sin INSERT/UPDATE/DELETE concedidos.
- `anon`: revocado.
- `service_role`: ALL.

### USAGE IN APP

- No existe consulta frontend directa.
- Bitácora obtiene `level_name` mediante `journal_entries`.
- Camino aún usa IDs numéricos/nombres/descripciones mock.

### Incompleto

- Sin descripción, posición editorial/publicación ni estrategia de archivado.
- Premium no confirmado.

## TABLE: `public.exercises`

### COLUMNS

| Columna | Tipo/condición |
|---|---|
| `id` | `uuid`, default `gen_random_uuid()` |
| `level_id` | `uuid not null` |
| `name` | `text not null`, longitud trim 1..140 |
| `content_type` | `text nullable`, sin constraint |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

### PK / FK / UNIQUE / CHECK

- PK: `id`.
- FK: `level_id → levels.id ON DELETE RESTRICT`.
- UNIQUE: (`level_id`, `name`).
- CHECK: solo longitud del nombre.

### INDEXES / DEFAULTS / TRIGGERS

- Índices implícitos: PK y UNIQUE(`level_id`, `name`).
- Trigger `set_exercises_updated_at`.

### RLS / POLICIES / GRANTS

- Igual que `levels`: lectura para cualquier authenticated, mutación solo administrativa.
- La policy no filtra publicado porque no existe estado editorial.

### USAGE IN APP

- Sin consulta directa desde Journey/Level/Exercise.
- Bitácora proyecta `exercise_name` y `content_type`.

### Incompleto

- Sin posición dentro del nivel, descripción, duración ni estado editorial.
- `content_type` es prematuro: no define si hay una modalidad o varias.
- `name` y un eventual `title` serían redundantes salvo que producto diferencie nombre interno y título público.

## TABLE: `public.exercise_progress`

### COLUMNS

| Columna | Tipo/condición |
|---|---|
| `user_id` | `uuid not null` |
| `exercise_id` | `uuid not null` |
| `progress_percentage` | `smallint not null default 0`, 0..100 |
| `last_activity_at` | `timestamptz not null default now()` |
| `created_at` | `timestamptz not null default now()` |
| `updated_at` | `timestamptz not null default now()` |

### PK / FK / UNIQUE / CHECK

- PK compuesta: (`user_id`, `exercise_id`), que garantiza máximo un snapshot actual.
- FK `user_id → auth.users.id ON DELETE CASCADE`.
- FK `exercise_id → exercises.id ON DELETE CASCADE`.
- CHECK porcentaje 0..100.

### INDEXES / DEFAULTS / TRIGGERS

- PK cubre consultas por (`user_id`, `exercise_id`).
- `exercise_progress_user_activity_idx(user_id, last_activity_at desc)`.
- `exercise_progress_user_percentage_idx(user_id, progress_percentage, last_activity_at desc)`.
- Trigger `set_exercise_progress_updated_at`.

### RLS / POLICIES / GRANTS

- SELECT/INSERT/UPDATE propios con `auth.uid() = user_id`.
- DELETE no concedido ni tiene policy.
- Riesgo: el aislamiento existe, pero un cliente autenticado puede declarar 100%, cambiar la fecha de actividad y saltarse la RPC.

### USAGE IN APP

- No hay escritor ni lector directo en Journey/Exercise.
- `complete_exercise` lo lleva a 100.
- `journal_entries` expone únicamente filas con porcentaje menor a 100.

### Semántica

- Estado actual, no historial.
- No contiene `status`, `started_at` ni `completed_at`.
- `created_at` puede representar primera creación solo si no se precrean filas; esa regla no está definida.
- `completed_at` no es necesario aquí mientras completion sea la fuente histórica y el porcentaje actual sea suficiente.

## TABLE: `public.exercise_completions`

### COLUMNS

| Columna | Tipo/condición |
|---|---|
| `id` | `uuid`, default aleatorio |
| `user_id` | `uuid not null` |
| `exercise_id` | `uuid not null` |
| `idempotency_key` | `uuid not null` |
| `repetition_number` | `integer not null`, > 0 |
| `completed_at` | `timestamptz not null default now()` |
| `duration_seconds` | entero nullable, >= 0 |
| `emotional_score` | smallint nullable, 1..5 |
| `created_at` | `timestamptz not null default now()` |

### PK / FK / UNIQUE / CHECK

- PK: `id`.
- FK usuario con cascade; FK ejercicio con cascade.
- UNIQUE (`user_id`, `idempotency_key`).
- UNIQUE (`user_id`, `exercise_id`, `repetition_number`).

### INDEXES

- `exercise_completions_user_completed_idx(user_id, completed_at desc)`.
- `exercise_completions_user_exercise_idx(user_id, exercise_id, completed_at desc)`.
- Índices implícitos de PK y ambos UNIQUE.

### RLS / POLICIES / GRANTS

- SELECT propio.
- Sin INSERT/UPDATE/DELETE para authenticated.
- Inserción mediante RPC `SECURITY DEFINER`.

### USAGE IN APP

- Bitácora la consume mediante la vista.
- Ninguna UI llama aún la RPC.

### Semántica

- Cada fila es una finalización/repetición histórica.
- `emotional_score` ya pertenece al intento; no existe reflexión textual.

## VIEW: `public.journal_entries`

### Definición

- View `security_invoker = true`.
- Rama 1: progreso parcial (`progress_percentage < 100`).
- Rama 2: todas las completions con porcentaje proyectado 100.
- Une catálogos para nombres y tipo de contenido.

### Seguridad y grants

- SELECT para authenticated; anon revocado.
- RLS se hereda de tablas base por `security_invoker`.
- El frontend agrega `.eq("user_id", userId)`, pero la seguridad real debe provenir de RLS.

### USAGE IN APP

- `journal.service.ts`: búsqueda, filtros de fecha, orden y paginación de 20.
- Es una proyección para Bitácora: no almacena datos, no acepta reflexión y no crea un tercer historial.

### Solapamiento resuelto

- Progreso 100 se excluye de la rama snapshot, evitando duplicarlo con completion.
- Una completion produce una entrada de Bitácora.
- Un progreso puesto directamente en 100 sin completion desaparece de Bitácora: evidencia de que la escritura directa es peligrosa.

## FUNCTION: `public.set_journal_updated_at()`

- Trigger function, `SECURITY INVOKER` por defecto.
- `search_path = ''`.
- Escribe `new.updated_at = now()`.
- Execute revocado a public/anon/authenticated; los triggers la usan internamente.

## RPC: `public.complete_exercise`

### Firma

```text
complete_exercise(
  p_exercise_id uuid,
  p_idempotency_key uuid,
  p_completed_at timestamptz default now(),
  p_duration_seconds integer default null,
  p_emotional_score smallint default null
) → exercise_completions
```

### Seguridad

- `SECURITY DEFINER` con `search_path = ''`.
- Execute solo `authenticated`; public y anon revocados.
- Obtiene propietario con `auth.uid()`, no acepta `user_id`.

### Validaciones

- Requiere sesión.
- Duración no negativa.
- Puntuación 1..5.
- La FK rechaza ejercicio inexistente, pero no existe validación explícita de publicación, estado o acceso.
- Acepta `completed_at` del cliente; esto contradice zero trust para reglas temporales.

### Transacción y efectos

- Una llamada a función es transaccional.
- Busca completion previa por (`user_id`, `idempotency_key`).
- Toma advisory transaction lock por usuario+ejercicio.
- Revalida idempotencia dentro del lock.
- Calcula `max(repetition_number) + 1`.
- Inserta exactamente una completion.
- Upsert de progreso a 100 y actualiza última actividad.
- No escribe `journal_entries`; la vista refleja el resultado automáticamente.

### Idempotencia y duplicados

- Misma llave para el mismo usuario devuelve la completion previa.
- Doble tap/retry no crea una segunda fila si reutiliza la llave.
- Llaves diferentes representan repeticiones distintas.
- Riesgo: la llave es única por usuario, no por ejercicio. Reutilizarla accidentalmente con otro ejercicio devuelve la completion anterior sin verificar `exercise_id`.
- Riesgo: dos ejercicios distintos con la misma llave pueden usar locks diferentes y competir por el UNIQUE global.

### Concurrencia

- El lock es justificable porque serializa el cálculo de `repetition_number` por usuario/ejercicio.
- El UNIQUE de repetición constituye defensa final.
- No hay doble historial ni corrupción porcentual para requests simultáneos del mismo ejercicio.

## Discrepancias documentación/código

- `PROJECT_STATE.md` dice que solo Profile usa PostgreSQL y que Bitácora es mock; ya no coincide con migraciones/código.
- La memoria de Camino registra escalas/estado anteriores a cambios recientes y sigue describiendo backend inexistente; la afirmación de mock sí continúa correcta.
- `database.ts` es manual y refleja el dominio nuevo, pero sus `Relationships` son genéricas y no equivalen a tipos generados con metadatos FK exactos.
