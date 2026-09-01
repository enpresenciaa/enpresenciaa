# Estado final de V1

- Fecha: 2026-08-31
- Rama/HEAD: `feature/journey-journal-foundation` / `c302f0e96aa46b9afb26dc4e4f1ccf0cf726068f`
- Alcance: código, configuración, migraciones, assets, Git, remoto Supabase de solo lectura y fases históricas.
- Evidencia: observada salvo donde se indica “reportado”.

## Git y reproducibilidad

HEAD es `c302f0e feat: add journey and journal domain foundation`. El working tree contiene cambios funcionales no integrados.

| Estado | Rutas principales |
|---|---|
| Modificados | `.env.example`, `.gitignore`, root layout, `AppButton`, env, `AuthProvider`, seis archivos de Journey, `database.ts`, `tsconfig.json` |
| Nuevos | `assets/images/CaminoBG.png`, `src/app/billing/`, `src/features/billing/`, `supabase/config.toml`, `supabase/functions/`, migración billing, `docs/archive/v1/` |
| Ignorados relevantes | `.env.local`, `android/`, `.expo/`, reglas locales, fases históricas salvo Stripe, templates README |
| Artefacto local | `supabase/.temp/`, generado al usar Supabase CLI; no es fuente V1 |

Conclusión: V1 actual no puede reconstruirse desde `HEAD` ni desde Git remoto sin capturar selectivamente el working tree. `CaminoBG.png` y billing son dependencias directas no trackeadas.

## Estructura real simplificada

```text
src/
├── app/                 Expo Router: onboarding, auth, tabs, nivel, ejercicio, billing
├── components/          home, layout, notifications, onboarding, profile
├── config/              env y dos temas
├── data/                catálogo legacy estático de suscripciones/servicios
├── features/            auth, billing, exercises, for-you, home, journal, journey, notifications, profile
├── lib/                 Supabase, SecureStore, MMKV, QueryClient
├── mocks/               Home y notificaciones
├── types/               DB manual y contratos UI/legacy
└── utils/               calendario
supabase/
├── migrations/          profiles, journal/core exercise, exercise foundation, billing
├── functions/           create-stripe-checkout, stripe-webhook, shared
└── templates/           correo de confirmación
assets/                  imágenes, iconos y un MP4
plugins/                 deployment target iOS
phases/                  memoria histórica local y Stripe parcialmente trackeable
docs/archive/v1/         cierre V1
```

No existen `src/hooks`, `src/services` o `src/models` globales; hooks/servicios/modelos se agrupan por feature. No existe un store Zustand activo: solo un adaptador MMKV sin consumidores de estado encontrados.

## Estado funcional por dominio

| Dominio | Código | Backend | Validación | Estado V1 |
|---|---|---|---|---|
| Email/password | Sí | Supabase Auth | reportado parcial + estática | funcional con matriz incompleta |
| Google OAuth | Sí | Supabase Auth | reportado por propietario | no reproducido en este cierre |
| Facebook OAuth | Sí | Supabase Auth/Meta | reportado con retorno tardío histórico | estabilidad no reproducida |
| Apple | botón visual deshabilitado | no | no | no implementado |
| Perfil | Sí | `profiles` | estática; remoto anónimo | funcional, RLS multiusuario pendiente |
| Inicio | Sí | solo perfil | no funcional reciente | progreso/racha mock |
| Camino/niveles | Sí | no consumido | estática | visual mock |
| Ejercicio | placeholder | esquema preparado | no | imposible completar desde UI |
| Bitácora | Sí | `journal_entries` | 6 tests unitarios | lectura real; depende de datos externos |
| Notificaciones | Sí | no | no | mock |
| Para Ti | placeholder | no | no | parcial |
| Suscripción de perfil | UI metadata | no autoritativo | no | placeholder/residual |
| Stripe test | fundación | Functions/tablas | smoke negativos | incompleto, sin E2E |

## Configuración y riesgos

- Expo 55, RN 0.83.10, React 19.2, TypeScript strict.
- Scheme/package/bundle: `enpresenciaa`, `com.enpresenciaa.app`.
- `extra.eas.projectId` sigue como placeholder.
- Local/preview/production comparten identidad y API URL; separación de ambientes insuficiente.
- iOS permite `NSAllowsArbitraryLoads`, riesgo antes de producción.
- API heredada `subscribed-apis.onrender.com` y módulos legacy de suscripciones no tienen consumidores principales observados.
- Las fuentes Alice/Poppins se cargan en root; mientras cargan se devuelve `null`.

## Referencias

Arquitectura, rutas, datos, auth, pagos y validaciones se detallan en los documentos hermanos. Las copias históricas están en `phases/` y su vigencia se clasifica en `LEGACY_MANIFEST.md`.
