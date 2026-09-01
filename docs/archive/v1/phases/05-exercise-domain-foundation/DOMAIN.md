# Modelo de dominio propuesto

> Diseño conceptual; no aplicado.

## Entidades

### User

- Identidad administrada por `auth.users`.
- Propietario de progreso y finalizaciones.
- No es propietario del catálogo.

### Level

- Nivel global y ordenado del Camino.
- Contiene uno o más ejercicios: `Level 1 ── N Exercise`.
- Su número es identidad editorial/orden global; no implica un máximo de 13.
- No almacena coordenadas visuales.

### Exercise

- Unidad practicable que pertenece exactamente a un Level.
- Tiene una posición única dentro de su nivel.
- Puede ofrecer varias modalidades alternativas mediante `ExerciseContent`.

### ExerciseContent

- Variante de consumo perteneciente a un Exercise.
- Modalidades confirmadas: audio, video y texto.
- Audio/video guardan una ruta hacia el bucket privado `exercise-content`; texto guarda `text_content`.
- La ruta no es una URL pública permanente. El acceso al objeto se autoriza con RLS.

### CompletionReflection

- Texto editable asociado 1:1 a una ExerciseCompletion.
- No modifica el evento histórico de finalización.
- Solo el propietario de la completion puede leerlo, crearlo o editarlo.

### ExerciseProgress

- Snapshot actual de un usuario para un ejercicio.
- Máximo uno por (`user_id`, `exercise_id`).
- No registra repeticiones ni sustituye el historial.

### ExerciseCompletion

- Evento inmutable de una finalización.
- Cada repetición válida crea una fila nueva con llave de intento distinta.
- Es la fuente verificable de actividad completada, racha, calendario e historial.

### JournalEntry

- Actualmente es un read model SQL, no una entidad persistida.
- Combina progreso parcial y finalizaciones para la UI de Bitácora.
- No debe transformarse en otra tabla de historial mientras no exista información independiente.

## Responsabilidades sin solapamiento

| Pregunta | Respuesta |
|---|---|
| ¿Estado actual? | `exercise_progress` |
| ¿Evento histórico? | `exercise_completions` |
| ¿Qué pertenece a Bitácora? | proyección `journal_entries` |
| ¿Fuente de una finalización? | `exercise_completions` |
| ¿Fuente de una actividad parcial? | `exercise_progress` |
| ¿Fuente derivada? | `journal_entries` |

Bitácora no necesita almacenar copias de nombre, porcentaje o fecha. Los nombres provienen del catálogo y los hechos de progreso/completion.

## Invariantes

1. Un nivel puede contener uno o varios ejercicios.
2. Un ejercicio pertenece exactamente a un nivel.
3. Cada ejercicio tiene una posición dentro de su nivel.
4. `position` es única por nivel.
5. Un usuario tiene máximo un progreso actual por ejercicio.
6. Un ejercicio admite múltiples finalizaciones históricas.
7. Repetir no crea otro `exercise_progress`.
8. El catálogo es global, no propiedad del usuario.
9. El cliente móvil no modifica el catálogo.
10. Coordenadas del mapa permanecen en configuración local.
11. La finalización es idempotente.
12. RLS impide acceso cruzado entre usuarios.
13. La hora del dispositivo no gobierna reglas críticas.
14. Un porcentaje persistido siempre está entre 0 y 100.
15. Una completion válida implica progreso actual 100 al terminar la transacción.
16. Una entrada de Bitácora completada corresponde a una completion verificable.

## Reglas que no se cierran en esta fase

- Fuente de entitlements para autorizar premium.
- Frecuencia diaria o límites de repetición.
- Catálogo oficial y cantidad de ejercicios.
- Modelo de pasos verificables para porcentajes intermedios futuros.

## Level propuesto

Campos ya existentes:

- `id uuid`
- `number smallint unique`
- `name text`
- timestamps

Campos mínimos propuestos:

