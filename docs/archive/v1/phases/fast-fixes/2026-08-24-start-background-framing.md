# Fast-fix: encuadre completo del fondo de Empezar

## Identificación

- ID: `FF-20260824-01`
- Estado: `en progreso`
- Fecha de detección: `2026-08-24`
- Rama base: rama de trabajo local
- Commit base: cambios locales sin commit; consultar `git status`

## Problema actual

El fondo de la vista Empezar se renderizaba con `contentFit="cover"`. En pantallas más estrechas que la proporción 9:16 del archivo, Expo ampliaba la imagen hasta llenar la altura y recortaba ambos laterales. Los textos impresos en la imagen, especialmente “Emocional” y “Energético & Espiritual”, quedaban incompletos.

## Comportamiento esperado

La composición completa del fondo debe permanecer visible en cualquier proporción de pantalla, incluidos todos sus textos laterales.

## Corrección mínima

- Permitir que `OnboardingBackground` reciba `contentFit` y un color de fondo, conservando `cover` como valor predeterminado para no cambiar otras pantallas.
- Usar `contain` únicamente en Empezar.
- Alinear la composición en la parte superior para que el espacio sobrante no aparezca sobre la imagen.
- Mostrar un verde compatible detrás de la imagen cuando la proporción del dispositivo produzca franjas laterales.
- Sincronizar globalmente el contenido de las vistas que usan `OnboardingBackground`: los hijos aparecen solo cuando el fondo ya fue presentado, con color estable e indicador durante la carga.

## Validación

- [x] `npm.cmd run type-check` pasó.
- [x] ESLint pasó sobre los archivos modificados.
- [ ] Inspección en el simulador de la captura reportada.
