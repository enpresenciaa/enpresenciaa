# Plan de pruebas — Social Auth y perfiles

## Inspector

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| I01 | Usuario Google autenticado | Muestra datos sanitizados | PENDING |
| I02 | Sesión inexistente | La vista no es accesible | PENDING |
| I03 | Build de producción | El inspector no está disponible | PENDING |
| I04 | Metadata incompleta | La vista no falla | PENDING |
| I05 | Búsqueda de secretos | Ningún token se renderiza o copia | PENDING |

## Facebook

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| F01 | Registro inicial | Crea sesión y usuario | PENDING |
| F02 | Segundo acceso | Reutiliza el usuario | PENDING |
| F03 | Cancelación | Regresa a login sin sesión parcial | PENDING |
| F04 | Reinicio de app | Restaura la sesión | PENDING |
| F05 | Usuario nuevo | Muestra Empezar una vez | PENDING |
| F06 | Logout | Regresa a onboarding y bloquea tabs | PENDING |
| F07 | Datos recibidos | Inspector registra campos sanitizados | PENDING |

## Apple

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| A01 | Plataforma sin soporte | Botón oculto o indisponible correctamente | PENDING |
| A02 | Cancelación | No crea sesión ni muestra error técnico | BLOCKED_EXTERNAL |
| A03 | Primera autorización | Guarda nombre si está disponible | BLOCKED_EXTERNAL |
| A04 | Acceso posterior | Conserva nombre guardado | BLOCKED_EXTERNAL |
| A05 | Correo privado | El perfil acepta relay email | BLOCKED_EXTERNAL |
| A06 | Reinicio y logout | Sesión y guards correctos | BLOCKED_EXTERNAL |

## Validaciones técnicas por PR

- TypeScript.
- ESLint en archivos modificados.
- `git diff --check`.
- Build o export proporcional a los cambios nativos.
- Prueba funcional en la plataforma disponible.
