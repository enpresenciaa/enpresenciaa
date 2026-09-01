# Ejercicios, Camino y progreso V1

- Fecha: 2026-08-31
- Rama/HEAD: `feature/journey-journal-foundation` / `c302f0e96aa46b9afb26dc4e4f1ccf0cf726068f`
- Fuentes: Journey/Home/Journal, mocks, migraciones 20260827/28 y fases 04/05.

## Camino

La vista implementa un mapa vertical desplazable sobre `CaminoBG.png`. Fondo y nodos usan coordenadas relativas; 13 niveles, statuses, nivel actual y 39 ejercicios se generan en `journey.mock`. Los botones fueron reducidos y reposicionados según cambios visuales recientes sin commit. No se hace query a `levels` o `exercises`.

Estados visuales: completed, available, in_progress, locked y premium. Solo completed/available/in_progress abren nivel. Premium es semántica mock; no consulta suscripción ni entitlement.

## Dominio SQL disponible

Existen tablas para catálogo, contenido multimodal/localizado, progress, completions y reflections; RPC idempotente `complete_exercise`; vista `journal_entries`; bucket privado. La migración posterior deja el catálogo en draft y registra activación/backfill como pendiente.

La presencia del esquema no implica un flujo funcional: la app no lista catálogo remoto, no descarga contenido, no llama `complete_exercise`, no escribe progress/reflection y no implementa unlock/daily limit.

## Matriz funcional

| Concepto | UI | SQL | Conexión/validación |
|---|---|---|---|
| Montaña/cuevas | sí | niveles genéricos | mock visual |
| Catálogo | lista mock 13x3 | levels/exercises | no conectado |
| Contenido | detalle placeholder | exercise_contents + Storage | no conectado |
| Progreso | Home/Journey mock | exercise_progress | no conectado |
| Finalización | no | RPC/completions | no consumidor |
| Historial | Journal real | view completions/progress | query real; requiere datos creados fuera de UI |
| Racha | Home 7 días | no modelo específico | mock |
| Emoción | selector inicial local; Journal muestra score | emotional_score completion | no persistencia UI |
| Reflexión | no UI de captura | completion_reflections | no conectado |
| Límite diario | no | no constraint/regla | inexistente |
| Premium | etiquetas mock | `is_premium` | sin entitlement |

## Bitácora

La tab etiquetada “Bítacora” monta Journal real: pagina, filtra semana/mes en `America/Mexico_City`, busca y distingue partial/completed. Sus 6 tests unitarios pasan. No crea entradas; es un read model de actividad.

## Home

Motivación, racha, ejercicio actual, recientes, fechas y actividad vienen de `homeMock`; solo nombre/avatar provienen de Profile/Auth. Navegar al ejercicio abre un placeholder con el ID mock.

## Riesgos V1

- `complete_exercise` acepta timestamp cliente y progress directo sigue permitido.
- No existen reglas de desbloqueo, asignación, uno por día o entitlements.
- Coordenadas y IDs mock (`"1"`, `"4"`, `"1-1"`) no son UUID SQL.
- `CaminoBG.png` actual no está en HEAD.
- Validación visual/device de la última geometría sigue pendiente.

## Preservar para V2

Conservar semántica de catálogo/contenido/completion/reflection y la vista Journal como referencia; rediseñar navegación lineal, fuente remota y reglas diarias antes de conectar. Ver `V2_MIGRATION_INPUT.md`.
