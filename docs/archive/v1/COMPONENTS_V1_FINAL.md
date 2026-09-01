# Inventario de componentes V1

- Fecha: 2026-08-31
- Rama/HEAD: `feature/journey-journal-foundation` / `c302f0e96aa46b9afb26dc4e4f1ccf0cf726068f`
- Alcance: componentes exportados y pantallas de feature; contratos resumidos, no copia de código.

Estados: **activo**, **parcial**, **mock**, **residual**. La recomendación V2 no autoriza cambios.

## Sistema de diseño y onboarding

| Componente | Ruta | Contrato/estado | Hooks/datos/navegación | V2 |
|---|---|---|---|---|
| `AppButton` | `components/onboarding` | children, disabled/loading, onPress; activo | Pressable/ActivityIndicator | adaptar a variantes tipadas |
| `AppInput` | idem | TextInputProps + label/error/password; activo | foco/visibilidad local | conservar con ajustes |
| `AppCheckbox` | idem | checked/label/error; activo | controlado | conservar |
| `BackButton` | idem | fallbackHref/inline; activo | `router.canGoBack/back/replace` | conservar |
| `OnboardingBackground` | idem | source, fit, position, fallback; activo | espera `onDisplay`, desbloquea en error | conservar |
| `OnboardingScreen` | idem | title/description/children; parcial | composición | evaluar uso |
| `OAuthOptions` | idem | providers habilitados/loading/callback; activo | Google/Facebook; Apple visible deshabilitado | adaptar |
| `EmailConfirmationModal` | idem | email, resend/change/close; activo | estados por props | conservar |
| `MoodSelector` | idem | Mood controlado/error; activo local | ejercicio inicial; no persiste | adaptar |
| `PhoneNumberInput` | idem | código/phone/error; activo | estado desplegable local | adaptar |
| `DateOfBirthPicker` | idem | valor/blur/change/error | estado modal/plataforma | conservar con pruebas |
| `CurrentScreenLabel` | idem | label simple | sin consumo encontrado | eliminar si se confirma |

## Home y notificaciones

| Componente | Responsabilidad | Datos/estado | Estado | V2 |
|---|---|---|---|---|
| `HomeHeader`, `MotivationRow` | saludo/motivación/notificaciones | props; nombre real, motivación mock | mixto | conservar presentación |
| `HomeBackground`, `HomeHeroSection` | fondo y tarjeta de racha | asset + días mock | mock | reemplazar racha; adaptar fondo |
| `CurrentExerciseCard`, `RecentExerciseCard` | tarjetas de ejercicio | props de `homeMock` | mock | conservar con contratos DB |
| `ActivityCalendar` | grilla mensual | props mock, util calendario | mock; 178 líneas y deuda lint | refactorizar |
| `NotificationButton` | icono/badge | unread mock | mock | adaptar/eliminar según V2 |
| `NotificationsHeader/List/Card` | lista visual | `notificationsMock` | mock | adaptar a Comunidad o eliminar |
| `SectionScreen` | placeholder de sección | title/background | residual | eliminar si no hay consumidores |

## Camino y ejercicios

| Componente | Props/estado/hooks | Fuente/navegación | Estado | V2 |
|---|---|---|---|---|
| `CaminoMap` | levels/current/onPress; medidas, scroll, carga, reduced motion | fondo local y Reanimated | activo visual, mock | reemplazar por camino lineal |
| `MapBackground` | width/height/onReady/onError | `CaminoBG.png` | activo, asset no trackeado | adaptar/reemplazar |
| `LevelOverlay` | levels/map bounds/onPress | render de nodos | mock | reemplazar layout |
| `LevelNode` | level/x/y/current/onPress | status mock | mock | adaptar menor |
| `MapLoadingState` | error/loading | local | activo | conservar patrón |
| `CloudReveal` | reveal/reduced motion/callback | animación local | parcial; uso actual por confirmar | evaluar |
| `LevelHeader`, `LevelProgress` | display nivel/progreso | props mock | mock | adaptar a DB |
| `ExerciseList`, `ExerciseItem` | lista/navegación | ejercicios mock; emite `/exercise/id` | mock | adaptar a catálogo real |
| `ExercisesScreen` | pantalla simple de sección | sin ruta consumidora actual | residual | eliminar/reemplazar |

## Bitácora, perfil y billing

| Componente/pantalla | Responsabilidad | Fuente y estado | V2 |
|---|---|---|---|
| `JournalScreen` | filtros, búsqueda, infinite list, estados | Supabase real vía hook | conservar con entitlements |
| `JournalFilters` | filtro segmentado + búsqueda | controlado | conservar |
| `JournalEntryCard` | progreso/completion/emoción | DTO real | adaptar |
| `JournalState` | loading/error/empty/retry | props | conservar |
| `ProfileHeader` | avatar/nombre/fecha | profile/Auth | conservar |
| `ProfileScreen` | perfil, menú, logout | backend real + placeholders | adaptar |
| `EditProfileScreen` | editar profile/email | dos operaciones remotas | refactorizar transacción UX |
| `SubscriptionScreen` | muestra plan/tarjeta/vencimiento | Auth metadata temporal | reemplazar |
| `BillingTestCheckout` | iniciar Checkout y consultar estado | Function + billing query; dev only | conservar solo como harness técnico |
| `BillingReturnRoute` | cancelar/pending/confirmar por query | billing remoto | adaptar cuando exista puente |

## Pantallas sin componente extraíble

Splash, Video, Bienvenida, Ejercicio inicial, Poder del cambio, Crear cuenta, Login y Empezar viven directamente en rutas. Crear cuenta y Login combinan formulario, locks, OAuth, errores y navegación; se recomienda separar controller/view en V2. El detalle de ejercicio es solo placeholder.

## Reutilización y dependencias

Predominan props y StyleSheet; Uniwind se usa de forma limitada (`SectionScreen`, not-found, inspector) y no existe un sistema uniforme de variantes pese a `tailwind-variants`. Alice/Poppins y `onboarding-theme` son dependencias transversales.

Incertidumbres: no se ejecutó análisis automático de componentes sin uso; la clasificación residual deriva de búsquedas de imports/rutas. Ver `ASSETS_AND_UI_V1_FINAL.md` y `V2_REUSE_MATRIX.md`.
