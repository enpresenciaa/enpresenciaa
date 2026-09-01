# Assets y UI V1

- Fecha: 2026-08-31
- Rama/HEAD: `feature/journey-journal-foundation` / `c302f0e96aa46b9afb26dc4e4f1ccf0cf726068f`
- Fuente: inventario filesystem y referencias estáticas; no se eliminaron assets.

## Inventario funcional

| Asset/grupo | Uso real | Estado |
|---|---|---|
| `Imág. INICIO.jpg` | splash | activo |
| `Imág. VIDEO INTRO.jpg` | fondo video | activo |
| `Imág. COMENZAR.jpg` | bienvenida | activo |
| `Imág. ¿YASENTISTE EL CAMBIO.jpg` | poder del cambio | activo |
| `Imág. INICIAR SESIÓN.jpg` | login | activo |
| `Imág. EMPEZAR.jpg` | Empezar contain/top | activo |
| `Imág. PÁG PRINCIPAL.jpg` | HomeBackground | activo |
| `Imág. NOTIFICACIONES.jpg` | NotificationsScreen | activo |
| `CaminoBG.png` | mapa actual, 2.55 MB | activo y no trackeado |
| `CaminoBG2.png` | fondo anterior | sin referencia encontrada; legacy |
| `Imág. CAMINO.jpg` | prototipo | sin referencia encontrada; legacy |
| `video_introduccion.mp4` | video intro y ejercicio inicial, 19.46 MB | activo; TODO indica genérico |
| icon/adaptive/favicon | Expo config | activos; archivos muy pequeños |
| `onboarding-hero.png` | sin referencia encontrada | residual posible |
| `empty-*`, `subscribed.png`, `oAuth.png` | herencia de plantilla/suscripciones | sin consumo principal encontrado |

`src/data/static/services.ts` y `subscriptions.ts` apuntan a imágenes remotas de GitHub y parecen pertenecer al dominio heredado Subscribed; no se encontraron pantallas principales que los consuman.

## Tipografía y color

- Alice 400 para títulos.
- Poppins 400/500/600 para cuerpo.
- `onboarding-theme.ts` define paleta crema/verde/error y familias.
- `theme.ts` + Uniwind definen colores por tema.
- Root carga fuentes antes de renderizar y devuelve `null` mientras tanto.

## Implementación visual

Predomina `StyleSheet`; Uniwind/className aparece en piezas pequeñas y global.css; `tailwind-variants` está instalado pero no se observó como patrón dominante. Reanimated se usa en Empezar/Camino. Expo Image sincroniza `OnboardingBackground`; otros fondos usan `ImageBackground`/Image sin la misma barrera de contenido.

## Riesgos y V2

- MP4 y fondos grandes impactan bundle/memoria; medir antes de reutilizar.
- Duplicados aparentes no deben eliminarse sin comparación visual/hash y aprobación.
- Nombres con espacios, acentos y signos funcionan con require, pero complican tooling.
- El fondo Camino actual depende de un archivo fuera de HEAD.
- Consolidar regla de carga de fondos y sistema de diseño en V2.

Referencias: `COMPONENTS_V1_FINAL.md`, `V2_REUSE_MATRIX.md`.
