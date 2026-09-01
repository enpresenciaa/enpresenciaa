# Rollback de la propuesta estructural

> Documento de revisión. La migración propuesta no ha sido aplicada.

## Estrategia

Si falla durante la ejecución, la transacción revierte el bloque completo. Después de que usuarios hayan creado contenido o reflexiones, no se deben eliminar tablas automáticamente porque eso destruiría datos.

## Rollback inmediato sin datos de producción

1. Eliminar la policy de lectura de `storage.objects`.
2. Eliminar el bucket `exercise-content` únicamente después de comprobar que no contiene objetos.
3. Eliminar policies, triggers y tablas `completion_reflections` y `exercise_contents`.
4. Eliminar el índice de posición.
5. Eliminar constraints y columnas añadidas a `exercises` y `levels`.

## Roll-forward preferido con datos

- Corregir policies o constraints mediante una migración nueva.
- Mantener archivos privados y filas existentes.
- Archivar contenido en vez de borrarlo.
- No retirar `is_premium` aunque todavía no bloquee acceso; es metadata de catálogo aprobada.

## Condiciones previas a una aplicación futura

- Confirmar paridad del esquema remoto con las migraciones locales.
- Ejecutar la propuesta primero en un proyecto Supabase local o staging.
- Comprobar que no existe ya el bucket o una policy con los mismos nombres.
- Respaldar esquema y datos.
- Validar que la extensión/esquema Storage está instalado.
