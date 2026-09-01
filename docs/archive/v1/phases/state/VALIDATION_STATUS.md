# Estado de validaciones

Fecha: 2026-08-25. Se distingue evidencia ejecutada, evidencia reportada y pendientes; Camino fue actualizado sobre el snapshot previo.

| Área | Validación | Estado | Evidencia |
|---|---|---|---|
| Código | `bun run type-check` | PASS | ejecutado sobre working tree actual |
| Código | ESLint dirigido (15 archivos de fase) | PASS | ejecutado sobre working tree actual |
| Git | `git diff --check` | PASS con avisos | sin whitespace inválido; LF→CRLF |
| Secretos | archivos sensibles trackeados | PASS estático | solo `.env.example`; sin valores expuestos |
| Auth | almacenamiento/listener/cleanup | PASS estático | implementación presente |
| Google | login, sesión y datos sanitizados | PASS manual reportado | confirmado por propietario |
| Email | signup/login | PARCIAL | implementado; matriz completa pendiente |
| Facebook | flujo extremo a extremo | PENDIENTE | usuario creado no demuestra sesión estable |
| Apple | implementación/prueba | PENDIENTE | requiere Apple Developer/iOS firmado |
| Routing | guards | PASS previo | regresión actual de Empezar pendiente |
| Profile DB | migración | PASS reportado | fase registra aplicación manual; no revalidada aquí |
| Profile app | lectura/ensure/update/caché | PASS estático | compila; sin commit |
| Profile app | dispositivo | PENDIENTE | lectura, edición, fallback y restauración |
| RLS | aislamiento entre usuarios | PENDIENTE | políticas revisadas; falta prueba con dos usuarios |
| Bundle Android | export | PASS histórico | no repetido sobre cambios actuales |
| Lint global | repositorio | PENDIENTE | deuda histórica fuera del lint dirigido |
| Camino inmersivo | `bun run type-check` | PASS | ejecutado sobre working tree del 2026-08-25 |
| Camino inmersivo | ESLint dirigido | PASS | componentes, pantalla, tipos y constantes modificados |
| Camino inmersivo | revisión estática | PASS | una escena, ratio/coords relativos, reglas de acceso conservadas |
| Camino inmersivo | evidencia visual inicial | FAIL corregido en código | sobre-zoom, nivel 1 ausente, zigzag agresivo y Panorama débil en 5 capturas |
| Camino inmersivo | corrección en dispositivo | PENDIENTE | ~3 cuevas, nivel 1, cima, alineación, reduced motion, FPS y memoria |

## Matriz prioritaria pendiente

### Antes del PR de Profile

- Email nuevo crea perfil con nombre/teléfono.
- Google existente obtiene perfil por backfill o `ensureProfile`.
- Home/Yo muestran nombre y avatar con campos nulos.
- Editar nombre/fecha persiste tras reiniciar.
- Cambio de email comunica confirmación y posible guardado parcial.
- Logout limpia caché; otro usuario no recibe datos anteriores.
- Dos usuarios no leen ni modifican perfiles ajenos.
- Empezar aparece según la regla de producto acordada.

### Auth social y release

- Facebook nuevo/existente, cancelación, error, callback y sesión restaurada con cuenta Meta autorizada.
- Repetir Google tras los cambios actuales de callback.
- Callback con app fría y abierta en development build.
- Apple cuando exista build iOS firmada.
- Lint global, builds Android/iOS y revisión de secretos/ATS antes de release.

## Evidencia requerida

Registrar fecha, plataforma/build, precondición, pasos, resultado esperado/observado y evidencia sanitizada. Un check estático no reemplaza prueba funcional; un solo usuario no valida RLS.

Comandos mínimos: `bun run type-check`, ESLint dirigido, `git diff --check` y `git status --short`.
