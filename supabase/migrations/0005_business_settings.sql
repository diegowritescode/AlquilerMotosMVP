-- =============================================================================
-- Moto Rental — Configuración del negocio (Fase 2A.4)
-- =============================================================================
-- Sistema single-business / single-admin: un único registro. Se usa un id fijo
-- (ver getOrCreateBusinessSettings en src/lib/data/business-settings.ts).
-- Los datos alimentan el acta PDF y la información interna; hay fallback a las
-- variables de entorno (NEXT_PUBLIC_BUSINESS_*) cuando no hay registro.
-- =============================================================================

create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Moto Rental',
  owner_name text,
  owner_document text,
  phone text,
  whatsapp text,
  email text,
  city text,
  address text,
  currency text not null default 'COP',
  alert_days_before_expiration integer not null default 30,
  contract_terms_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_business_settings_updated before update on business_settings
  for each row execute function set_updated_at();

alter table business_settings enable row level security;
create policy "business_settings_admin_all" on business_settings
  for all using (is_admin()) with check (is_admin());
