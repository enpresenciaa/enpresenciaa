# Control de fast-fixes

Esta carpeta registra errores corregidos y cambios mínimos realizados sobre el estado actual del proyecto. No sustituye el historial de Git, los issues ni la documentación de una fase.

## Qué se considera un fast-fix

Un cambio puede registrarse aquí cuando:

- corrige un comportamiento puntual o una regresión;
- modifica pocos archivos y conserva la arquitectura existente;
- no introduce una feature, dependencia, migración o contrato de datos nuevo;
- puede validarse con una prueba concreta y acotada.

Si el cambio necesita decisiones de arquitectura, trabajo en varias etapas o amplía el producto, debe documentarse en una fase o tarea independiente.

## Estado base

Cada registro debe indicar la fecha, rama y commit sobre los que se detectó el problema. Como contexto funcional se utiliza `../state/PROJECT_STATE.md`, pero el commit es la referencia exacta del código.

No se debe asumir que un fast-fix pendiente sigue siendo aplicable después de cambios posteriores: antes de implementarlo hay que reproducir el problema nuevamente.

## Flujo

1. Crear un archivo a partir de `FAST_FIX_TEMPLATE.md`.
2. Nombrarlo `YYYY-MM-DD-descripcion-breve.md`.
3. Asignar estado `detectado`, `en progreso`, `validado`, `cerrado` o `descartado`.
4. Registrar el comportamiento actual, el esperado y la evidencia de reproducción.
5. Mantener el cambio limitado a la causa confirmada.
6. Documentar archivos modificados, validaciones y riesgos residuales.
7. Agregar o actualizar su fila en `FAST_FIX_LOG.md`.

## Reglas

- Un archivo representa un solo problema o cambio mínimo.
- No incluir secretos, tokens ni datos personales en la evidencia.
- No marcar como validado algo que solo fue implementado o revisado visualmente sin ejecución.
- Si aparece alcance adicional, separarlo en otro fast-fix o moverlo a una fase.
- El cierre documental no autoriza commit, push, merge ni despliegue.
