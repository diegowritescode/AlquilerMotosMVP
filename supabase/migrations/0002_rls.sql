-- =============================================================================
-- Moto Rental — Row Level Security (Fase 1 MVP)
-- =============================================================================
-- Modelo de roles (whitepaper §11):
--   * admin  -> acceso total a la operación.
--   * customer (Fase 2) -> solo su propia información.
--
-- En Fase 1 el único usuario es el dueño (admin). Estas políticas habilitan
-- RLS y permiten acceso completo a usuarios autenticados con rol 'admin'
-- (definido en profiles.role). Ajusta según tu flujo de autenticación.
--
-- NOTA: Si gestionas todo desde el servidor con la service_role key, RLS se
-- omite para ese cliente. Para acceso desde el navegador con la anon key,
-- estas políticas son las que aplican.
-- =============================================================================

-- Helper: ¿el usuario actual es admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  );
$$ language sql security definer stable;

-- Activar RLS en todas las tablas operativas ----------------------------------
alter table profiles               enable row level security;
alter table motorcycles            enable row level security;
alter table motorcycle_photos      enable row level security;
alter table motorcycle_documents   enable row level security;
alter table customers              enable row level security;
alter table customer_documents     enable row level security;
alter table rentals                enable row level security;
alter table payments               enable row level security;
alter table payment_agreements     enable row level security;
alter table maintenance_records    enable row level security;
alter table fines                  enable row level security;
alter table incidents              enable row level security;
alter table audit_logs             enable row level security;

-- profiles: cada usuario ve/edita su propio perfil; admin ve todos -----------
create policy "profiles_self_select" on profiles
  for select using (auth.uid() = id or is_admin());
create policy "profiles_self_update" on profiles
  for update using (auth.uid() = id);

-- Política de acceso total para admin en tablas operativas --------------------
do $$
declare
  t text;
  tables text[] := array[
    'motorcycles','motorcycle_photos','motorcycle_documents',
    'customers','customer_documents','rentals','payments',
    'payment_agreements','maintenance_records','fines','incidents','audit_logs'
  ];
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
-- Storage buckets (crear en el panel de Supabase o vía API):
--   motorcycle-photos, customer-documents, payment-evidence, fine-evidence
-- Todos PRIVADOS. Usar URLs firmadas para el acceso (whitepaper §16.2).
-- Política sugerida por bucket: solo admin puede leer/escribir.
-- =============================================================================
