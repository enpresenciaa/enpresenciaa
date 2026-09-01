# Inspector seguro de usuario por proveedor

## Objetivo

Construir una vista interna que permita conocer la forma real de los datos entregados por cada proveedor antes de diseñar el perfil definitivo.

## Ubicación recomendada

- Acceso desde la navegación de `Yo`.
- Disponible sólo en builds locales o de desarrollo.
- No accesible en producción.

## Datos permitidos

- `user.id`.
- Proveedor principal y lista de proveedores.
- Correo y confirmación del correo.
- Teléfono si existe.
- Nombre y avatar normalizados para visualización.
- Fechas de creación, actualización y último acceso.
- Claves y valores no sensibles de `app_metadata`.
- Claves y valores no sensibles de `user_metadata`.
- Identidades vinculadas y sus campos públicos.

## Datos prohibidos

- Access token.
- Refresh token.
- Provider token.
- Provider refresh token.
- App secrets, client secrets, nonces o códigos OAuth.
- Contenido completo de la sesión serializada.

## Diseño técnico

- Crear un sanitizador explícito con lista permitida de campos.
- Separar datos normalizados de datos específicos del proveedor.
- Representar valores ausentes de forma visible.
- Permitir copiar únicamente el objeto sanitizado.
- No persistir el diagnóstico en almacenamiento adicional.

## Resultado de la evaluación

Registrar en `07_PROGRESS_AND_DECISIONS.md` qué campos devuelve cada proveedor y cuáles son confiables para el modelo de perfil.

## Criterios de aceptación

- Google puede inspeccionarse sin mostrar tokens.
- La vista desaparece o queda inaccesible en producción.
- Campos nulos y estructuras inesperadas no rompen la UI.
- El sanitizador tiene tipos explícitos y pruebas proporcionales al riesgo.
