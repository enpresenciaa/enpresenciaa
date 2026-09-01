# Decisiones de Camino

**Propósito:** ADR ligero con decisiones, motivos, alternativas y condiciones de revisión.
**Leer cuando:** una tarea podría cambiar arquitectura, layout, progresión o alcance.

## DEC-001 — Imagen larga + overlay

- **Estado:** Accepted
- **Fecha:** 2026-08-25
- **Contexto:** el MVP necesita fidelidad al arte y 13 zonas interactivas estáticas.
- **Decisión:** renderizar un PNG vertical local y superponer nodos React Native.
- **Motivo:** equilibrio entre fidelidad, complejidad y costo de render.
- **Alternativas:** SVG completo, composición por capas, canvas/Skia o mapa remoto.
- **Consecuencias:** asset y overlay deben compartir dimensiones; cambiar el arte puede exigir recalibración.
- **Revisar si:** se requieren rutas animadas, zoom, múltiples mapas o contenido dinámico.

## DEC-002 — No usar SVG ni Skia en la versión actual

- **Estado:** Accepted
- **Fecha:** 2026-08-25
- **Contexto:** no se necesitan geometrías dinámicas para 13 puertas fijas.
- **Decisión:** mantener `expo-image` y componentes nativos sin nuevas dependencias.
- **Motivo:** reducir superficie técnica y trabajo no justificado.
- **Alternativas:** SVG para trazados/zonas o Skia para efectos avanzados.
- **Consecuencias:** el camino no es vectorial ni animable por segmentos.
- **Revisar si:** una funcionalidad aprobada requiere interacción o animación que el overlay no resuelva.

## DEC-003 — Coordenadas relativas

- **Estado:** Accepted
- **Fecha:** 2026-08-25
- **Contexto:** el ancho del dispositivo cambia, pero el mapa conserva su ratio.
- **Decisión:** almacenar X/Y normalizadas y convertirlas usando ancho/alto renderizados.
- **Motivo:** preservar alineación al escalar.
- **Alternativas:** píxeles absolutos, offsets por breakpoint o detección automática.
- **Consecuencias:** fondo y overlay deben compartir geometría; las coordenadas viven con los datos mock actuales.
- **Revisar si:** el asset cambia de encuadre/ratio o aparecen variantes responsive reales.

## DEC-004 — Escena atómica

- **Estado:** Accepted
- **Fecha:** 2026-08-25
- **Contexto:** mostrar nodos antes del fondo produce una composición incompleta y flash visual.
- **Decisión:** cubrir la vista hasta `onDisplay`, calcular scroll y publicar nodos después; desbloquear también ante error.
- **Motivo:** estabilidad visual sin pantalla congelada si falla el recurso.
- **Alternativas:** render progresivo o placeholder parcial.
- **Consecuencias:** readiness y scroll están acoplados dentro de `CaminoMap`.
- **Revisar si:** se introduce precarga fiable, transición diseñada o fondo remoto.

## DEC-005 — Orden ascendente desde la base

- **Estado:** Accepted
- **Fecha:** 2026-08-25
- **Contexto:** la narrativa visual avanza desde la puerta inferior a la luminosa superior.
- **Decisión:** nivel 1 abajo y nivel 13 arriba.
- **Motivo:** mantener el significado de progresión del arte.
- **Alternativas:** recorrido descendente o libre.
- **Consecuencias:** orden, coordenadas, scroll inicial y expectativas de producto comparten esta semántica.
- **Revisar si:** producto redefine la narrativa completa del mapa.

## DEC-006 — Nivel 4 y estados provisionales

- **Estado:** Accepted (provisional)
- **Fecha:** 2026-08-25
- **Contexto:** no existe una fuente remota verificada; se alineó Camino con el ejercicio actual usado entonces en Home.
- **Decisión:** niveles 1–3 completados, 4 en progreso, 5–11 bloqueados y 12–13 premium visual; `CURRENT_LEVEL_ID = "4"`.
- **Motivo:** ofrecer una demostración coherente mientras se definen reglas reales.
- **Alternativas:** todos disponibles, estado vacío o progreso generado.
- **Consecuencias:** no representa progreso persistido; encabezado, mock y navegación pueden desincronizarse si se editan por separado.
- **Revisar si:** existe modelo de progreso/backend o cambian reglas de producto.

## Registro de reorganización documental

Estas decisiones conservan el significado del documento original. SVG, rutas vectoriales, progreso animado, parallax, Skia, partículas, assets close-up y mapas remotos/múltiples siguen **propuestos/no implementados**. La cámara transformada y sus transiciones quedan definidas en DEC-007–012.

## DEC-007 — Journey cercana como perspectiva default

- **Estado:** Superseded por DEC-013
- **Fecha:** 2026-08-25
- **Contexto:** el ancho de pantalla mostraba demasiada montaña y reducía la importancia de las puertas.
- **Decisión:** derivar el tamaño de escena del viewport y un target de 3.5 niveles visibles; seguir el sendero horizontalmente.
- **Motivo:** aumentar escala sin deformar el asset ni recalibrar coordenadas.
- **Consecuencias:** el mapa excede el ancho del dispositivo y requiere cámara X durante scroll.
- **Revisar si:** la matriz visual no mantiene 3–4 niveles o el PNG pierde calidad.

## DEC-008 — Overview como perspectiva secundaria

