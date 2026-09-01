# Calidad de Camino

**Propósito:** concentra estrategia de prueba, evidencia real, objetivos y limitaciones conocidas.
**Leer cuando:** se valida un cambio, investiga una regresión u optimiza rendimiento.

Fecha base de evidencia: 2026-08-26.

## Static validation

| Validación | Estado | Evidencia conservada |
|---|---|---|
| Asset y ratio | PASS estático | `CaminoBG2.png` 793 × 1983; alto derivado con `1983/793` y `contain` |
| Navegación por estados | PASS estático | guard `canOpenLevel`; ruta tipada compila |
| Estrategia sin flash blanco | PASS estático | placeholder crema y nodos condicionados a scene-ready |
| `bun run type-check` | PASS reportado | ejecutado sobre la implementación del 2026-08-25 |
| ESLint dirigido | PASS reportado | Journey, rutas modificadas y layout raíz |
| `git diff --check` | PASS con avisos | sin whitespace inválido; avisos LF→CRLF |
| Perspectivas/cámara | PASS estático | una escena; escala 2.2; shared values; sin estado React por frame |
| Reduced motion | PASS estático | `useReducedMotion`; fallback directo y pulso desactivado |

Un PASS estático prueba estructura o compilación, no interacción ni apariencia en dispositivo.

## Functional tests

- Camino abre, inicia cerca del nivel 4 y permite recorrer ambos extremos.
- CloudReveal se retira, la entrada parte de la cima y termina en current level.
- Tap permitido ejecuta LevelFocus y luego conserva la ruta existente.
- Niveles 1–4 abren el detalle; 5–13 no navegan bajo el mock actual.
- Un `levelId` válido muestra datos/progreso; uno inválido muestra not-found.
- Back regresa a Camino sin dejar la pantalla en un estado incoherente.
- Primera/segunda entrada, regreso y restauración conservan carga y scroll esperados.
- Fallo del asset desbloquea la escena y mantiene accesibles los niveles.

## Visual tests

- Las 13 puertas coinciden en pantalla compacta y alta.
- El mapa conserva proporción, no se recorta/deforma y comparte geometría con el overlay.
- No aparecen nodos sobre blanco ni se observa flash blanco.
- Encabezado, safe areas y tab bar no tapan una puerta crítica.
- Los cinco estados y el marcador actual se distinguen sin ambigüedad.
- Journey muestra aproximadamente tres cuevas completas y el nivel 1 puede alcanzarse claramente.
- LevelFocus centra la puerta correcta sin pixelación evidente y no existe gap inferior accidental.

## Accessibility tests

- Cada nodo anuncia nivel, nombre y estado; disabled coincide con interacción real.
- Hit target y foco funcionan con lector de pantalla y tamaños de texto relevantes.
- Loading, not-found, títulos y progreso tienen semántica comprensible.
- Los ejercicios sin acción no deben anunciarse engañosamente como botones activos.

## Stress tests

- Diez recorridos rápidos arriba/abajo con taps y regresos.
- Repetir montaje, Back y reentrada; comprobar que no queda placeholder permanente.
- Probar rotación/resize si la plataforma lo permite y observar realineación/scroll.

## Performance targets

Estos son **TARGET**, no resultados medidos:

- 60 FPS sin stutter visible.
- Feedback de tap menor a 100 ms.
- Escena completa idealmente visible en 300–500 ms con asset local.

El diseño preventivo usa un asset local, una escena, 13 nodos, `ScrollView`, cálculos lineales pequeños y ninguna animación simultánea, imagen remota, SVG o Skia. Esto no demuestra rendimiento.

## Measured performance

No existen mediciones válidas de FPS, memoria, tiempo de escena o tap. Medir con dispositivo identificado, fecha, build development/release y perfilador apropiado; no promover targets a “PASS”.

## Comparativa antes / después

