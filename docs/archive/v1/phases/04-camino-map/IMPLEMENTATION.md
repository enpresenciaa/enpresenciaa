# Implementación de Camino

**Propósito:** describe cómo está construido realmente y sus invariantes técnicos.
**Leer cuando:** se modifica lógica, carga, scroll, cálculos o archivos concretos.

## Archivos reales

```text
assets/images/CaminoBG2.png
src/app/(tabs)/camino.tsx
src/app/camino/nivel/[levelId].tsx
src/features/journey/
  components/{CaminoMap,MapBackground,MapLoadingState,LevelOverlay,LevelNode}.tsx
  components/CloudReveal.tsx
  components/{LevelHeader,LevelProgress,ExerciseList,ExerciseItem}.tsx
  constants/map-layout.constants.ts
  mocks/journey.mock.ts
  screens/{JourneyScreen,LevelScreen}.tsx
  types.ts
```

La ruta parametrizada está registrada en `src/app/_layout.tsx` dentro del guard autenticado. Las responsabilidades y props están en `ARCHITECTURE.md`; las coordenadas oficiales, en `DESIGN.md`.

## Dependencias utilizadas

- `expo-image`: PNG local, `contentFit`, `onDisplay` y `onError`.
- `expo-router`: parámetros, `router.push` y Back mediante el componente compartido.
- `react-native-safe-area-context`: safe areas del encabezado y detalle.
- React/React Native: estado, memo, efecto, ref, `requestAnimationFrame`, `ScrollView`, dimensiones, layout, interacción y placeholder.
- `@expo/vector-icons`: iconos de estados.
- `react-native-reanimated` (ya instalado): scroll en UI thread, transformaciones, reveal y pulso.

No se añadió dependencia. Reanimated, SVG y Skia no forman parte de esta implementación.

## Dimensiones y overlay

`mapWidth = viewportWidth × 2.2` y `mapHeight = mapWidth × MAP_ASPECT_RATIO`. La escala se eligió después de descartar 3.15 en una previsualización estática por producir una sola cueva dominante. Las 13 coordenadas anteriores se reemplazaron por centros medidos contra `CaminoBG2.png`.

`MapLevel` conserva la coordenada de cueva y admite `nodeOffsetX/Y`. `LevelOverlay` suma esos offsets antes de multiplicar por las dimensiones compartidas. Los laterales se desplazan hacia el camino y ligeramente hacia abajo; la cima sólo hacia abajo.

El alto scrollable es exactamente `mapHeight`. Esto conserva todo el fondo nuevo, evita huecos y permite que la cámara llegue a Nivel 1 con el ancla vertical de 57%.

## Carga y fallback

1. `MapLoadingState` cubre toda la vista sobre crema.
2. `MapBackground` emite `onReady` desde `onDisplay`.
3. Al conocer imagen y viewport se monta el overlay detrás de `CloudReveal`.
4. Las nubes simples se separan y desmontan; después comienza el descenso cinematográfico.
5. `onError` mantiene un fallback coherente y no publica nodos sin mapa.

Estados locales relevantes: `imageReady`, `mapFailed`, `revealComplete` y `viewportHeight`. Un ref limita la preparación/entrada a una vez por mount.

## Scroll inicial

Se encuentra el nivel actual con `useMemo`. Sin reduced motion, `withTiming` anima un shared offset desde la cima al current level y `scrollTo` actualiza el `Animated.ScrollView` en UI thread. El easing Bézier acelera pronto y desacelera progresivamente. Con reduced motion se posiciona directamente.

## Cámara y perspectivas

- `useAnimatedScrollHandler` actualiza `scrollY` sin React state.
- Journey interpola un translateX amortiguado: sigue 50% de la desviación de cada nodo para cubrir el zigzag más ancho.
- En el extremo superior, la cámara encuadra el promedio X de niveles 13 y 12 y coloca la cima al 22% del viewport; mezcla hacia el seguimiento normal durante el primer 35%.
- LevelFocus anima a escala `1.18` hacia la posición visual seleccionada durante 420 ms; su callback navega al terminar.
- No se duplica la escena y las 13 coordenadas se preparan fuera del worklet, no mediante setState por frame.

## Navegación y callbacks

`LevelNode` llama un callback del overlay; éste preserva el nivel y llega a `JourneyScreen`. `JourneyScreen` ejecuta `canOpenLevel` y sólo entonces hace push con `levelId`. El nodo no conoce Expo Router. La route normaliza `string | string[]` antes de entregar el ID a `LevelScreen`.

## Detalle y progreso

`LevelScreen` busca nivel y ejercicios en el mock. Un ID ausente muestra not-found. El progreso cuenta ejercicios `completed`; `LevelProgress` calcula `(completed / total) × 100`, protege total cero y limita a 100. `ExerciseItem` admite `onPress?`, pero `ExerciseList` no lo proporciona: todos los ejercicios están deshabilitados actualmente.

## Comportamiento por estado

- Nivel `completed`, `in_progress` o `available`: botón habilitado y ruta permitida.
- Nivel `locked` o `premium`: botón deshabilitado y guard redundante en pantalla.
- Ejercicio `completed`, `available` o `locked`: sólo representación; sin callback quedan deshabilitados.
- Nivel desconocido: estado local de error con Back.

# IMPLEMENTATION INVARIANTS

- Fondo y `LevelOverlay` deben compartir exactamente ancho, alto y ratio.
- Las coordenadas persistidas en el modelo son relativas, no píxeles renderizados.
- `MapBackground` mantiene la única importación del asset oficial.
- Nodos no aparecen antes de scene-ready; el error del asset no puede congelar la vista.
- Fondo, overlay y nodos siempre reciben una única transformación de cámara.
- Journey deriva escala del ancho del viewport; LevelFocus reutiliza la misma escena.
- Scroll/cámara continua permanece en shared values, nunca en React state.
- Reduced motion omite descenso, zoom fuerte, nubes rápidas y pulso permanente.
- El scroll inicial debe esperar a imagen y viewport y permanecer dentro de límites.
- `LevelNode` no navega directamente ni decide reglas remotas; usa callback.
- `locked` y `premium` no navegan bajo la regla provisional.
- `LevelScreen` permanece parametrizada; no crear una pantalla por cada nivel.
- Mocks no deben presentarse como backend ni progreso persistido.
- Métricas objetivo no deben documentarse como mediciones.

## TODO y limitaciones técnicas

- Sustituir mocks sólo cuando existan contratos de producto/backend verificados.
- Conectar ejercicios a contenido/ruta cuando se defina el alcance.
- Validar resize/orientación, safe areas, tab bar y alineación en dispositivos.
- Medir rendimiento/memoria y ajustar el asset sólo con evidencia.
- Validar que el zoom moderado `1.18` de LevelFocus no pixela; si no alcanza, requerirá un asset close-up futuro.
- El encabezado hardcodeado y `CURRENT_LEVEL_ID` requieren sincronización manual.

## Problemas históricos conservados

- `CaminoBG2.png` ya estaba en el workspace; se verificó 793 × 1983 y reemplazó la referencia anterior.
- Web no pudo probarse porque `react-native-web` no está instalado; no se añadió por la restricción de fase.
- No había emulador Android conectado; por ello no se reportaron métricas ni validación visual.
