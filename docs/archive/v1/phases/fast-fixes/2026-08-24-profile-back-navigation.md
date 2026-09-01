# Fast-fix: navegación de regreso en Yo

## Identificación

- ID: `FF-20260824-02`
- Estado: `en progreso`
- Fecha de detección: `2026-08-24`
- Rama base: rama de trabajo local
- Commit base: cambios locales sin commit; consultar `git status`

## Problema actual

Las vistas `Editar perfil` y `Tipo de suscripción` proporcionaban `/(tabs)/yo` como ruta de respaldo al botón Regresar. El componente priorizaba siempre ese respaldo y ejecutaba `replace`, aunque ambas vistas se abren normalmente con `push` desde Yo y sí existe una entrada anterior en el stack.

El resultado visible era regresar a Yo, pero se reemplazaba la pantalla de detalle en lugar de retirar su entrada. Esto podía dejar otra instancia de Yo debajo de la actual y producir navegación posterior redundante.

## Comportamiento esperado

- Al entrar desde Yo, Regresar debe ejecutar la navegación real hacia atrás.
- Si una vista se abre directamente y no existe historial, debe volver de forma segura a Yo mediante su ruta de respaldo.
- No debe emitirse una acción `GO_BACK` cuando el router no puede retroceder.

## Corrección mínima

`BackButton` ahora consulta primero `router.canGoBack()`. Ejecuta `router.back()` cuando existe historial y usa `fallbackHref` con `replace` únicamente cuando no existe.

## Vistas revisadas

- `/(tabs)/yo/editar-perfil`
- `/(tabs)/yo/suscripcion`
- `/(tabs)/yo` no muestra botón Regresar porque es la raíz de la pestaña.

## Validación

- [x] `npm.cmd run type-check` pasó.
- [x] ESLint pasó sobre el componente y las dos vistas revisadas.
- [ ] Prueba manual desde Yo hacia cada vista y regreso.
- [ ] Prueba de apertura directa sin historial.
