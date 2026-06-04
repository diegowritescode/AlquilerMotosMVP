-- =============================================================================
-- Moto Rental — Perfil automático al registrarse + promoción de admin
-- =============================================================================
-- Crea un registro en `profiles` cuando se da de alta un usuario en Supabase
-- Auth. El rol se toma de user_metadata.role si viene; por defecto 'customer'
-- (seguro para cuando exista el portal de cliente en Fase 2).
--
-- En Fase 1 la app accede a los datos con la SERVICE ROLE key del lado del
-- servidor, por lo que NO depende de este perfil para funcionar. Este trigger
-- es necesario para:
--   * El camino alternativo "anon key + sesión + RLS" (ver docs/database.md).
--   * La función is_admin() usada por las policies de 0002_rls.sql.
-- =============================================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- -----------------------------------------------------------------------------
-- Promover al dueño a admin (ejecutar UNA vez, reemplazando el correo):
--
--   update public.profiles set role = 'admin'
--   where email = 'admin@motorental.co';
--
-- O al crear el usuario en Supabase Auth, define user_metadata:
--   { "role": "admin", "full_name": "Propietario" }
-- -----------------------------------------------------------------------------
