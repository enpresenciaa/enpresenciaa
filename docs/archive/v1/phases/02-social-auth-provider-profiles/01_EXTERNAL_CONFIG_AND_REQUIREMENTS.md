# Configuración externa y requisitos

## Facebook

### Disponible

- Cuenta de Meta for Developers.
- Aplicación de Meta creada.
- Proyecto de Supabase operativo.

### Configuración requerida

- Agregar Facebook Login a la aplicación de Meta.
- Registrar como Valid OAuth Redirect URI:

```text
https://jyjlqgcnsdfhtlfwphrb.supabase.co/auth/v1/callback
```

- Copiar App ID y App Secret en Supabase Authentication → Providers → Facebook.
- Mantener la aplicación de Meta en modo Development durante las pruebas internas.
- Asignar como administrador, desarrollador o tester a cada cuenta usada para probar.

### Pendiente para publicación

- URL pública de política de privacidad.
- Mecanismo o URL de eliminación de datos.
- Información pública y contacto de la aplicación.
- Revisión de permisos si el alcance futuro supera nombre, correo y foto pública.

## Apple

### Se puede avanzar sin credenciales

- Diseñar la interfaz y comportamiento del botón.
- Instalar y configurar `expo-apple-authentication`.
- Implementar nonce, solicitud nativa y `signInWithIdToken`.
- Preparar captura del nombre durante la primera autorización.
- Incorporar manejo de cancelación, error y disponibilidad por plataforma.

### Bloqueos para validar

- Membresía activa de Apple Developer Program.
- App ID con Sign in with Apple habilitado.
- Firma y provisioning válidos.
- Development build o distribución mediante EAS.
- Prueba final en un dispositivo iOS.

### Fuera de este bloque

Apple en Android o web requiere OAuth web, Service ID y rotación del client secret. Se tratará como una tarea independiente si se aprueba.

## Secretos

- Los secretos se configuran directamente en Supabase, Meta, Apple o el sistema seguro de builds.
- `.env.local` no se versiona.
- No copiar secretos en capturas, logs, vistas de diagnóstico o descripciones de PR.
