# Moto Rental — Gestión de alquiler de motocicletas (MVP Fase 1)

Aplicación web **responsive mobile-first** para que el dueño de un negocio
pequeño de alquiler de motocicletas en Medellín controle su flota,
arrendatarios, alquileres, pagos, vencimientos, mantenimientos y fotomultas
desde el celular.

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
- ✅ **Alquileres** (`/app/rentals`): CRUD + reglas (activar cambia moto a "alquilada", evitar dos activos, finalizar elige estado de la moto).
- ✅ **Pagos manuales** (`/app/payments`): CRUD, métodos, estados, agrupación por mes, "marcar pagado".
- ✅ **Vencimientos** (`/app/expirations`): SOAT, tecnomecánica, impuestos, aceite, mantenimiento y pagos (vencidos / 7 / 15 / 30 días).
- ✅ **Mantenimientos** (`/app/maintenance`): registro, tipos, estados, costos, próximos.
- ✅ **Fotomultas** (`/app/fines`): registro manual, sugerencia de responsable por alquiler activo, placeholder de mapa.
- ✅ **Reportes** (`/app/reports`): ingresos, pendientes, utilización, motos por estado, multas, clientes activos.
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
- `seed.sql` — datos semilla (5 motos, 4 clientes, 3 alquileres, pagos, mantenimientos, multas).

**Opción A — SQL Editor (rápida):** pega el contenido de cada archivo en orden
(`0001` → `0002` → `0003`, y luego `seed.sql`) en el SQL Editor de Supabase.

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
- **Carga de archivos:** formularios, tipos y helpers (`src/lib/storage.ts`
  navegador, `src/lib/storage-server.ts` servidor) listos; los campos `*_url`
  guardan URLs. El upload de archivos desde la UI se completa en Fase 2.
- **Pagos online:** NO incluidos (Fase 2). Solo registro manual.
- **Fotomultas:** registro **manual**. **No se automatiza SIMIT/RUNT ni se hace
  scraping** (riesgo legal/técnico, whitepaper §14.5). La consulta oficial es
  manual o vía proveedor autorizado en fases futuras.
- **Mapa de fotomultas:** placeholder con enlace a OpenStreetMap; mapa
  interactivo (Leaflet) es Fase 2.
- **Multiusuario/roles avanzados:** Fase 3.

---

## Roadmap Fase 2 (resumen)

Portal de cliente, pagos online (Wompi/Bold), contratos PDF, recordatorios por
email, mapa simple de fotomultas y exportación CSV/Excel.
Detalle en [`docs/roadmap.md`](docs/roadmap.md).

---

## Documentación

- [`docs/architecture.md`](docs/architecture.md) — arquitectura y estructura de carpetas.
- [`docs/database.md`](docs/database.md) — modelo de datos y cómo migrar a Supabase.
- [`docs/roadmap.md`](docs/roadmap.md) — fases del producto.
- [`docs/manual-admin.md`](docs/manual-admin.md) — manual del administrador.
- [`docs/whitepaper.md`](docs/whitepaper.md) — whitepaper original.
# AlquilerMotosMVP
