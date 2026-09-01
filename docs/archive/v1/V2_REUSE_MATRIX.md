# Matriz de reutilización para V2

- Fecha: 2026-08-31
- Rama/HEAD: `feature/journey-journal-foundation` / `c302f0e96aa46b9afb26dc4e4f1ccf0cf726068f`
- Naturaleza: recomendación preliminar; no se implementa V2.

| Dominio/pieza | Clasificación | Razón/condición |
|---|---|---|
| Supabase client | Conservar con ajustes | separar ambientes y endurecer config |
| SecureStore adapter | Conservar sin cambios | responsabilidad clara; añadir tests |
| AuthProvider | Refactorizar | preservar ciclo; simplificar callback y soportar invitado |
| OAuth Google/Facebook | Conservar con ajustes | repetir E2E; políticas/redirects |
| Apple | Pendiente de decisión | no implementado |
| Profiles | Conservar con ajustes | esquema/servicio útiles; probar RLS |
| Expo Router | Conservar sin cambios | base estable; redefinir guards/rutas |
| Tabs | Refactorizar | nueva estructura y acceso guest |
| Onboarding | Refactorizar | conservar assets/componentes selectivos; cambiar gate |
| Home | Reemplazar | lógica principal mock y racha a eliminar |
| Camino montaña | Reemplazar | requisito lineal; conservar aprendizajes/carga |
| Ejercicios UI | Reemplazar | detalle placeholder; catálogo debe ser remoto |
| SQL catálogo/contenido | Conservar con ajustes | endurecer publication/unlock/timestamps |
| Progreso/completions | Conservar con ajustes | idempotencia útil; daily rule y writes |
| Racha | Eliminar | requisito V2 explícito |
| Notificaciones invasivas | Eliminar | requisito V2; evaluar avisos Comunidad |
| Bitácora/Journal | Conservar con ajustes | query real; convertir en entitlement pago |
| Para Ti | Refactorizar | hoy placeholder; quedará bloqueado |
| Perfil/configuración | Conservar con ajustes | funcional; separar operaciones parciales |
| Stripe foundation | Conservar con ajustes | backend sólido, E2E/return/compliance pendiente |
| Entitlements | Reemplazar/crear | no existe; debe desacoplar proveedores |
| Assets | Pendiente de decisión | auditar licencia, tamaño, duplicados y diseño nuevo |
| Componentes base | Conservar con ajustes | unificar variantes, accesibilidad y Uniwind |
| Mocks | Eliminar | sirven solo como fixtures de migración/prueba |
| Migraciones | Conservar con ajustes | historia útil; crear migraciones aditivas, no reescribir aplicadas |
| TanStack Query | Conservar sin cambios | patrón correcto para remoto |
| MMKV/Zustand | Pendiente de decisión | no hay store activo; conservar solo necesidad demostrada |
| Comunidad | Reemplazar/crear | dominio inexistente en V1 |

## Riesgo de reutilización

Alto: AuthProvider, Journey, Home, exercise domain writes y Stripe E2E. Medio: Profile, Journal, tabs, onboarding y assets. Bajo: Supabase client pattern, SecureStore, QueryClient, componentes puros y decisiones de idempotencia.

Referencias: documentos de dominio y `V2_MIGRATION_INPUT.md`.
