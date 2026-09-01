# Arquitectura de Camino

**Propósito:** explica propietarios, contratos, navegación y flujo de datos.
**Leer cuando:** se modifican componentes, rutas, datos o dependencias entre piezas.

## Diagrama

```text
/(tabs)/camino (JourneyRoute)
  ↓
JourneyScreen
  ↓
CaminoMap
  ├─ MapBackground
  ├─ LevelOverlay
  │   └─ LevelNode × 13
  ├─ MapLoadingState
  └─ CloudReveal

/camino/nivel/[levelId] (LevelRoute)
  ↓
LevelScreen
  ├─ BackButton
  ├─ LevelHeader
  ├─ LevelProgress
  └─ ExerciseList
      └─ ExerciseItem × N
```

## Navegación

`/(tabs)/camino` → `/camino/nivel/[levelId]` → `BackButton`. La ruta de nivel está registrada en el `Stack.Protected` autenticado junto a Tabs. `JourneyScreen` comprueba `canOpenLevel` antes de `router.push`: `completed`, `in_progress` y `available` navegan; `locked` y `premium` no. Un ID inexistente muestra el estado “Nivel no encontrado”. No existe paywall ni ruta de ejercicio conectada desde esta pantalla.

# DATA FLOW

```text
journey.mock (MapLevel[] + CURRENT_LEVEL_ID)
  ↓
JourneyScreen
  ↓
CaminoMap
  ↓
LevelOverlay
  ↓
LevelNode
```

```text
route levelId
  ↓ normalización string|string[]
LevelScreen
  ↓ getLevelById / getExercisesByLevelId
journey.mock
  ↓
LevelHeader + LevelProgress + ExerciseList
```

- **UI state:** `JourneyScreen` conserva `JourneyPerspective` y nivel seleccionado; `CaminoMap` conserva readiness, fallo, reveal y viewport. Shared values de Reanimated mantienen scroll/cámara sin render por frame.
- **Mock data:** nivel actual, catálogo de 13 niveles, coordenadas, estados y ejercicios se definen localmente en `journey.mock.ts`.
- **Remote data futuro:** no existe backend verificado para niveles, ejercicios, progreso o historial de Camino. Acordar contratos antes de sustituir el mock; no duplicar caché remota en Zustand.

## Contratos de dominio

- `MapLevel`: id, número, nombre, descripción opcional, conteo de ejercicios, X/Y de la cueva, offsets visuales relativos opcionales y `LevelStatus`.
- `LevelStatus`: `locked | available | in_progress | completed | premium`.
- `LevelExercise`: id, levelId, título y estado `locked | available | completed`.

## Componentes del mapa

### `JourneyScreen`

- **Responsabilidad:** seleccionar mocks, mostrar encabezado y convertir taps permitidos en navegación.
- **Props/estado local:** ninguno; sólo obtiene router.
- **Dependencias/consumo:** ruta tab → mock, `CaminoMap`, Expo Router y tema.
- **No debe:** calcular posiciones, renderizar el asset ni inventar reglas remotas.
- **Riesgo:** desincronizar subtítulo, `CURRENT_LEVEL_ID`, guard y ruta.

### `CaminoMap`

- **Responsabilidad:** calcular dimensiones, coordinar carga/fallo, scroll inicial y publicación atómica de la escena.
- **Props:** `currentLevelId?`, `levels`, `perspective`, `selectedLevelId?`, callbacks de tap y focus completo.
- **Estado local:** readiness, error, reveal y viewport; refs/shared values para scroll, intro y transformaciones.
- **Dependencias/consumo:** `JourneyScreen` → Reanimated, constantes, `MapBackground`, `LevelOverlay`, `MapLoadingState`, `CloudReveal`.
- **No debe:** decidir desbloqueo, poseer contenido de niveles o consultar backend.
- **Riesgo:** flash, pantalla bloqueada, scroll incorrecto, overlay desalineado y regresión de resize.

### `MapBackground`

- **Responsabilidad:** ser la única importación/renderización de `CaminoBG2.png` y comunicar presentación/error.
- **Props:** `height`, `width`, `onReady`, `onError`; sin estado local.
- **Dependencias/consumo:** `CaminoMap` → `expo-image` y asset local.
- **No debe:** calcular ratio, nodos o scroll.
- **Riesgo:** romper scene-ready, fallback, accesibilidad o relación visual con el overlay.

### `LevelOverlay`