- `description text`: requerido por LevelScreen/Camino; inicialmente nullable hasta backfill oficial.
- `publication_status text`: `draft | published | archived`; evita DELETE físico.

Campo aprobado conceptualmente:

- `is_premium boolean`: premium pertenece al Level; los Exercise heredan esta condición. La autorización efectiva seguirá bloqueada hasta definir entitlements.

No se propone un campo `order` adicional: `number` ya cumple el orden global. `smallint` soporta ampliamente 13, 50 o 100 niveles.

## Exercise propuesto

Campos ya existentes:

- `id`, `level_id`, `name`, `content_type`, timestamps.

Campos mínimos propuestos:

- `position smallint`: posición dentro del nivel, positiva.
- `description text`: nullable hasta contenido oficial.
- `estimated_duration_minutes smallint`: nullable y positiva.
- `publication_status text`: `draft | published | archived`.

No se propone `title` además de `name`. Solo se justificarían ambos si `name` fuera identificador interno y `title` texto público localizado.

`content_type` se conserva temporalmente por compatibilidad, pero queda superado conceptualmente por la relación 1:N con `exercise_contents`. No se propone `content_url`: el contrato usa una ruta privada para audio/video y texto en la fila correspondiente.

## Orden y estado editorial

- Constraint futuro: UNIQUE (`level_id`, `position`).
- Inserción: asigna posición explícita mediante herramienta administrativa.
- Reorder: operación administrativa transaccional; no se diseña aún la RPC.
- Despublicar: `publication_status = draft` o `archived`, sin borrar progreso.
- Borrado lógico: `archived` conserva FK e historial.
- DELETE físico: reservado a datos sin referencias y mantenimiento excepcional.

## Progress propuesto

- Conservar PK (`user_id`, `exercise_id`).
- Conservar `progress_percentage`, `last_activity_at`, `created_at`, `updated_at`.
- No agregar `status`: puede derivarse del porcentaje y las reglas de acceso; `locked/available` no es una propiedad del progreso aislado.
- No duplicar `completed_at`: la última completion se obtiene de `exercise_completions`; persistirla aquí exige una necesidad de consulta medida.
- Evaluar renombrar conceptualmente `created_at` a inicio solo cuando se defina si la fila nace con 0 o al primer avance. No hacer rename ahora.
- La escritura directa por cliente debe sustituirse por una operación servidora validada.
- Sin pasos verificables, los únicos estados efectivos aprobados son 0 y 100; `complete_exercise` es la única operación que establece 100.
- El tiempo reproducido de audio/video no finaliza por sí mismo el ejercicio.
- Si después existen pasos obligatorios, PostgreSQL derivará `pasos completados / pasos requeridos`; el cliente no enviará un porcentaje autoritativo.

## Completion propuesto

- Conservar una fila por repetición.
- `idempotency_key` ya funciona como attempt key.
- Definir semántica: una llave identifica una operación de finalización de un ejercicio para un usuario.
- Recomendación futura: validar que una llave ya usada corresponde al mismo `exercise_id`; evaluar UNIQUE (`user_id`, `exercise_id`, `idempotency_key`) o conservar unicidad global y fallar explícitamente ante mismatch.
- Fecha efectiva debe provenir del servidor. Si se necesita fecha offline del dispositivo, guardarla aparte como dato no autoritativo.

## Reflexión post-ejercicio

Estado actual:

- `emotional_score` está en `exercise_completions`.
- No existe texto de reflexión.
- `journal_entries` es una view y no puede ser propietaria de texto editable.

Decisión aprobada:

- La reflexión pertenece a una completion concreta.
- Es editable y usa `completion_reflections` 1:0..1, con `completion_id` como PK/FK.
- Separarla conserva la inmutabilidad de `exercise_completions`.
- No crear una tabla `journal_entries` persistida solo para la reflexión.

## Alternativas para contenido

### A. Columnas en `exercises`

