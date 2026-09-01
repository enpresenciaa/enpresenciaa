# Diseño de Camino

**Propósito:** conserva reglas visuales y espaciales difíciles de inferir con seguridad.
**Leer cuando:** se cambia el asset, coordenadas, estados, responsive o composición visual.

## Asset oficial y escalado

- Fuente única: `assets/images/CaminoBG2.png`.
- Dimensiones verificadas: 793 × 1983; ratio vertical `1983 / 793`.
- Journey usa un ancho de 2.2 viewports y deriva el alto con el ratio. Una prueba estática descartó 3.15 por volver a mostrar una sola cueva dominante. El target es 2.5–3 cuevas/entradas con contexto, sujeto a dispositivo.
- `contentFit="contain"` evita deformación y recorte; fondo y overlay comparten ancho y alto.
- `MapBackground` es el único propietario del import. No queda referencia de código al fondo anterior.

## Sistema de coordenadas

`positionX` y `positionY` son proporciones normalizadas: `(0,0)` es la esquina superior izquierda y `(1,1)` la inferior derecha. `LevelOverlay` calcula `x = mapWidth × positionX` y `y = mapHeight × positionY`; `LevelNode` resta la mitad de su tamaño para centrarlo.

| Nivel | X | Y |
|---:|---:|---:|
| 1 | 0.744 | 0.847 |
| 2 | 0.217 | 0.776 |
| 3 | 0.767 | 0.711 |
| 4 | 0.214 | 0.650 |
| 5 | 0.768 | 0.580 |
| 6 | 0.206 | 0.519 |
| 7 | 0.767 | 0.459 |
| 8 | 0.213 | 0.398 |
| 9 | 0.778 | 0.338 |
| 10 | 0.212 | 0.285 |
| 11 | 0.788 | 0.221 |
| 12 | 0.235 | 0.154 |
| 13 | 0.508 | 0.064 |

La numeración asciende desde la base. X/Y identifican el centro de la cueva. Los nodos laterales usan offset visual relativo `±0.032` hacia el camino y `+0.014` en Y; la cima usa `+0.016` en Y. Las posiciones permanecen pendientes de validación final en dispositivos compactos y altos.

## Estados visuales

| Estado | Representación | Interacción actual |
|---|---|---|
| `completed` | verde, número claro y badge check | abre nivel |
| `in_progress` | crema, borde/halo verde y etiqueta “Actual” cuando corresponde | abre nivel |
| `available` | verde activo | abre nivel |
| `locked` | crema translúcido, opacidad y candado | deshabilitado |
| `premium` | dorado, estrella y opacidad | deshabilitado; sin paywall |

`CURRENT_LEVEL_ID = "4"` es provisional. El encabezado “Nivel 4 · Reconexión” debe permanecer sincronizado mientras siga hardcodeado.

## Responsive, safe areas y tab bar

- El mapa escala por ancho de ventana; no usa coordenadas absolutas por dispositivo.
- El viewport determina el offset inicial; el nivel actual queda cerca del 57% de la altura visible.
- El recorte lateral sigue 50% del zigzag X para mantener visibles las puertas más laterales del nuevo fondo.
- El alto scrollable usa todo `mapHeight`; no existe extensión artificial ni gap inferior. El ancla de 57% permite alcanzar Nivel 1 sobre el propio asset.
- El encabezado usa safe area superior/izquierda/derecha y se superpone sin capturar eventos.
- Debe poder recorrerse el mapa sin que tab bar o safe areas oculten una puerta crítica.
- Cambiar ratio, tamaño de nodo, ancho o contenedor exige recalibrar las 13 puertas y el scroll.

## Restricciones visuales

- Fondo, placeholder y detalle conservan el color crema para evitar flash blanco.
- Nodos y contenido esperan a scene-ready; ante error del PNG, la escena se desbloquea sobre fallback.
- El asset no se recorta/deforma y el overlay nunca usa dimensiones distintas.
- SVG, Skia, parallax, zoom, partículas y camino animado son futuros, no diseño implementado.

## Perspectivas y movimiento

- **Journey:** única perspectiva de recorrido; target visual de unas tres cuevas completas.
- **LevelFocus:** zoom moderado `1.18`, centrado en la posición visual del nodo; no pretende sustituir un close-up dedicado.
- **Entrada:** cima → current level mediante easing no lineal; CloudReveal se retira antes del descenso.
- La cima coloca nivel 13 cerca del 22% del viewport y encuadra horizontalmente el espacio entre niveles 13 y 12 para mostrar puerta luminosa y dirección del recorrido.
- **Reduced motion:** posicionamiento directo, reveal inmediato, sin descenso ni zoom fuerte; el pulso actual también se desactiva.

## Referencia visual

El PNG oficial es la referencia disponible. No existe screenshot en dispositivo archivado; no tratar la inspección estática como validación responsive.