- **Responsabilidad:** combinar coordenada de cueva + offset visual, convertirla a píxeles y crear los nodos.
- **Props:** `currentLevelId?`, `levels`, `mapHeight`, `mapWidth`, `onPressLevel`; sin estado local.
- **Dependencias/consumo:** `CaminoMap` → `LevelNode`.
- **No debe:** guardar coordenadas, decidir estados o navegar directamente.
- **Riesgo:** mover las 13 puertas o romper propagación de callbacks.

### `LevelNode`

- **Responsabilidad:** interacción, apariencia y semántica accesible de un nivel.
- **Props:** `level`, `isCurrent`, X/Y renderizadas, `onPress`; sin estado local.
- **Dependencias/consumo:** `LevelOverlay` → `Ionicons`, tema y `LEVEL_NODE_SIZE`.
- **No debe:** calcular coordenadas relativas, consultar backend ni llamar al router.
- **Riesgo:** estados visuales, hit target, disabled, accesibilidad y centrado del nodo.

### `MapLoadingState`

- **Responsabilidad:** cubrir la escena con fondo crema e indicador hasta scene-ready.
- **Props/estado:** ninguno.
- **Dependencias/consumo:** `CaminoMap` → tema y `ActivityIndicator`.
- **No debe:** decidir cuándo terminó la carga.
- **Riesgo:** flash blanco, bloqueo visual o etiqueta accesible incorrecta.

### `CloudReveal`

- **Responsabilidad:** cubrir la escena preparada con tres formas simples y retirarlas mediante opacity/translate/scale.
- **Props:** `reveal`, `reduceMotion`, `onRevealComplete`; shared value interno.
- **Dependencias/consumo:** `CaminoMap` → Reanimated y tema.
- **No debe:** cargar el asset, decidir navegación ni permanecer montado después del reveal.
- **Riesgo:** flash, overlay que captura taps, animación fuerte con reduced motion o intro que no inicia.

## Cámara y perspectivas

- `journey`: escena de 2.2 anchos de viewport, scroll vertical y translateX al 50% para seguir el zigzag ancho sin centrar agresivamente cada puerta.
- `level-focus`: misma escena escalada hacia la coordenada seleccionada; al terminar invoca navegación en `JourneyScreen`.
- No se renderizan escenas duplicadas ni se guarda `scrollY` en React state.
- Panorama se eliminó: ya no existe control, estado ni transformación overview.

## Componentes de nivel

### `LevelScreen`

- **Responsabilidad:** resolver `levelId`, seleccionar nivel/ejercicios y componer detalle o not-found.
- **Props:** `levelId`; sin estado local.
- **Dependencias/consumo:** ruta parametrizada → mock, `BackButton`, `LevelHeader`, `LevelProgress`, `ExerciseList`.
- **No debe:** duplicarse por nivel, inventar catálogo remoto ni calcular layout del mapa.
- **Riesgo:** ID inválido, progreso derivado, safe areas, scroll y regreso.

### `LevelHeader`

- **Responsabilidad:** presentar estado, título y descripción.
- **Props:** `status`, `title`, `description?`; sin estado local.
- **No debe:** resolver nivel ni mutar progreso.
- **Riesgo:** etiquetas de estado y jerarquía accesible.

### `LevelProgress`

- **Responsabilidad:** derivar y mostrar porcentaje acotado a 100%.
- **Props:** `completed`, `total`; sin estado local.
- **No debe:** seleccionar ejercicios o persistir progreso.
- **Riesgo:** división por cero, ancho y texto accesible.

### `ExerciseList` / `ExerciseItem`

- **Responsabilidad:** listar ejercicios y representar estado visual/interactivo.
- **Props:** lista `exercises`; cada item recibe `exercise` y `onPress?`.
- **Dependencias/consumo:** `LevelScreen` → `ExerciseList` → `ExerciseItem`.
- **No deben:** buscar contenido ni navegar. Actualmente no se pasa `onPress`, por lo que todos los items están deshabilitados.
- **Riesgo:** keys, estados, accesibilidad y falsa apariencia de interactividad.

## Límites de propiedad

- Coordenadas y reglas visuales estables: `DESIGN.md` y mock.
- Cálculos/readiness/scroll: `CaminoMap` y `map-layout.constants.ts`.
- Permiso de navegación provisional: `canOpenLevel` en el mock, aplicado por `JourneyScreen`.
- Selección de detalle: `LevelScreen`; presentación: componentes hijos por props.
- Cualquier incorporación de backend requiere una arquitectura acordada; la presente capa no prueba que existan tablas o APIs.