| Métrica | Antes | Después |
|---|---|---|
| Niveles/cuevas visibles | Fondo anterior: una cueva principal en evidencia | `CaminoBG2`: preview estático cercano a 3 entradas; dispositivo pendiente |
| Escala | fondo anterior: 2.45 anchos | 2.2 anchos; ratio conservado |
| Gap/nivel 1 | recorte histórico impedía encuadre final completo | `contentHeight = mapHeight`, ancla 57%; dispositivo pendiente |
| Tiempo de entrada | no medido | target configurado 1150 ms; tiempo real no medido |
| Panorama | evidencia mostró bajo valor/legibilidad | eliminado junto con control y estado overview |
| LevelFocus | escala anterior 1.28 | escala 1.18 y nueva posición visual; calidad no validada |
| FPS/memoria/tap | no medidos | no medidos |

## Pending device validation

- No se detectó emulador Android conectado durante la validación original.
- Expo Web no inició porque falta `react-native-web`; no se instaló por restricción de alcance.
- Pendientes: compacto/alto, estrés, accesibilidad manual, memoria, FPS y latencia.

## Checklist CaminoBG2

- [ ] Nivel 1 — puerta, nodo, número, estado y navegación.
- [ ] Nivel 2 — puerta, nodo, número, estado y navegación.
- [ ] Nivel 3 — puerta, nodo, número, estado y navegación.
- [ ] Nivel 4 — puerta, nodo, “Actual”, estado y navegación.
- [ ] Nivel 5 — puerta, nodo, número, estado locked.
- [ ] Nivel 6 — puerta, nodo, número, estado locked.
- [ ] Nivel 7 — puerta, nodo, número, estado locked.
- [ ] Nivel 8 — puerta, nodo, número, estado locked.
- [ ] Nivel 9 — puerta, nodo, número, estado locked.
- [ ] Nivel 10 — puerta, nodo, número, estado locked.
- [ ] Nivel 11 — puerta, nodo, número, estado locked.
- [ ] Nivel 12 — puerta, nodo, número, estado premium.
- [ ] Nivel 13 — puerta luminosa, nodo, número y estado premium.

Los checks permanecen abiertos hasta validación en dispositivo; la inspección del PNG y preview no sustituyen prueba responsive/interactiva.

## TEST MATRIX

| Cambio | Pruebas mínimas |
|---|---|
| Coordenadas/overlay | 13 puertas + compacto + alto + extremos |
| `LevelNode` | cinco estados + tap/disabled + accesibilidad + hit target |
| `MapBackground`/readiness | carga + error + no flash blanco + reentrada |
| Scroll/cálculos | inicio + extremos + regreso + resize |
| Cámara/framing | ~3 cuevas + nivel 1 + zigzag amortiguado + cima centrada |
| CloudReveal/intro | carga + reveal + cima→actual + once-per-mount + reduced motion |
| LevelFocus | completed/in-progress/available + puerta correcta + navegación |
| Ruta de nivel | ID permitido + inválido + locked/premium desde mapa + Back |
| Asset/ratio | dimensiones + memoria + recorte + alineación |
| Mock/progreso | currentLevel + orden + estados + conteo de ejercicios |
| Detalle/ejercicio | progreso + lista + semántica no interactiva |

## Known limitations

- La alineación se calibró contra el asset, pero no se validó en la matriz de dispositivos.
- No hay suite automatizada específica de Camino ni evidencia E2E archivada.
- Las pruebas funcionales, visuales, accesibles y de estrés anteriores son casos requeridos, no resultados ejecutados salvo donde la tabla estática indica PASS.
- No hay backend para probar persistencia, multiusuario o errores remotos.

## Evidencia visual del ajuste fino

Cinco capturas del 2026-08-25 confirmaron sobre-zoom, predominio de una sola cueva, seguimiento lateral agresivo, ausencia observada del nivel 1 y baja legibilidad de Panorama. Se usaron para diagnosticar; no validan todavía la corrección posterior. Se requieren nuevas capturas con el mismo dispositivo para comparación equivalente.

El 2026-08-26 se generaron previews temporales de cima, current level y base a 393 × 700. Una propuesta de escala 3.15 fue descartada por mostrar una cueva dominante; 2.2 mostró más contexto y se adoptó. Esta evidencia es estática y no valida nodos React Native, animación, taps ni dispositivos.

## Protocolo de evidencia

Registrar fecha, plataforma/dispositivo, tipo de build, precondición, pasos, resultado esperado/observado y evidencia sanitizada. Después de un cambio documental basta `git diff --check` y revisión de diff; los comandos de app son proporcionales al código afectado.
