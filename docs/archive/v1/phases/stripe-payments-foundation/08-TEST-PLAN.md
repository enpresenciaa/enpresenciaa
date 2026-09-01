# Plan de pruebas

## Estáticas/app

TypeScript, ESLint dirigido, diff-check, secretos, URL HTTPS, respuesta inválida, cancelación, doble tap, flag apagada, retorno e invalidación.

## Checkout Function

POST/OPTIONS, método incorrecto, auth ausente/inválida/válida, secretos faltantes, Customer nuevo/reutilizado, sesión, mismo attempt, error sanitizado y rechazo de configuración aportada por cliente.

## Webhook

Firma ausente/inválida/válida, evento soportado/ignorado/duplicado/fallido/reintentado/fuera de orden y logs sin secretos.

## Base de datos

Migración limpia, constraints, IDs duplicados, estados inválidos, anon, A/B, cliente sin escritura, claim atómico y sincronización ordenada.

## Manual E2E

Aprobada, rechazada, 3DS, cancelada, red, taps, webhook tardío/duplicado, app abierta/fría, reapertura, logout/cambio de usuario, Android e iOS disponible.

No confundir prueba estática con E2E.
