# Fase Camino y Niveles

**Propósito:** punto de entrada y estado específico más reciente de Camino.
**Leer cuando:** se inicia cualquier tarea sobre el mapa, los niveles o sus rutas.

# AI QUICK CONTEXT

- Camino es la tab privada que representa el progreso mediante un mapa vertical desplazable.
- La entrada es `/(tabs)/camino`; cada nivel usa `/camino/nivel/[levelId]`.
- La implementación compone `JourneyScreen` → `CaminoMap` → una escena transformable con fondo + overlay → 13 nodos.
- `LevelScreen` es una sola pantalla parametrizada; no existen 13 pantallas duplicadas.
- El asset oficial es `assets/images/CaminoBG2.png` (793 × 1983), renderizado con `expo-image`; el anterior fue eliminado.
- Journey usa `2.2 × viewportWidth`; siempre conserva `alto = ancho × 1983 / 793`.
- Cada nivel guarda X/Y entre 0 y 1; el overlay multiplica por las dimensiones renderizadas.
- Cada nodo admite un offset relativo centralizado hacia el camino, sin alterar la coordenada de su cueva.
- Nivel 1 comienza abajo y la numeración asciende hasta el nivel 13.
- Estados: `completed`, `in_progress`, `available`, `locked` y `premium`.
- Regla provisional: 1–3 completados, 4 en progreso, 5–11 bloqueados y 12–13 premium.
- Sólo `completed`, `in_progress` y `available` abren la ruta de nivel.
- `locked` y `premium` no navegan; premium es únicamente visual.
- Los datos salen de `src/features/journey/mocks/journey.mock.ts`.
- Niveles, coordenadas, progreso y ejercicios son mocks; no hay backend verificado para Camino.
- Los ejercicios se listan, pero no abren reproductor ni contenido real.
- Perspectivas locales: `journey` (default) y `level-focus`; no se persisten. Panorama fue retirado tras validación visual.
- La entrada revela nubes simples, desciende desde la cima y termina en el nivel actual una vez por mount.
- Durante el scroll, una cámara horizontal sigue el zigzag de las puertas sin separar fondo y overlay.
- La escena es atómica: los nodos esperan a que el fondo esté listo y permanecen ocultos si el asset falla.
- Si falla el asset, la UI se desbloquea sobre el color de respaldo y conserva los nodos.
- Decisiones protegidas: imagen + overlay, coordenadas relativas, escena atómica, orden ascendente y nivel 4 provisional.
- Reanimated existente anima cámara, reveal, focus y pulso actual; no hay SVG, Skia, paywall ni assets nuevos.
- No afirmar alineación, FPS, memoria o latencia como validados sin prueba en dispositivo.
- UI/coordenadas: `DESIGN.md`; componentes/rutas/datos: `ARCHITECTURE.md`.
- Construcción e invariantes: `IMPLEMENTATION.md`; motivos: `DECISIONS.md`.
- Pruebas, evidencia y rendimiento: `QUALITY.md`.

# AI READING GUIDE

| Tarea | Lectura mínima después de este README |
|---|---|
| Cambiar UI | `DESIGN.md` |
| Modificar componentes | `ARCHITECTURE.md` + `IMPLEMENTATION.md` |
| Modificar navegación o datos | `ARCHITECTURE.md` + `DECISIONS.md` |
| Corregir un bug | `ARCHITECTURE.md` + `QUALITY.md`; consultar `IMPLEMENTATION.md` según el propietario |
| Cambiar coordenadas | `DESIGN.md` + `DECISIONS.md` |
| Optimizar rendimiento | `IMPLEMENTATION.md` + `QUALITY.md` |
| Diseñar backend futuro | `ARCHITECTURE.md` + `DECISIONS.md` + `../state/PROJECT_STATE.md` |

# SOURCE OF TRUTH

| Información | Fuente que prevalece |
|---|---|
| Reglas del repositorio | `CODEX_PROJECT_RULES.md` |
| Estado y arquitectura globales | `phases/state/PROJECT_STATE.md` y `phases/state/ARCHITECTURE_OVERVIEW.md` |
| Estado específico actual de Camino | Este README |
| Componentes, rutas y flujo de datos | `ARCHITECTURE.md` |
| Asset, coordenadas y reglas visuales | `DESIGN.md` |
| Construcción real e invariantes | `IMPLEMENTATION.md` |
| Motivos y alternativas | `DECISIONS.md` |
| Pruebas, evidencia y objetivos | `QUALITY.md` |
| Comportamiento implementado | Código actual |

El código prevalece al investigar comportamiento real. Si difiere de esta memoria, registrar la discrepancia y no convertir una inferencia en hecho. Este estado de Camino es posterior al snapshot global del 2026-08-22, que todavía describe la tab como placeholder; no se actualizó ese snapshot global en esta tarea.

# CURRENT STATE

