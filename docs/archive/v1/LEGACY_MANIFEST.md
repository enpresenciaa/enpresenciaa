# Manifiesto legacy V1

- Fecha: 2026-08-31
- Rama/HEAD: `feature/journey-journal-foundation` / `c302f0e96aa46b9afb26dc4e4f1ccf0cf726068f`
- Alcance: procedencia, vigencia y exclusiones de documentación/assets/código histórico.

## Copias de fases

Se copiaron mecánicamente 59 `.md` desde `phases/` hacia `docs/archive/v1/phases/`, conservando rutas relativas. Los originales no se movieron ni sobrescribieron. La búsqueda previa no encontró valores de secretos; solo nombres/patrones sanitizados. Todos los originales salvo Stripe estaban ignorados por Git; Stripe quedó excepcionado durante la fase previa.

| Origen | Copias | Vigencia |
|---|---:|---|
| `phases/01-auth-supabase` | 9 | histórica/parcial: arquitectura Auth vigente; pruebas/config externa no reproducidas |
| `phases/02-social-auth-provider-profiles` | 8 | parcialmente obsoleta: Facebook existe en código; Apple sigue pendiente |
| `phases/03-user-profile-foundation` | 5 | mayormente vigente; remoto/RLS autenticado incompleto |
| `phases/04-camino-map` | 6 | histórica/parcial: concepto vigente, geometría/fondo cambiaron después |
| `phases/05-exercise-domain-foundation` | 9 | vigente para SQL/decisiones; app aún no conectada |
| `phases/fast-fixes` | 6 | histórico: evidencia de bugs/decisiones, no garantía de regresión actual |
| `phases/state` | 3 | obsoleto como snapshot final; útil como evolución |
| `phases/stripe-payments-foundation` | 13 | log reciente vigente; README inicial quedó rezagado respecto a despliegue |

Excluidos por bajo valor probatorio/duplicación: `AUTH_PHASE_INDEX.md`, `SOCIAL_AUTH_PHASE_INDEX.md`, `PROFILE_PHASE_INDEX.md`, tres `*_CODEX_EXECUTION_PROMPTS.md` y `FAST_FIX_TEMPLATE.md`. Los índices repiten enlaces; prompts/plantilla son instrucciones, no estado V1.

## Código/recursos legacy o residuales

| Ruta | Evidencia | Tratamiento V2 sugerido |
|---|---|---|
| `src/data/static/*`, `src/types/index.ts` | modelo heredado Subscribed, sin consumo principal observado | eliminar tras confirmar imports |
| `app-env.js` API subscribed | URL heredada sin servicio consumidor encontrado | reemplazar/eliminar |
| `SectionScreen`, `ExercisesScreen`, `CurrentScreenLabel` | sin ruta/consumo principal observado | confirmar y eliminar |
| `evaluacion-inicial.tsx` | redirect de compatibilidad | retirar al redefinir onboarding |
| `SubscriptionScreen` metadata | no usa billing autoritativo | reemplazar |
| `CaminoBG2.png`, `Imág. CAMINO.jpg` | no referenciados | comparar y archivar/eliminar después |
| `empty-*`, `subscribed.png`, `onboarding-hero.png`, `oAuth.png` | sin referencia encontrada | inventario visual antes de eliminar |
| `supabase/.temp/` | artefacto generado CLI | no versionar |
| `android/` | proyecto generado ignorado | regenerable; no fuente primaria salvo cambios nativos intencionales |

## Código activo no contenido en HEAD

Billing completo, ruta retorno, migración Stripe, Functions, `CaminoBG.png` y ajustes actuales de Journey. Deben incluirse selectivamente en el punto de restauración si representan V1 final.

## Referencias

La interpretación final está en los documentos hermanos; estas copias son evidencia histórica y no sustituyen el código.
