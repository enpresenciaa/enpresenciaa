# Validación remota posterior a la migración

Fecha: 2026-08-28.

## Confirmado

- `levels`, `exercises`, `exercise_progress`, `exercise_completions` y `journal_entries` continúan expuestos por PostgREST.
- `exercise_contents` existe en el esquema remoto.
- `completion_reflections` existe en el esquema remoto.
- El bucket privado `exercise-content` existe: el endpoint de listado respondió `200` y no expuso objetos.
- El rol público/anon recibió `42501 permission denied` al consultar todas las relaciones anteriores.

## No confirmado todavía

- Paridad exacta de columnas, defaults, CHECK, UNIQUE, FKs, triggers y policies con `proposed-foundation-migration.sql`.
- Lectura autenticada de contenido publicado.
- Aislamiento A/B de `completion_reflections`.
- Escritura y edición de una reflexión propia.
- Acceso a un objeto publicado del bucket mediante sesión autenticada.
- Registro de esta ejecución dentro de `supabase_migrations.schema_migrations`.

## Riesgo de reproducibilidad

Al momento de esta validación no existe un archivo nuevo equivalente dentro de `supabase/migrations/`; el SQL está únicamente en la memoria local ignorada `phases/`. Si fue ejecutado manualmente desde SQL Editor, el esquema remoto puede quedar adelantado respecto del historial versionado del repositorio.

Antes de crear una migración versionada se debe confirmar cómo fue aplicada. Copiar el mismo SQL a una migración pendiente y ejecutar después `db push` intentaría crear objetos que ya existen.
