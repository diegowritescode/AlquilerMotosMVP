# Moto Rental — Sistema interno de control operativo (MVP Fase 1)

**Sistema interno de gestión** para que el dueño de un negocio pequeño de
alquiler de motocicletas en Medellín controle su flota, arrendatarios,
alquileres, **pagos registrados manualmente**, vencimientos, mantenimientos y
fotomultas desde el celular.

Es una herramienta **administrativa de uso interno** (la usa el dueño/operador),
**no** un portal para arrendatarios ni una plataforma de pagos en línea: el
cobro y la comunicación se gestionan por fuera y aquí queda el registro,
historial y trazabilidad. Web responsive **mobile-first**.

Construido a partir del whitepaper técnico-funcional en
[`docs/whitepaper.md`](docs/whitepaper.md).

> **Modo demo:** el proyecto arranca y es completamente navegable **sin
> credenciales**, usando un almacén de datos en memoria con datos semilla. Para
> producción se conecta a Supabase (ver más abajo).

---

## Stack

| Capa | Tecnología |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Lenguaje | TypeScript (estricto) |
| UI | Tailwind CSS (dark-first, acentos dorados) |
| Componentes | Propios, inspirados en shadcn/ui |
| Backend | Server Actions de Next.js |
| Base de datos | Supabase PostgreSQL |
| Auth | Supabase Auth (con fallback demo por cookie) |
| Storage | Supabase Storage (preparado) |
| Validación | Zod |
| Fechas | date-fns |
| Iconos | lucide-react |
| Deploy | Vercel |

---

## Módulos implementados (Fase 1)

- ✅ **Landing pública** (`/`): hero, beneficios, catálogo, cómo funciona, requisitos, FAQ, WhatsApp, enlaces legales.
- ✅ **Autenticación** (`/login`): login admin con Supabase Auth + fallback demo. Rutas `/app/*` protegidas.
- ✅ **Dashboard** (`/app/dashboard`): tarjetas de flota, ingresos, pagos pendientes, vencimientos y mantenimientos próximos.
- ✅ **Motos** (`/app/motorcycles`): CRUD completo, búsqueda, filtros, detalle con historial, eliminación lógica.
- ✅ **Arrendatarios** (`/app/customers`): CRUD, búsqueda, detalle con motos/pagos/multas, WhatsApp, estado financiero.
- ✅ **Alquileres** (`/app/rentals`): CRUD + reglas (activar cambia moto a "alquilada", evitar dos activos, finalizar elige estado de la moto), **acta PDF** generada + **evidencia de entrega/devolución**.
- ✅ **Pagos (registro interno)** (`/app/payments`): registro manual de pagos recibidos (efectivo, transferencia, Nequi, Bancolombia, otro), estados (pendiente/parcial/pagado/vencido/en acuerdo), agrupación por mes y "marcar pagado". El cobro se gestiona por fuera del sistema.
- ✅ **Vencimientos** (`/app/expirations`): SOAT, tecnomecánica, impuestos, aceite, mantenimiento y pagos (vencidos / 7 / 15 / 30 días).
- ✅ **Mantenimientos** (`/app/maintenance`): registro, tipos, estados, costos, próximos.
- ✅ **Fotomultas** (`/app/fines`): registro manual, sugerencia de responsable por alquiler activo, **mapa OpenStreetMap/Leaflet** (vista lista/mapa, selección de ubicación, filtros por moto/arrendatario/fecha).
- ✅ **Reportes** (`/app/reports`): ingresos, pendientes, utilización, motos por estado, multas, clientes activos, **exportación CSV** (motos, arrendatarios, alquileres, pagos, fotomultas, mantenimientos).
- ✅ **Configuración del negocio** (`/app/settings/business`): datos del negocio usados en el acta PDF, con fallback a env.
- ✅ **PWA instalable** (Fase 2A.5): manifest + íconos + service worker (online-first), página offline e "Instalar app". Ver [`docs/pwa.md`](docs/pwa.md).
- ✅ **Auditoría** (`/app/settings`): tabla `audit_logs` + helper central usado en las acciones críticas.
- ✅ **WhatsApp** en landing, detalle de cliente, detalle de alquiler y soporte.

---

## Variables de entorno

