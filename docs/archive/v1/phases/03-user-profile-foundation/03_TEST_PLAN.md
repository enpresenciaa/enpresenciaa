# Plan de pruebas — Perfil persistente

## Base de datos

- [x] DB01: migración aplica sin errores.
- [ ] DB02: backfill crea una fila por usuario existente.
- [ ] DB03: registro nuevo crea perfil por trigger.
- [ ] DB04: usuario A lee su perfil.
- [ ] DB05: usuario A no lee perfil B.
- [ ] DB06: usuario A actualiza su perfil.
- [ ] DB07: usuario A no actualiza perfil B.
- [ ] DB08: `updated_at` cambia automáticamente.
- [x] DB09: rol anónimo no tiene privilegio SELECT sobre profiles.

## Aplicación

- [ ] APP01: YO carga nombre y avatar con precedencia correcta.
- [ ] APP02: Inicio usa nombre de `profiles`.
- [ ] APP03: nombre editado persiste al reiniciar.
- [ ] APP04: nacimiento editado persiste al reiniciar.
- [ ] APP05: correo sin cambio no dispara confirmación.
- [ ] APP06: correo cambiado informa confirmación.
- [ ] APP07: error de red no borra valores del formulario.
- [ ] APP08: perfil ausente se recupera de forma segura.
- [ ] APP09: Google y Facebook conservan avatar como fallback.

## Calidad

- [ ] Q01: TypeScript.
- [ ] Q02: lint dirigido.
- [ ] Q03: `git diff --check`.
- [ ] Q04: no hay secretos ni service role.
- [ ] Q05: migración revisada manualmente.
