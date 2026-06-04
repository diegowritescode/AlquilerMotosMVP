# QA automatizado — Moto Rental (Fase 1)

Pruebas E2E con **Playwright** (flujos, formularios, Server Actions, reglas de
negocio y persistencia) + unitarias pequeñas con **Vitest** (utils, WhatsApp,
schemas Zod).

## Cómo correr

```bash
# Unitarias (rápidas, sin servidor)
npm run test:unit

# E2E (Playwright levanta el dev server automáticamente)
npm run test:e2e            # headless
npm run test:e2e:headed     # con navegador visible
npm run test:e2e:ui         # modo UI interactivo

# Todo el pipeline de calidad
npm run test:qa             # lint + typecheck + build + e2e
```

> Primera vez: `npx playwright install chromium`.

## Dos modos de ejecución

La suite se adapta al entorno:

| Modo | Cuándo | Qué valida |
| --- | --- | --- |
| **Demo** | sin variables `E2E_*`/Supabase | formularios, validaciones, navegación, reglas de negocio (datos en memoria) |
| **Supabase** | con `NEXT_PUBLIC_SUPABASE_URL` + `E2E_SUPABASE_SERVICE_ROLE_KEY` | lo anterior **+** persistencia real y limpieza |

Las pruebas que dependen de DB usan `testInfo.skip()` automáticamente cuando no
hay acceso a Supabase, así que la suite pasa en ambos modos.

## Variables necesarias

Definir en `.env.local` (no se versiona):

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `E2E_BASE_URL` | no | URL del server de pruebas. Default `http://localhost:3100`. |
| `E2E_ADMIN_EMAIL` | E2E real | Correo del admin de pruebas (default demo). |
| `E2E_ADMIN_PASSWORD` | E2E real | Contraseña del admin de pruebas (default `demo1234`). |
| `E2E_ALLOW_DB_CLEANUP` | cleanup | Debe ser `"true"` para permitir el borrado de registros E2E. |
| `E2E_SUPABASE_SERVICE_ROLE_KEY` | DB asserts/cleanup | Service-role **separada** solo para pruebas. |
| `E2E_TEST_PREFIX` | no | Prefijo de datos de prueba. Default `E2E`. |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | E2E real | Las mismas de la app; el dev server las usa. |

> El puerto por defecto es **3100** para no chocar con otra app en 3000.

## Crear un usuario admin de prueba

1. Supabase → Authentication → Users → **Add user** (email + contraseña).
2. Define metadata `{ "role": "admin" }` o promueve:
   `update public.profiles set role='admin' where email='...';`
3. Pon ese correo/clave en `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD`.

> En modo demo el login usa `admin@motorental.co` / `demo1234` (valores por
> defecto de la suite), sin tocar Supabase.

## Protección de producción (cleanup seguro)

El teardown (`tests/e2e/global-teardown.ts` → `helpers/cleanup.ts`) borra
**solo** filas con prefijo `E2E` y sus dependientes. Guardas duras:

- ❌ Aborta si `NODE_ENV=production`.
- ❌ Aborta si `VERCEL_ENV=production`.
- ❌ No corre si `E2E_ALLOW_DB_CLEANUP !== "true"`.
- ❌ No corre sin `E2E_SUPABASE_SERVICE_ROLE_KEY` (en demo no hay nada que borrar).
- ✅ Nunca hace `TRUNCATE` ni toca el seed general.

Cada registro de prueba se crea con prefijo único (`E2E …`, placas `E2E…`,
documentos `E2E…`) — ver `tests/e2e/helpers/test-data.ts`.

## Qué cubren las pruebas

**E2E (`tests/e2e`)**

- `landing.spec` — hero, secciones, CTA WhatsApp, /privacy y /terms.
- `auth.spec` — redirección sin sesión, login válido, demo deshabilitado en
  modo Supabase, logout.
- `dashboard.spec` — tarjetas principales y ausencia de overlay de error.
- `motorcycles.spec` — listar, crear, validar (marca requerida, km negativo,
  año no razonable), editar + persistencia, aserción en Supabase.
- `customers.spec` — listar, crear, WhatsApp, búsqueda, editar + persistencia,
  validación de nombre, aserción en Supabase.
- `rentals.spec` (crítico) — crear activo → moto `alquilada`; impedir doble
  activo; finalizar → moto `disponible`/`mantenimiento`.
- `payments.spec` — crear pago asociado a alquiler/cliente, listado, filtro por
  estado, validaciones (monto requerido/no negativo, arrendatario requerido).
- `maintenance.spec` — crear, listado, historial en detalle de moto, aparición
  en vencimientos.
- `fines.spec` — registro manual + **sugerencia de responsable** por alquiler
  activo, listado, detalle de moto.
- `expirations-reports.spec` — carga de vencimientos y reportes sin errores.
- `audit.spec` — crear moto genera audit log; pantalla de auditoría carga.

**Unitarias (`tests/unit`)** — `formatCOP`, `formatDate`, `calcAge`,
`daysUntil`, `normalizePhone`, `whatsappLink`, y schemas Zod de motos, clientes,
alquileres y pagos.

## Qué NO cubren todavía

- Upload real de archivos a Storage (los campos `*_url` guardan URLs; Fase 2).
- Pagos online / pasarelas (fuera de alcance).
- Consulta SIMIT/RUNT (registro de multas es 100% manual).
- Portal de cliente / multiusuario (Fase 2/3).
- Pruebas de carga/rendimiento y accesibilidad exhaustiva.

## Estrategia de cleanup (resumen)

1. Tests crean datos con prefijo `E2E`.
2. Al final, el teardown busca motos/clientes con ese prefijo y borra en orden
   FK-seguro: `fines → payments → maintenance_records → rentals → customers →
   motorcycles → audit_logs`.
3. El seed general nunca se toca.

## Auditoría: qué se audita

`recordAudit()` se invoca en las Server Actions críticas: crear/editar/cambiar
estado de **motos**, crear/editar **clientes**, crear/actualizar/finalizar/
cambiar estado de **alquileres**, registrar/editar/marcar pagado **pagos**,
registrar/editar **multas** y **mantenimientos**. La pantalla
`/app/settings` muestra las últimas acciones. **Pendiente:** auditar
eliminación lógica en todos los módulos de forma uniforme y exponer un visor de
auditoría con filtros.

## Problemas conocidos / notas

- **Diseño de pagos:** el alquiler es **opcional** (permite abonos sueltos). El
  prompt de QA mencionaba "alquiler requerido"; se mantuvo opcional para no
  cambiar el comportamiento del producto. Las pruebas validan monto y
  arrendatario requeridos, y la asociación correcta cuando sí hay alquiler.
- **Validación nativa:** los campos `required` se bloquean en el navegador; las
  validaciones de rango/negativos las hace Zod en el servidor (Server Action),
  por eso esas pruebas verifican el mensaje "Revisa los campos marcados".
- **Puerto 3100** por defecto para evitar choques con otra app en 3000.
