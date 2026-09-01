# Trabajo pendiente para producción

- Resolver política de compras digitales por plataforma/storefront/región.
- Diseñar planes comerciales, impuestos, facturación, soporte, cancelación, portal y reembolsos.
- Definir entitlements independientes de billing y restauración multiplataforma.
- Separar proyectos/identidades/secretos test y live.
- Proveer dominio HTTPS, Universal Links/App Links y fallback web.
- Aplicar/revisar migraciones, desplegar Functions y registrar webhook con autorización.
- Ejecutar matriz E2E Android/iOS y observabilidad.
- Eliminar o mantener apagado el botón Stripe en builds de tienda según decisión de cumplimiento.

Nada de esta lista está implementado ni aprobado por esta fase.

## Pendiente inmediato de la fase test

El propietario decidió diferir temporalmente el puente web. Antes de ejecutar el flujo E2E se debe crear una URL HTTPS estable (un subdominio gratuito `*.pages.dev` es suficiente para test), configurar las URLs success/cancel exclusivamente como secretos de servidor y comprobar el retorno con la app abierta y fría. No se usará un dominio inventado ni un Quick Tunnel efímero.
