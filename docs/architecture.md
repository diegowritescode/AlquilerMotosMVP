# Arquitectura

Monolito modular serverless sobre Next.js App Router (whitepaper §7). Sin
microservicios, sin Docker complejo, sin Kubernetes.

## Flujo

```
Navegador (mobile-first)
   │  Server Components (lecturas) · Server Actions (escrituras)
   ▼
Next.js App Router  ──►  Capa de datos (src/lib/data/*)
                              │
                 ┌────────────┴─────────────┐
                 ▼                            ▼
        Almacén en memoria            Supabase (producción)
        (demo, src/lib/mock)          Postgres · Auth · Storage
```

La **capa de datos** (`src/lib/data/*`) es la única que toca el almacenamiento.
Hoy lee/escribe el almacén en memoria sembrado (`src/lib/mock`). Para
producción se reimplementan esas funciones con consultas Supabase **sin tocar
la UI ni las acciones** — la firma de cada función no cambia.

## Estructura de carpetas

```
src/
  app/
    page.tsx                 # Landing pública
    login/                   # Login (Server Action + cliente)
    privacy/ terms/          # Placeholders legales
    app/                     # Área administrativa protegida
      layout.tsx             # Verifica sesión + AppShell
      dashboard/
      motorcycles/ customers/ rentals/ payments/
      maintenance/ fines/ expirations/ reports/ settings/ more/
  components/
    ui/                      # Primitivas (button, card, badge, form)
    app/                     # Compuestos (AppShell, StatCard, AlertCard, ...)
  lib/
    types.ts                 # Tipos de dominio + enums
    schemas.ts               # Validación Zod (forms/acciones)
    constants.ts             # Labels y tonos de estados
    utils.ts                 # Formato COP, fechas, helpers
    whatsapp.ts              # Deep-links wa.me
    nav.ts                   # Navegación
    auth.ts                  # Sesión (Supabase o cookie demo)
    storage.ts               # Helpers Supabase Storage
    supabase/                # Clientes (server/browser) + detección de config
    mock/                    # seed.ts (datos) + store.ts (memoria)
    data/                    # Repositorios + analytics + audit
    actions/                 # Server Actions por módulo
supabase/
  migrations/                # 0001_init.sql, 0002_rls.sql
  seed.sql
docs/
```

## Decisiones clave

- **Server Actions** para mutaciones: menos boilerplate, sin API REST manual.
- **Validación Zod** en el borde de cada acción; los errores vuelven como
  estado del formulario (`useFormState`).
- **Eliminación lógica** (`deleted_at`) en entidades críticas; no se borra.
- **Auditoría central** (`recordAudit`) invocada en crear/editar/cambiar estado
  de las entidades críticas.
- **Mobile-first**: bottom navigation en móvil, sidebar en desktop, contenido
  centrado con ancho cómodo de lectura.
