# Configuración externa y secretos

Este documento controla lo que debe existir en **Supabase Dashboard**, **Google Auth Platform** y configuración de entorno, sin almacenar secretos.

---

## 1. Estado esperado antes de tocar código

### Supabase

- [ ] Proyecto correcto seleccionado.
- [ ] Google provider habilitado.
- [ ] Google Client ID configurado en Supabase.
- [ ] Google Client Secret configurado **solo en Supabase**.
- [ ] URL del proyecto identificada.
- [ ] Publishable key o anon key pública identificada.
- [ ] Redirect allow list preparada para el deep link móvil.
- [ ] Configuración de Email/Password revisada.
- [ ] Estado de `Confirm email` documentado.

### Google Auth Platform

- [ ] Audience configurada.
- [ ] Aplicación en modo de prueba si todavía aplica.
- [ ] Scopes mínimos:
  - `openid`
  - email
  - profile
- [ ] OAuth Client tipo Web application creado.
- [ ] Callback de Supabase registrado:

```text
https://<PROJECT_REF>.supabase.co/auth/v1/callback
```

- [ ] Client Secret no aparece en el repositorio.
- [ ] Client Secret no aparece en variables `EXPO_PUBLIC_*`.

---

## 2. Variables que sí puede usar el cliente Expo

Preferencia actual:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Si el proyecto utiliza el esquema anterior de claves:

```text
EXPO_PUBLIC_SUPABASE_ANON_KEY
```

Elegir un solo contrato y mantenerlo consistente.

### Importante

Una `EXPO_PUBLIC_*` forma parte del bundle cliente. Por tanto:

**Permitido:**
- Project URL.
- Supabase publishable key.
- Supabase anon key pública.

**Prohibido:**
- `service_role`.
- Google Client Secret.
- contraseñas.
- claves privadas.
- secretos SMTP.
- claves administrativas.

---

## 3. Google Client ID dentro de la app

Para el flujo móvil elegido:

```text
supabase.auth.signInWithOAuth()
```

el Google Client ID/Secret se administra desde Supabase.

No agregar `EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID` al cliente móvil salvo que posteriormente se implemente:

- Google Sign-In nativo mediante otra librería; o
- soporte web que realmente lo requiera.

---

## 4. Redirects

Cuando se confirme el scheme de la app, registrar en Supabase una URL exacta como:

```text
enpresenciaa://auth/callback
```

Para varios entornos, documentar explícitamente cada uno.

Ejemplo conceptual:

```text
enpresenciaa.local://auth/callback
enpresenciaa.preview://auth/callback
enpresenciaa://auth/callback
```

No utilizar wildcards más amplios de lo necesario si una ruta exacta es suficiente.

---

## 5. Registro de configuración externa

No escribir valores secretos. Completar solo estado y referencias no sensibles.

| Configuración | Estado | Nota |
|---|---|---|
| Supabase Project URL | ⬜ | Guardar valor en env, no aquí |
| Publishable/anon key | ⬜ | Guardar valor en env, no aquí |
| Google provider | ⬜ | enabled/disabled |
| Google OAuth Web Client | ⬜ | no copiar secret |
| Supabase callback en Google | ⬜ | |
| Deep link en Supabase allow list | ⬜ | |
| Email/password habilitado | ⬜ | |
| Confirm email | ⬜ | ON/OFF |
| Test user Google | ⬜ | no es necesario listar emails aquí |

---

## 6. Validación de seguridad

Antes de commit:

```bash
git diff --cached
```

Buscar accidentalmente:

```text
service_role
client_secret
refresh_token
access_token
password=
SUPABASE_SERVICE
GOOGLE_CLIENT_SECRET
```

Si aparece un secreto real:

1. no hacer commit;
2. eliminarlo del repositorio;
3. rotarlo desde el proveedor correspondiente si llegó a compartirse;
4. registrar el incidente sin copiar el secreto.

---

## 7. Criterio de aceptación

- La app conoce URL + clave pública por variables.
- Supabase conoce el Client ID + Secret de Google.
- Google conoce únicamente el callback de Supabase.
- Supabase conoce el callback/deep link de la app.
- Ningún secreto privado está dentro del cliente.
