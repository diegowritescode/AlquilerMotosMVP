-- =============================================================================
-- Moto Rental — Esquema inicial (Fase 1 MVP)
-- PostgreSQL / Supabase
-- =============================================================================
-- Convenciones:
--   * UUID como primary key (gen_random_uuid()).
--   * created_at / updated_at en todas las tablas; deleted_at donde aplica
--     (eliminación lógica, whitepaper §16.2).
--   * Estados con CHECK constraints (equivalentes a los enums en src/lib/types.ts).
--   * Dinero en COP como BIGINT (sin decimales).
-- =============================================================================

create extension if not exists "pgcrypto";

-- Trigger function para mantener updated_at -----------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- -----------------------------------------------------------------------------
-- profiles (perfil de usuario, ligado a auth.users de Supabase)
-- -----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  role text not null default 'admin' check (role in ('admin', 'customer')),
  status text not null default 'activo' check (status in ('activo', 'inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_profiles_updated before update on profiles
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- motorcycles
-- -----------------------------------------------------------------------------
create table if not exists motorcycles (
  id uuid primary key default gen_random_uuid(),
  brand text not null,
  model text not null,
  cc integer not null,
  year integer not null,
  plate text not null,
  color text not null,
  mileage integer not null default 0,
  daily_price bigint not null default 0,
  weekly_price bigint not null default 0,
  monthly_price bigint not null default 0,
  general_condition text not null default 'bueno' check (general_condition in ('bueno','regular','malo')),
  engine_condition text not null default 'bueno' check (engine_condition in ('bueno','regular','malo')),
  tires_condition text not null default 'bueno' check (tires_condition in ('bueno','regular','malo')),
  current_status text not null default 'disponible' check (current_status in ('disponible','alquilada','mantenimiento','inactiva')),
  notes text,
  soat_expiration date,
  tecnomecanica_expiration date,
  tax_expiration date,
  next_oil_change_date date,
  next_oil_change_mileage integer,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index if not exists idx_motorcycles_plate on motorcycles (plate) where deleted_at is null;
create index if not exists idx_motorcycles_status on motorcycles (current_status);
create index if not exists idx_motorcycles_soat on motorcycles (soat_expiration);
create index if not exists idx_motorcycles_tecno on motorcycles (tecnomecanica_expiration);
create trigger trg_motorcycles_updated before update on motorcycles
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- motorcycle_photos (galería; estructura preparada para Supabase Storage)
-- -----------------------------------------------------------------------------
create table if not exists motorcycle_photos (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references motorcycles(id) on delete cascade,
  file_url text not null,
  photo_type text,
  created_at timestamptz not null default now()
);
create index if not exists idx_motorcycle_photos_moto on motorcycle_photos (motorcycle_id);

-- -----------------------------------------------------------------------------
-- motorcycle_documents (SOAT, tecnomecánica, impuestos con archivo adjunto)
-- -----------------------------------------------------------------------------
create table if not exists motorcycle_documents (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references motorcycles(id) on delete cascade,
  type text not null check (type in ('soat','tecnomecanica','impuestos')),
  expiration_date date,
  file_url text,
  status text default 'vigente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_motorcycle_documents_moto on motorcycle_documents (motorcycle_id);
create index if not exists idx_motorcycle_documents_exp on motorcycle_documents (expiration_date);
create trigger trg_motorcycle_documents_updated before update on motorcycle_documents
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- customers
-- -----------------------------------------------------------------------------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  document_type text not null default 'CC' check (document_type in ('CC','CE','PEP','PPT','PASAPORTE')),
  document_number text not null,
  nationality text not null default 'Colombiana',
  birth_date date,
  phone text not null,
  address text,
  license_number text,
  license_category text check (license_category in ('A1','A2','B1','C1','OTRA')),
  references_info text,
  notes text,
  license_photo_url text,
  front_photo_url text,
  status text not null default 'activo' check (status in ('activo','inactivo')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index if not exists idx_customers_document on customers (document_number) where deleted_at is null;
create index if not exists idx_customers_phone on customers (phone);
create trigger trg_customers_updated before update on customers
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- customer_documents
-- -----------------------------------------------------------------------------
create table if not exists customer_documents (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete cascade,
  type text not null,
  file_url text,
  expiration_date date,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_customer_documents_customer on customer_documents (customer_id);

-- -----------------------------------------------------------------------------
-- rentals
-- -----------------------------------------------------------------------------
create table if not exists rentals (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  motorcycle_id uuid not null references motorcycles(id),
  start_date date not null,
  end_date date,
  agreed_value bigint not null default 0,
  payment_frequency text not null default 'semanal' check (payment_frequency in ('diario','semanal','mensual')),
  payment_day text,
  status text not null default 'activo' check (status in ('pendiente_aprobacion','activo','finalizado','cancelado','vencido')),
  terms_accepted_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_rentals_status on rentals (status);
create index if not exists idx_rentals_customer on rentals (customer_id);
create index if not exists idx_rentals_motorcycle on rentals (motorcycle_id);
-- Solo un alquiler activo por moto (regla de negocio §5.6):
create unique index if not exists idx_rentals_one_active
  on rentals (motorcycle_id) where status = 'activo' and deleted_at is null;
create trigger trg_rentals_updated before update on rentals
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- payments
-- -----------------------------------------------------------------------------
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  rental_id uuid references rentals(id) on delete set null,
  customer_id uuid not null references customers(id),
  amount bigint not null default 0,
  method text not null default 'efectivo' check (method in ('efectivo','transferencia','nequi','bancolombia','otro')),
  status text not null default 'pendiente' check (status in ('pendiente','parcial','pagado','vencido','en_acuerdo')),
  due_date date,
  paid_at date,
  reference text,
  evidence_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_payments_status on payments (status);
create index if not exists idx_payments_due on payments (due_date);
create index if not exists idx_payments_customer on payments (customer_id);
create index if not exists idx_payments_rental on payments (rental_id);
create trigger trg_payments_updated before update on payments
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- payment_agreements (acuerdos de pago / mora)
-- -----------------------------------------------------------------------------
create table if not exists payment_agreements (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid references payments(id) on delete cascade,
  customer_id uuid not null references customers(id),
  commitment_date date not null,
  amount_due bigint not null default 0,
  status text not null default 'pendiente',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_payment_agreements_customer on payment_agreements (customer_id);
create trigger trg_payment_agreements_updated before update on payment_agreements
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- maintenance_records (incluye cambios de aceite vía type = 'cambio_aceite')
-- -----------------------------------------------------------------------------
create table if not exists maintenance_records (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references motorcycles(id) on delete cascade,
  type text not null check (type in ('cambio_aceite','revision_general','frenos','llantas','motor','otro')),
  date date not null,
  mileage integer,
  cost bigint,
  next_date date,
  next_mileage integer,
  status text not null default 'programado' check (status in ('programado','realizado','vencido')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_maintenance_moto on maintenance_records (motorcycle_id);
create index if not exists idx_maintenance_next on maintenance_records (next_date);
create index if not exists idx_maintenance_status on maintenance_records (status);
create trigger trg_maintenance_updated before update on maintenance_records
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- fines (fotomultas / infracciones manuales)
-- -----------------------------------------------------------------------------
create table if not exists fines (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references motorcycles(id) on delete cascade,
  customer_id uuid references customers(id),
  rental_id uuid references rentals(id) on delete set null,
  date date not null,
  amount bigint not null default 0,
  reason text not null,
  location_text text,
  lat double precision,
  lng double precision,
  status text not null default 'pendiente' check (status in ('pendiente','pagada','en_disputa','asumida_cliente','asumida_dueno')),
  evidence_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_fines_moto on fines (motorcycle_id);
create index if not exists idx_fines_customer on fines (customer_id);
create index if not exists idx_fines_status on fines (status);
create trigger trg_fines_updated before update on fines
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- incidents (opcional: choques, daños, etc.)
-- -----------------------------------------------------------------------------
create table if not exists incidents (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references motorcycles(id) on delete cascade,
  customer_id uuid references customers(id),
  rental_id uuid references rentals(id) on delete set null,
  date date not null,
  description text not null,
  evidence_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_incidents_moto on incidents (motorcycle_id);
create trigger trg_incidents_updated before update on incidents
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- audit_logs (trazabilidad de acciones críticas §16.3)
-- -----------------------------------------------------------------------------
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_label text,
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_entity on audit_logs (entity_type, entity_id);
create index if not exists idx_audit_created on audit_logs (created_at desc);