**IMPLEMENTED:** `CaminoBG2.png`, mapa local scrollable a `2.2 × viewportWidth`, LevelFocus, cámara horizontal al 50%, entrada cima→actual, CloudReveal, reduced motion, 13 nodos recalibrados, ruta protegida y detalle mock parametrizado.

**VALIDATED:** type-check, lint dirigido y `git diff --check` fueron reportados PASS el 2026-08-25; ratio, guard de navegación y estrategia anti-flash cuentan con revisión estática.

**PARTIAL:** una previsualización estática del 2026-08-26 corrigió una propuesta sobre-ampliada y confirmó el framing aproximado; alineación, interacción y responsive requieren dispositivo.

**PENDING:** pruebas visuales, accesibles y de estrés en dispositivo, métricas con perfilador, reglas definitivas, contenido y fuentes remotas.

# KNOWN LIMITATIONS

- No existe backend verificado para niveles, ejercicios, progreso o historial de Camino.
- Todo el contenido y progreso son mocks; `CURRENT_LEVEL_ID = "4"` es provisional.
- Premium no tiene paywall, suscripción ni navegación.
- Los ejercicios no reciben callback y actualmente no son interactivos.
- Rendimiento, memoria, FPS, latencia de tap y fluidez de transiciones no se han medido en dispositivo.
- Falta validar alineación en pantallas compactas y altas, safe areas y tab bar.
- SVG, Skia, animación avanzada, zoom, parallax y mapas remotos no están implementados.

# CHANGE IMPACT MAP

| Cambio | Dependencias que revisar | Pruebas mínimas |
|---|---|---|
| `JourneyScreen` | mock, `currentLevel`, `CaminoMap`, router | composición, nivel actual, rutas permitidas |
| `CaminoMap` | dimensiones, viewport, scroll, carga, fallback | inicio, extremos, reentrada, fallo del asset |
| `CloudReveal` | readiness, reduced motion, opacity y desmontaje | no flash, reveal, error y movimiento reducido |
| Cámara/perspectiva | Reanimated, scrollY, crop útil y nivel seleccionado | Journey, ~3 cuevas, cima, nivel 1 y focus |
| `MapBackground` | PNG, ratio, `onDisplay`/`onError`, scene-ready | carga, error y ausencia de flash blanco |
| `LevelOverlay` | dimensiones compartidas y posiciones relativas | las 13 puertas en compacto y alto |
| `LevelNode` | estados, tamaño, callback y accesibilidad | cinco estados, tap/disabled, lector y hit target |
| `journey.mock` | nivel actual, estados, coordenadas y ejercicios | orden, navegación, progreso y 13 posiciones |
| `map-layout.constants` | ratio, tamaño de nodo y ancla de scroll | alineación, recorte y posición inicial |
| `LevelScreen` | `levelId`, mock, header, progreso, lista y Back | ID válido/inválido, datos, scroll y regreso |
| Asset oficial | import, ratio, memoria y overlay | dimensiones, recorte, carga y alineación completa |

# BACKLOG

- **Producto:** definir desbloqueo, contenido, premium y suscripciones.
- **Arquitectura/backend:** acordar modelos y contratos antes de reemplazar mocks; no inventar tablas o endpoints.
- **Diseño:** calibrar las 13 puertas y definir futuras perspectivas sin romper el modelo mental actual.
- **QA:** ejecutar matriz funcional, visual, accesible y de estrés en dispositivo.
- **Rendimiento:** medir builds con dispositivo y perfilador; registrar fecha y hardware.

# AI MODIFICATION CHECKLIST

Antes: [ ] leer AI QUICK CONTEXT; [ ] identificar propietario; [ ] revisar CHANGE IMPACT MAP; [ ] revisar decisiones; [ ] confirmar mock/remoto; [ ] elegir pruebas proporcionales.

Después: [ ] type-check; [ ] lint proporcional; [ ] `git diff --check`; [ ] pruebas de impacto; [ ] actualizar documentación afectada; [ ] registrar decisión si aplica; [ ] no afirmar validaciones no ejecutadas.

# AI BUG INVESTIGATION

1. Reproducir o definir el síntoma e identificar el propietario.
2. Revisar DATA FLOW y CHANGE IMPACT MAP; clasificar UI, layout, navegación o mock.
3. Consultar `DECISIONS.md`, realizar el cambio mínimo y pruebas proporcionales.
4. Documentar causa, solución y evidencia.

# AI FEATURE IMPLEMENTATION

1. Delimitar alcance; revisar invariantes y decisiones.
2. Identificar componentes reutilizables y datos; no inventar backend.
3. Diseñar props antes de estado global, implementar y validar.
4. Actualizar sólo la documentación cuya fuente de verdad cambió.

## Historial documental

El estado inicial era un placeholder. La primera evolución inmersiva introdujo sobre-zoom, seguimiento X agresivo y un Panorama de baja calidad. El ajuste fino del 2026-08-25 retiró Panorama. El 2026-08-26 `CaminoBG2.png` reemplazó completamente el fondo y volvió obsoletas todas las coordenadas anteriores.