- Simple para un único tipo y payload.
- Queries sencillas.
- Escala mal a varias modalidades y validaciones específicas.
- Genera muchas columnas null y acopla Storage al catálogo.

### B. `exercise_contents`

- Permite N modalidades/variantes, orden, publicación y metadatos.
- Mejor integridad relacional y evolución editorial.
- Requiere joins y un contrato adicional.
- Compatible con referencias a Supabase Storage sin guardar binarios en PostgreSQL.

### C. JSON estructurado

- Flexible para bloques heterogéneos.
- Reduce migraciones de estructura.
- Más difícil de validar, indexar, editar y tipar de extremo a extremo.
- Riesgo de convertir PostgreSQL en almacenamiento de documentos sin invariantes.

Se elige la alternativa B: `exercise_contents`, porque un Exercise puede ofrecer varias modalidades alternativas. Audio/video usan `storage_path` hacia el bucket privado; texto usa `text_content`. La clave editorial propuesta es (`exercise_id`, `modality`, `locale`).

## Desbloqueo y premium

- El primer Level publicado es accesible por defecto, salvo reglas futuras de onboarding.
- Un Level posterior se desbloquea cuando todos los Exercise publicados del Level anterior tienen completion/progreso 100.
- Los Exercise draft/archived no participan en el denominador.
- Premium pertenece al Level y se hereda a sus Exercise.
- `is_premium` es metadata por ahora y no bloquea acceso.
- La validación premium solo se activará cuando exista una fuente real de entitlement.

## Coordenadas locales

Contrato conceptual:

```ts
type LocalJourneyLayout = {
  levelNumber: number;
  x: number;
  y: number;
  nodeOffsetX?: number;
  nodeOffsetY?: number;
};
```

La unión se realiza por `level.number`. El catálogo no recibe `x`, `y`, pixels ni posiciones de cámara.

## Contrato frontend/backend

### RemoteLevel

```ts
type RemoteLevel = {
  id: string;
  number: number;
  name: string;
  description: string | null;
  publicationStatus: "draft" | "published" | "archived";
  exercises: RemoteExerciseSummary[];
};
```

### JourneyLevel

```ts
type JourneyLevel = {
  id: string;
  number: number;
  name: string;
  description: string | null;
  status: "locked" | "available" | "in_progress" | "completed" | "premium";
  isPremium: boolean;
  exerciseCount: number;
  completedExerciseCount: number;
  progressPercentage: number;
  x: number;
  y: number;
};
```

`isPremium` pertenece al Level. Su autorización real permanece pendiente del dominio de entitlements.

### LevelDetail

```ts
type LevelDetail = {
  level: JourneyLevel;
  exercises: ExerciseListItem[];
  completedCount: number;
  totalCount: number;
  percentage: number;
};
```

### ExerciseDetail

```ts
type ExerciseDetail = {
  catalog: ExerciseCatalogData;
  progress: ExerciseProgressData | null;
  content: ExerciseContentData | null;
  latestCompletion: ExerciseCompletionData | null;
};
```

El contrato separa catálogo, estado del usuario, contenido y completion. Multimedia no se define aún.

## Flujo futuro

```text
JourneyScreen
  → useJourney()
  → journey.service
  → levels + exercises + exercise_progress
  → Supabase/RLS
  → merge con LocalJourneyLayout
  → JourneyLevel[]

LevelScreen
  → useLevel(levelId)
  → catálogo + progreso
  → LevelDetail

ExerciseScreen
  → useExercise(exerciseId)
  → catálogo + progreso + contenido + última completion
  → ExerciseDetail
```

## Invalidación futura

Después de completar un ejercicio deben invalidarse:

- `journey(userId)`
- `level(userId, levelId)`
- `exercise(userId, exerciseId)`
- `home(userId)`
- `journal(userId, filtros...)`

`notifications(userId)` solo cuando producto confirme que completion genera una notificación.
