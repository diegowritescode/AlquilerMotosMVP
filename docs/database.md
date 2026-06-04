# Modelo de datos y migración a Supabase

## Tablas

| Tabla | Propósito |
| --- | --- |
| `profiles` | Perfil de usuario ligado a `auth.users` (rol admin/customer). |
| `motorcycles` | Flota. Incluye estado, tarifas y fechas de vencimiento. |
| `motorcycle_photos` | Galería de fotos (Storage). |
| `motorcycle_documents` | SOAT/tecnomecánica/impuestos con archivo. |
| `customers` | Arrendatarios. |
| `customer_documents` | Documentos/licencia del cliente. |
| `rentals` | Alquileres (cliente ↔ moto). |
| `payments` | Pagos manuales. |
| `payment_agreements` | Acuerdos de pago / mora. |
| `maintenance_records` | Mantenimientos (incl. cambio de aceite). |
| `fines` | Fotomultas / infracciones manuales. |
| `incidents` | Incidentes (choques, daños). |
| `audit_logs` | Trazabilidad de acciones críticas. |

Detalle de columnas, índices y constraints: [`../supabase/migrations/0001_init.sql`](../supabase/migrations/0001_init.sql).

## Convenciones

- PK `uuid` (`gen_random_uuid()`).
- `created_at` / `updated_at` (trigger `set_updated_at`) en todas; `deleted_at`
  donde hay borrado lógico.
- Dinero en **COP** como `bigint` (sin decimales).
- Estados con `CHECK` (espejo de los enums en `src/lib/types.ts`).

## Índices destacados

- `motorcycles.plate` (único, parcial sobre no eliminados), `current_status`,
  `soat_expiration`, `tecnomecanica_expiration`.
- `customers.document_number` (único parcial), `phone`.
- `rentals.status`, `customer_id`, `motorcycle_id` + **único parcial** que
  garantiza un solo alquiler `activo` por moto.
- `payments.status`, `due_date`, `customer_id`, `rental_id`.
- `maintenance_records.next_date`, `status`.
- `audit_logs (entity_type, entity_id)`, `created_at`.

## RLS

`0002_rls.sql` habilita RLS y crea política de acceso total para `is_admin()`.
`0003_auth_profile.sql` crea el perfil automáticamente al registrar un usuario
en Auth. Ajusta cuando agregues el rol `customer` (Fase 2).

## La integración con Supabase YA está implementada

La capa `src/lib/data/*` ahora consulta Supabase cuando hay credenciales y cae
a la demo en memoria cuando no. El selector vive en
[`src/lib/data/db.ts`](../../src/lib/data/db.ts):

```
getDataClient():
  1) Cliente service-role (server)  ← si SUPABASE_SERVICE_ROLE_KEY está definida
  2) Cliente con cookie + RLS        ← si solo hay URL + ANON_KEY
  3) null  → almacén en memoria (demo)
```

**Por qué service-role en Fase 1:** todas las lecturas/escrituras ocurren en el
servidor (Server Components + Server Actions) para un único dueño/admin. Usar la
service-role key del lado del servidor hace el acceso robusto e independiente de
la configuración de perfiles/RLS por usuario. RLS **permanece activo** para
bloquear cualquier acceso directo con la anon key pública. La key nunca llega al
navegador (vive en `SUPABASE_SERVICE_ROLE_KEY`, sin prefijo `NEXT_PUBLIC_`).

Repositorios migrados (Supabase + fallback demo): `motorcycles`, `customers`,
`rentals`, `payments`, `maintenance_records`, `fines`, `audit_logs`,
`motorcycle_documents`. `analytics.ts` (dashboard, reportes, vencimientos) lee a
través de esos repos, así que sirve a ambos modos sin código duplicado.

## Puesta en marcha en Supabase (paso a paso)

1. **Crear proyecto** en [supabase.com](https://supabase.com) → New project.
2. **Ejecutar migraciones** en el SQL Editor, en orden:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/migrations/0003_auth_profile.sql`
   > Las migraciones son DDL y deben correrse desde el SQL Editor o la Supabase
   > CLI. Las API keys (anon/service) **no** ejecutan DDL.
3. **Cargar seed** (opcional, datos ficticios): pega `supabase/seed.sql` en el
   SQL Editor.
4. **Crear usuario admin** (Authentication → Users → Add user):
   - Email + contraseña. En *User metadata* puedes poner
     `{ "role": "admin", "full_name": "Propietario" }`.
   - Si no usaste metadata, promuévelo:
     ```sql
     update public.profiles set role = 'admin' where email = 'tu-correo@dominio.co';
     ```
5. **Crear buckets de Storage** (Storage → New bucket), todos **privados**:
   `motorcycle-photos`, `customer-documents`, `payment-evidence`,
   `fine-evidence`.
6. **Configurar variables** en `.env.local` (local) y en Vercel (producción):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`.
   > Las variables `NEXT_PUBLIC_*` se "inyectan" en tiempo de build: deben estar
   > presentes **antes** de `npm run build` (en Vercel es automático).

## Cómo verificar que la app usa Supabase (y no memoria)

- En la app, ve a **Configuración**: muestra "Supabase: Configurado".
- Crea/edita un registro (ej. una moto) y míralo aparecer en Supabase →
  **Table editor**. Si reinicias el servidor y el dato persiste, es Supabase
  (la demo se reinicia con el proceso).
- Si ves el error `Could not find the table 'public.<tabla>'`, faltan las
  migraciones (paso 2) o el *schema cache* de PostgREST está desactualizado:
  ejecuta `NOTIFY pgrst, 'reload schema';` en el SQL Editor.

## Migrar al camino "anon + RLS" (alternativa)

Si prefieres no usar service-role, basta con definir solo `NEXT_PUBLIC_*`
(sin `SUPABASE_SERVICE_ROLE_KEY`). Entonces el data layer usa el cliente con
cookie y **depende de RLS**: el usuario debe tener un perfil con `role='admin'`
(ver paso 4) para que `is_admin()` permita las operaciones.
