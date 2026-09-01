# Facebook Login

## Objetivo

Agregar Facebook como proveedor social reutilizando la sesión, callback, onboarding y guards existentes.

## Implementación

- Generalizar el flujo OAuth actual para aceptar proveedores soportados de forma tipada.
- Mantener mensajes y estados de carga específicos por proveedor.
- Habilitar Facebook en los componentes de acceso y registro.
- Reutilizar el callback global ya validado en Android.
- No introducir un segundo sistema de sesión o navegación.

## Datos esperados a validar

- ID de Supabase.
- Identidad con proveedor `facebook`.
- Correo cuando Meta lo entregue y el permiso esté disponible.
- Nombre completo.
- Avatar o URL de fotografía.
- Diferencias entre `app_metadata`, `user_metadata` e `identity_data`.

## Pruebas

- Registro inicial con una cuenta autorizada por Meta.
- Inicio posterior con la misma cuenta sin duplicar usuario.
- Cancelación del navegador.
- Callback inválido o proveedor deshabilitado.
- Restauración tras cerrar y abrir la app.
- Onboarding mostrado una vez.
- Logout y protección de tabs.

## Restricción de publicación

Mientras falten privacidad y eliminación de datos, Facebook permanecerá en modo Development y se probará sólo con cuentas asignadas a la aplicación.
