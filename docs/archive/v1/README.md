# Archivo técnico de En Presenciaa V1

- Fecha de corte: 2026-08-31
- Rama: `feature/journey-journal-foundation`
- HEAD: `c302f0e96aa46b9afb26dc4e4f1ccf0cf726068f`
- Alcance: fotografía documental del working tree actual; no inicia V2.
- Evidencia primaria: código usado, migraciones, validaciones, Git y finalmente documentación histórica.

## Resultado ejecutivo

V1 es una aplicación Expo Router con autenticación Supabase real, sesión persistida en SecureStore, perfiles y Bitácora conectados a PostgreSQL/RLS. Inicio, Camino, niveles, detalle de ejercicio y notificaciones conservan datos mock o placeholders. La fundación Stripe test existe en código, migración y dos Edge Functions remotas activas, pero no tiene retorno HTTPS, signing secret verificado ni prueba E2E; no concede entitlements.

Esta fotografía **no es reproducible desde HEAD**: depende de modificaciones y archivos no trackeados, entre ellos el fondo actual de Camino, billing, la migración Stripe, Functions y esta documentación. Los documentos históricos de fases antes ignorados se preservan en `phases/` dentro de este archivo.

## Índice

- [Estado](PROJECT_STATE_V1_FINAL.md)
- [Arquitectura](ARCHITECTURE_V1_FINAL.md)
- [Rutas y flujos](ROUTES_AND_FLOWS_V1_FINAL.md)
- [Componentes](COMPONENTS_V1_FINAL.md)
- [Lógica y servicios](LOGIC_AND_SERVICES_V1_FINAL.md)
- [Base de datos](DATABASE_V1_FINAL.md)
- [Autenticación](AUTH_V1_FINAL.md)
- [Ejercicios y progreso](EXERCISES_AND_PROGRESS_V1_FINAL.md)
- [Pagos](PAYMENTS_V1_FINAL.md)
- [Assets/UI](ASSETS_AND_UI_V1_FINAL.md)
- [Validación](VALIDATION_V1_FINAL.md)
- [Manifiesto legacy](LEGACY_MANIFEST.md)
- [Decisiones](DECISIONS_TO_PRESERVE.md)
- [Reutilización V2](V2_REUSE_MATRIX.md)
- [Entrada de migración V2](V2_MIGRATION_INPUT.md)

## Incertidumbres

No se reprodujeron flujos manuales en Android/iOS, OAuth, perfiles con dos usuarios, catálogo, Stripe firmado ni Checkout. Las consultas remotas fueron de solo lectura anónima. Los resultados reportados por el propietario se etiquetan como tales.

## Pendiente

Antes de reestructurar V2 se necesita crear un punto de restauración Git que incluya deliberadamente los archivos actuales, revisar secretos por última vez y decidir qué artefactos locales (`supabase/.temp`, Android generado, fases originales) no deben entrar al commit.
