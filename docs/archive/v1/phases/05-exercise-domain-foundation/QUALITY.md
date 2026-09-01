# Estrategia de calidad futura

> No se ejecutan pruebas de migración porque no existe SQL aprobado/aplicado en esta fase.

## STATIC

- Comparar migración aprobada con `DATABASE.md` y DBML.
- Generar tipos Supabase y evitar `Relationships` genéricas.
- Type-check y ESLint de services/hooks/mappers.
- Detectar imports de mocks restantes antes de retirarlos.
- Confirmar ausencia de coordenadas en DB y service-role key en app.

## DATABASE

### Integridad

| Caso | Esperado |
|---|---|
| Exercise con level inexistente | FK rechaza |
| Posición duplicada en mismo level | UNIQUE rechaza |
| Misma posición en level distinto | permitido |
| Progress duplicado user/exercise | PK rechaza o upsert controlado |
| Porcentaje -1 | CHECK rechaza |
| Porcentaje 101 | CHECK rechaza |
| Porcentaje distinto de 0/100 sin pasos verificables | RPC rechaza/no lo genera |
| Duración negativa | rechaza |
| Puntuación fuera de 1..5 | rechaza |
| DELETE de exercise con historial | rechaza/solo archived |

### Backfill

- Detectar números de Level duplicados.
- Detectar nombres/posiciones duplicadas por Level.
- Detectar progress 100 sin completion.
- Detectar timestamps futuros/anómalos.
- Detectar idempotency key asociada a ejercicios distintos.

## RLS

Ejecutar con usuarios A y B y rol anon. Matriz completa en `SECURITY.md`.

- A/B leen catálogo publicado.
- A/B no mutan catálogo.
- A solo ve/actualiza operaciones permitidas propias.
- B no lee ni modifica datos A.
- Anon no accede a catálogo privado, progreso, completions, journal ni RPC.
- Cambiar `.eq(user_id)` del cliente no evita/otorga acceso.

## RPC

### Flujo feliz

- Sesión autenticada + ejercicio publicado/accesible.
- Crea una completion.
- Progress queda 100.
- Journal muestra una entrada completada.
- Retorno coincide con fila persistida.

### Validaciones

- Sin sesión: rechazado.
- Exercise inexistente: rechazado.
- Exercise draft/archived: rechazado.
- Level previo con algún Exercise publicado incompleto: rechazado.
- Level premium sin entitlement: rechazado.
- Level premium con entitlement: permitido si cumple desbloqueo.
- Duración/puntuación inválidas: rechazado.
- Fecha autoritativa coincide con servidor.
- `user_id` siempre es auth.uid().
- Reproducir audio/video sin completar explícitamente no cambia el progreso a 100.

## IDEMPOTENCY

| Caso | Esperado |
|---|---|
| misma attempt key ×2 secuencial | una completion, mismo resultado lógico |
| retry después de timeout | una completion |
| reconexión con misma key | una completion |
| app cierra después de enviar y reintenta | una completion |
| misma key concurrente | una completion |
| misma key + otro exercise | conflicto explícito |
| key distinta + mismo exercise | repetición nueva si reglas permiten |

## CONCURRENCY

- Lanzar 2, 10 y 50 requests simultáneos con misma key.
- Lanzar requests simultáneos con keys distintas para el mismo exercise.
- Confirmar repetition_number sin duplicados.
- Confirmar progress consistente en 100.
- Confirmar que una excepción revierte completion y progress juntos.
- Revisar bloqueos/latencia con `pg_locks` en entorno no productivo.

## JOURNAL

- Progreso parcial produce una entrada `in_progress`.
- Completion produce una entrada 100/Realizado.
- Progress 100 no duplica completion.
- Cada repetición aparece como entrada independiente.
- Filtros semana/mes respetan `America/Mexico_City`.
- Paginación conserva orden estable.
- Reflexión solo se muestra si el modelo aprobado la expone.

## FRONTEND CONTRACT

- Mapper remoto rechaza campos requeridos null.
- Level sin layout local genera error de configuración controlado, no coordenadas inventadas.
- Layout extra sin Level publicado se ignora/reportea.
- Conteos y porcentajes derivados coinciden con filas reales.
- Query keys incluyen user ID.
- Logout elimina Journey/Level/Exercise/Home/Journal privados.
- Completion invalida todas las queries definidas en `DOMAIN.md`.

## PERFORMANCE

- EXPLAIN de catálogo por número.
- EXPLAIN de exercises por level/position.
- EXPLAIN de progress del usuario.
- EXPLAIN de completions recientes y por exercise.
- Probar 13, 50 y 100 niveles sin cambio estructural.
- Probar historial de 100, 1,000 y 10,000 completions por usuario con paginación.

## Evidencia requerida

Para cada prueba registrar:

- fecha y ambiente;
- migración/commit exactos;
- rol/usuario sanitizado;
- precondición;
- request;
- resultado esperado/observado;
- evidencia sin tokens ni PII.

## Gates antes de aplicar la migración estructural propuesta

- Bucket privado y policies de `exercise-content` probados con usuario autenticado y anon.
- RLS 1:1 de reflexiones probada con completions de usuarios A y B.
- La validación premium permanece excluida hasta que exista una fuente de entitlement.
- Plan de rollback/roll-forward.
- Prueba local/staging.
- Tipos regenerados después de aplicar, no antes.
- Matriz RLS A/B aprobada.

## Gates adicionales para activar el catálogo

- Catálogo/backfill oficial disponible.
- Revisión de seguridad de RPC.
- Posiciones completas y sin duplicados.
- Policies de catálogo publicado validadas antes de retirar las policies actuales.
- Desbloqueo probado con niveles consecutivos y ejercicios draft/archived.