- **Estado:** Deprecated por DEC-013
- **Fecha:** 2026-08-25
- **Decisión:** un control en el header transforma la misma escena a panorama y muestra “Estás aquí”.
- **Motivo:** conservar orientación global sin sacrificar Journey cercana.
- **Consecuencias:** Overview bloquea scroll y taps hasta volver a Journey.
- **Revisar si:** accesibilidad o legibilidad requieren un control/representación diferente.

La evidencia visual mostró el fondo demasiado reducido y nodos poco legibles; el valor panorámico no justificó mantener estado, control y transformación adicionales.

## DEC-009 — LevelFocus reutiliza el asset actual

- **Estado:** Accepted
- **Fecha:** 2026-08-25
- **Decisión:** aplicar zoom moderado `1.28` a la misma escena antes de navegar.
- **Motivo:** evitar asset/dependencia nueva y mantener alineación.
- **Consecuencias:** no es un close-up real; si hay pixelación se necesitará un asset dedicado futuro.
- **Revisar si:** pruebas en dispositivo muestran baja calidad o encuadre insuficiente.

## DEC-010 — Entrada una vez por mount

- **Estado:** Accepted
- **Fecha:** 2026-08-25
- **Decisión:** cima → current level una vez por montaje, sin persistencia.
- **Motivo:** respetar navegación y evitar MMKV/Storage para estado efímero.
- **Consecuencias:** si Expo Router remonta la tab, la entrada vuelve a ejecutarse; falta verificarlo en runtime.
- **Revisar si:** pruebas confirman remontajes frecuentes perjudiciales.

## DEC-011 — CloudReveal preserva escena atómica

- **Estado:** Accepted
- **Fecha:** 2026-08-25
- **Decisión:** usar tres formas simples animadas mientras el mapa se prepara; desmontarlas antes de habilitar interacción.
- **Motivo:** no existen nubes reutilizables y están prohibidos descargas/generación/assets nuevos.
- **Consecuencias:** es una transición provisional preparada para assets futuros.
- **Revisar si:** diseño entrega `cloud-left`, `cloud-right` y `cloud-top`.

## DEC-012 — Sin blur real ni escenas duplicadas

- **Estado:** Accepted
- **Fecha:** 2026-08-25
- **Decisión:** simular cámara con scroll, scale, translate y opacity sobre una escena.
- **Motivo:** proteger rendimiento y memoria.
- **Consecuencias:** no hay motion blur ni crossfade de mapas.
- **Revisar si:** mediciones reales justifican un efecto adicional.

## DEC-013 — Framing moderado y Panorama eliminado

- **Estado:** Accepted
- **Fecha:** 2026-08-25
- **Contexto:** capturas reales mostraron una sola cueva principal, zigzag agresivo, nivel 1 difícil de alcanzar, cima descentrada y Overview de baja calidad.
- **Decisión:** fijar Journey en 2.45 anchos de viewport, amortiguar seguimiento X al 34%, reservar 1.25 separaciones bajo nivel 1, centrar nivel 13 al inicio y retirar Panorama.
- **Motivo:** obtener aproximadamente tres cuevas completas y un recorrido natural preservando ratio y una sola escena.
- **Alternativas:** conservar escala 3.5 niveles/viewport, centrar cada puerta, mantener Overview o crear otro asset.
- **Consecuencias:** Journey es la única vista global del recorrido; LevelFocus sigue disponible. Las coordenadas se recalibraron contra el PNG.
- **Revisar si:** nuevas capturas muestran menos de dos o más de cuatro cuevas completas, nivel 1 inaccesible o pérdida de calidad.

## DEC-014 — Nuevo background oficial CaminoBG2

- **Estado:** Accepted
- **Fecha:** 2026-08-26
- **Contexto:** el fondo anterior producía un zigzag cerrado y dificultaba componer varios niveles. `CaminoBG2.png` presenta recorrido horizontal amplio, puertas alternadas y cima clara.
- **Decisión:** sustituir completamente el asset anterior por `CaminoBG2.png` 793 × 1983 y considerar obsoletas todas las coordenadas previas.
- **Motivo:** mejorar claridad, dirección del ascenso y espacio visual para nodos.
- **Consecuencias:** se recalibran 13 cuevas, cámara, entrada, LevelFocus, límite inferior y documentación. Panorama continúa eliminado porque el nuevo fondo ya aporta orientación suficiente.
- **Alternativas:** conservar el fondo previo, SVG, dos escenas o Panorama.
- **Revisar si:** el asset oficial vuelve a cambiar o la matriz de dispositivos muestra recorte/alineación inaceptable.

## DEC-015 — Nodo desacoplado del centro de cueva

- **Estado:** Accepted
- **Fecha:** 2026-08-26
- **Contexto:** centrar el círculo exactamente en el hueco tapaba el arte y hacía que indicadores y etiqueta compitieran con la entrada.
- **Decisión:** conservar X/Y como centro de cueva y aplicar offsets relativos centralizados al nodo; rediseñar `LevelNode` con un solo indicador, badge inferior centrado y “Actual” centrado arriba.
- **Motivo:** integrar el control con el acceso sin ocultarlo y mantener hit target de 48 dp.
- **Consecuencias:** cámara y LevelFocus usan la posición visual final; el fondo y overlay siguen siendo una sola escena.
- **Revisar si:** validación táctil o visual requiere offsets distintos por puerta.
