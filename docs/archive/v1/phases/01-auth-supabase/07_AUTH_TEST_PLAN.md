# Plan de pruebas — Auth + Supabase

## 1. Entornos

Ejecutar al menos en:

- [ ] Android development build.
- [ ] Segundo entorno cuando sea posible: iOS simulator/device o Android adicional.

No cerrar la fase solo con Expo Go si el flujo depende de custom scheme.

---

# 2. Preparación

Antes de probar:

- [x] variables cargadas;
- [x] provider Google habilitado;
- [x] callback Google → Supabase correcto;
- [x] redirect Supabase → app correcto;
- [ ] usuario Google de prueba autorizado si aplica;
- [ ] development build regenerada después de cambios nativos/scheme;
- [x] type-check limpio;
- [ ] lint limpio.

---

# 3. Matriz Email/Password

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| E01 | email válido + password correcto | sesión autenticada | ⬜ |
| E02 | password incorrecto | error visible, sin sesión | ⬜ |
| E03 | email inválido | validación local | ⬜ |
| E04 | campos vacíos | validación local | ⬜ |
| E05 | signup nuevo | usuario creado según política | ⬜ |
| E06 | email existente | error controlado | ⬜ |
| E07 | confirm email ON | session null + mensaje de confirmación | ⬜ |
| E08 | submit doble | una sola operación lógica | ⬜ |

---

# 4. Matriz Google OAuth

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| G01 | Google usuario nuevo | sesión creada | ⬜ |
| G02 | Google usuario existente | sesión creada | ⬜ |
| G03 | cancelar selector | vuelve a Login sin sesión | ⬜ |
| G04 | cerrar navegador | estado recuperable | ⬜ |
| G05 | sin red | error controlado | ⬜ |
| G06 | redirect incorrecto | error detectado, no loading infinito | ⬜ |
| G07 | reiniciar tras login | sesión restaurada | ⬜ |
| G08 | abrir OAuth dos veces | prevenir concurrencia/doble tap | ⬜ |

---

# 5. Persistencia

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| S01 | cerrar y abrir app | mantiene sesión | ⬜ |
| S02 | background → foreground | sesión sigue válida | ⬜ |
| S03 | token refresh | usuario sigue autenticado | ⬜ |
| S04 | logout | sesión eliminada | ⬜ |
| S05 | logout + reinicio | continúa sin sesión | ⬜ |

---

# 6. Guards

| ID | Caso | Resultado esperado | Estado |
|---|---|---|---|
| R01 | abrir `/(tabs)` sin sesión | no muestra contenido privado | ⬜ |
| R02 | abrir ejercicio sin sesión | guard bloquea | ⬜ |
| R03 | abrir Login con sesión | no queda en flujo público | ⬜ |
| R04 | sesión hidratando | no flash de Home/Login | ⬜ |
| R05 | logout dentro de tabs | sale de área privada | ⬜ |

---

# 7. Seguridad

- [x] No hay `service_role` en bundle.
- [x] No hay Google Client Secret en bundle.
- [x] No se loggean tokens.
- [x] No se loggea password.
- [x] No se persisten tokens manualmente en MMKV/Zustand.
- [x] No se creó RLS `using (true)` como workaround.
- [x] `.env` sensible no está accidentalmente trackeado.

---

# 8. Regresión visual

- [ ] Login mantiene diseño.
- [ ] Crear cuenta mantiene diseño.
- [ ] botón Google conserva diseño.
- [ ] Apple/Facebook no cambiaron fuera del alcance.
- [ ] Inicio mantiene mocks actuales.
- [ ] Notificaciones mantiene mocks actuales.
- [ ] navegación de tabs no cambió visualmente.

---

# 9. Validaciones de código

Usar los scripts que realmente existan en `package.json`.

Preferencia:

```bash
bun run type-check
bun run lint
```

Si el proyecto usa otra orden, documentarla.

---

# 10. Evidencia de cierre

Completar:

```text
Commit:
Build:
Plataforma:
Fecha:
Tester:
Casos fallidos:
Bloqueos:
```

No registrar correos personales, tokens ni secretos.
