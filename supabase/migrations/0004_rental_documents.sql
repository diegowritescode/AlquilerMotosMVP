-- =============================================================================
-- Moto Rental — Evidencia y actas de alquiler (Fase 2A.3)
-- =============================================================================
-- Dos tablas separadas (trade-off documentado en docs/contracts.md):
--   * rental_evidence  -> fotos/soportes de ENTREGA y DEVOLUCIÓN (bucket rental-evidence)
--   * rental_contracts -> actas PDF generadas (bucket rental-contracts), versionadas
-- Se separan porque tienen ciclo de vida y semántica distintos (evidencia = N
-- archivos subidos por el usuario; acta = documento generado y versionado).
-- Guardamos el storage PATH (bucket-relativo); las URLs firmadas se generan al leer.
-- =============================================================================

create table if not exists rental_evidence (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references rentals(id) on delete cascade,
  type text not null default 'delivery' check (type in ('delivery','return','other')),
  file_path text not null,
  file_name text,
  mime_type text,
  size_bytes integer,
  notes text,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_rental_evidence_rental on rental_evidence (rental_id);
create index if not exists idx_rental_evidence_type on rental_evidence (type);

create table if not exists rental_contracts (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid not null references rentals(id) on delete cascade,
  file_path text not null,
  file_name text,
  version integer not null default 1,
  generated_at timestamptz not null default now(),
  generated_by uuid references auth.users(id) on delete set null,
  notes text
);
create index if not exists idx_rental_contracts_rental on rental_contracts (rental_id);

-- RLS (consistente con 0002_rls.sql). El data layer usa service-role server-side;
-- estas políticas protegen el acceso directo vía anon key.
alter table rental_evidence  enable row level security;
alter table rental_contracts enable row level security;

do $$
declare
  t text;
  tables text[] := array['rental_evidence', 'rental_contracts'];
begin
  foreach t in array tables loop
    execute format(
      'create policy "%1$s_admin_all" on %1$I
         for all using (is_admin()) with check (is_admin());',
      t
    );
  end loop;
end$$;

-- =============================================================================
-- Storage buckets a crear (PRIVADOS) en Supabase → Storage:
--   rental-evidence    · rental-contracts
-- Ver docs/storage.md y docs/contracts.md.
-- =============================================================================