Copia `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Producción | URL del proyecto Supabase. Sin ella → **modo demo**. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Producción | Anon key de Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Opcional | Solo servidor (seed/jobs/bypass RLS). **Nunca exponer al cliente.** |
| `NEXT_PUBLIC_BUSINESS_WHATSAPP` | Recomendada | WhatsApp del negocio, formato `573001234567`. |
| `NEXT_PUBLIC_BUSINESS_NAME` | Opcional | Nombre del negocio (branding). |

---

## Instalar y correr localmente

```bash
npm install
npm run dev
# http://localhost:3000
```

**Credenciales demo** (sin Supabase configurado):

```
admin@motorental.co  /  demo1234
```

Scripts disponibles:

```bash
npm run dev        # desarrollo
npm run build      # build de producción
npm run start      # servir build
npm run lint       # ESLint (next lint)
npm run typecheck  # tsc --noEmit
```

---

## Modo de datos: Supabase vs demo

La integración con Supabase **está implementada**. El selector
[`src/lib/data/db.ts`](src/lib/data/db.ts) decide la fuente en cada request:

1. **Supabase (service-role)** — si está `SUPABASE_SERVICE_ROLE_KEY`. Preferido
   en Fase 1 (todo el acceso es server-side, single-admin). RLS sigue activo.
2. **Supabase (anon + RLS por sesión)** — si solo hay `NEXT_PUBLIC_*`.
3. **Demo en memoria** — si no hay credenciales. Se reinicia con el servidor.

Repos migrados: `motorcycles`, `customers`, `rentals`, `payments`,
`maintenance_records`, `fines`, `audit_logs`, `motorcycle_documents`. Dashboard,
reportes y vencimientos leen a través de esos repos.

> ⚠️ `NEXT_PUBLIC_*` se inyecta en tiempo de build: debe estar definida **antes**
> de `npm run build` (en Vercel es automático). El service-role key se lee en
> runtime y nunca llega al navegador.

## Migraciones de Supabase

Las migraciones SQL están en [`supabase/migrations`](supabase/migrations):

- `0001_init.sql` — esquema completo (tablas, índices, constraints, triggers `updated_at`).
- `0002_rls.sql` — Row Level Security + helper `is_admin()`.
- `0003_auth_profile.sql` — perfil automático al registrar usuario + promoción admin.
- `0004_rental_documents.sql` — `rental_evidence` + `rental_contracts` (Fase 2A.3).
- `0005_business_settings.sql` — `business_settings` (Fase 2A.4).
- `seed.sql` — datos semilla (5 motos, 4 clientes, 3 alquileres, pagos, mantenimientos, multas).

**Opción A — SQL Editor (rápida):** pega el contenido de cada archivo en orden
(`0001` → `0002` → `0003` → `0004` → `0005`, y luego `seed.sql`) en el SQL Editor de Supabase.

**Opción B — Supabase CLI:**

```bash
supabase db push                       # aplica migraciones
psql "$DATABASE_URL" -f supabase/seed.sql   # carga datos semilla
```

**Crear usuario admin:** Authentication → Users → Add user. Define metadata
`{ "role": "admin" }` o promueve con
`update public.profiles set role='admin' where email='...';`

**Crear buckets** (Storage → New bucket, todos **privados**): `motorcycle-photos`,
`customer-documents`, `payment-evidence`, `fine-evidence`.

Guía detallada paso a paso y cómo **verificar que la app usa Supabase** (no
memoria): [`docs/database.md`](docs/database.md).

---

## QA / Pruebas

Pruebas E2E con **Playwright** (formularios, flujos críticos, reglas de negocio,
persistencia) y unitarias con **Vitest**. Guía completa en
[`docs/qa.md`](docs/qa.md).

```bash
npx playwright install chromium   # una sola vez
npm run test:unit                 # unitarias
npm run test:e2e                  # E2E (levanta el dev server solo, puerto 3100)
npm run test:qa                   # lint + typecheck + build + e2e
```

- Sin variables `E2E_*`/Supabase, la suite corre en **modo demo** (login demo,
  datos en memoria) y omite aserciones de DB.
- Con `NEXT_PUBLIC_SUPABASE_URL` + `E2E_SUPABASE_SERVICE_ROLE_KEY`, valida
  **persistencia real** y limpia solo los registros de prueba (prefijo `E2E`).
- Cleanup protegido: nunca corre en producción ni sin `E2E_ALLOW_DB_CLEANUP=true`.

---

## Desplegar en Vercel

1. Sube el repo a GitHub.
2. Importa el proyecto en Vercel (framework detectado: Next.js).
3. Configura las variables de entorno en Vercel.
4. Deploy. Cada PR genera un preview (staging); `main` → producción.

---

## Pendientes conocidos / decisiones de MVP

- **Persistencia:** con credenciales Supabase la app persiste en Postgres; sin
  ellas usa el almacén en memoria (demo). Ver "Modo de datos" arriba.
- **Acceso a datos vía service-role (server-only):** decisión de Fase 1 para un
  único admin; RLS permanece activo para bloquear acceso directo con anon key.
  La key nunca se expone al cliente.
- **Carga de archivos:** ✅ implementada (Fase 2A.2) — fotos de motos,
  documentos de arrendatarios y evidencias de pagos/multas a **Supabase Storage**
  (buckets privados + URLs firmadas, validación tipo/tamaño). Detalle en
  [`docs/storage.md`](docs/storage.md).
- **Pagos:** registro **manual interno** del administrador. Los pagos en línea
  quedan **fuera de alcance** por decisión del cliente (el cobro se gestiona por
  fuera del sistema).
- **Fotomultas:** registro **manual**. **No se automatiza SIMIT/RUNT ni se hace
  scraping** (riesgo legal/técnico, whitepaper §14.5). La consulta oficial es
  manual o vía proveedor autorizado en fases futuras.
- **Mapa de fotomultas:** ✅ implementado (Fase 2A.1) con OpenStreetMap/Leaflet
  (vista lista/mapa, selección de ubicación, filtros). Muestra solo multas
  registradas **manualmente**; no consulta SIMIT/RUNT.
- **Sin portal de arrendatarios ni login de cliente:** decisión del cliente.
  Es un sistema de uso interno del negocio.

---

## Roadmap (resumen)

**Fase 2A — Control operativo avanzado (prioridad):** ✅ mapa de fotomultas con
OpenStreetMap/Leaflet (+ selección de ubicación y filtros) **entregado (2A.1)**;
✅ upload real de fotos/documentos/evidencias a Storage **entregado (2A.2)**;
✅ acta PDF + evidencia de entrega/devolución **entregado (2A.3)**;
✅ exportación CSV + configuración del negocio **entregado (2A.4)**; sigue:
mejoras de reportes internos.

**Fase 2B — Automatización:** recordatorios internos, notificaciones por email,
mejoras de auditoría, reportes avanzados y mapa con estadísticas por zona.

**Fuera de alcance (decisión del cliente):** portal de arrendatarios, pagos en
línea / pasarelas, login de cliente, autoservicio, app nativa, WhatsApp Business
API y consulta automática SIMIT/RUNT. Detalle en
[`docs/roadmap.md`](docs/roadmap.md).

---

## Documentación

- [`docs/manual-admin.md`](docs/manual-admin.md) — **manual de uso** (para el dueño, no técnico).
- [`docs/demo-script.md`](docs/demo-script.md) — **guion de demo** (10–15 min) para presentar al cliente.
- [`docs/mvp-delivered-scope.md`](docs/mvp-delivered-scope.md) — **alcance entregado** del MVP Fase 1.
- [`docs/pre-demo-checklist.md`](docs/pre-demo-checklist.md) — **checklist** antes de presentar.
- [`docs/storage.md`](docs/storage.md) — buckets, subida de archivos y URLs firmadas.
- [`docs/contracts.md`](docs/contracts.md) — acta PDF del alquiler y evidencia de entrega/devolución.
- [`docs/exports.md`](docs/exports.md) — exportaciones CSV (qué se exporta y qué no).
- [`docs/business-settings.md`](docs/business-settings.md) — configuración del negocio.
- [`docs/pwa.md`](docs/pwa.md) — instalar como app (PWA), offline y caché.
- [`docs/qa.md`](docs/qa.md) — estrategia y ejecución de pruebas.
- [`docs/architecture.md`](docs/architecture.md) — arquitectura y estructura de carpetas.
- [`docs/database.md`](docs/database.md) — modelo de datos y Supabase.
- [`docs/roadmap.md`](docs/roadmap.md) — fases del producto.
- [`docs/whitepaper.md`](docs/whitepaper.md) — whitepaper original.
# AlquilerMotosMVP
