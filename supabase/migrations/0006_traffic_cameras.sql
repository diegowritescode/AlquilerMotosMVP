-- =============================================================================
-- Moto Rental — Cámaras de fotodetección de Medellín (traffic_cameras)
-- =============================================================================
-- Puntos oficiales autorizados de fotomultas ("Cámaras Salvavidas" / ANSV).
-- Las cámaras rotan físicamente por estos puntos; el operador puede editarlos
-- (CRUD). Las coordenadas son geocodificadas y APROXIMADAS (approximate=true).
-- Una fotomulta puede asociarse opcionalmente a una cámara (fines.camera_id).
-- =============================================================================

create table if not exists traffic_cameras (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'velocidad'
    check (type in ('velocidad','semaforo_rojo','cebra','pico_y_placa','soat_tecnomecanica','mixta')),
  lat double precision not null,
  lng double precision not null,
  zone text,
  max_speed_kmh int,
  approximate boolean not null default true,
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index if not exists idx_cameras_zone on traffic_cameras (zone);
create index if not exists idx_cameras_type on traffic_cameras (type);
create trigger trg_cameras_updated before update on traffic_cameras
  for each row execute function set_updated_at();

-- Enlace opcional fotomulta -> cámara ----------------------------------------
alter table fines
  add column if not exists camera_id uuid references traffic_cameras(id) on delete set null;
create index if not exists idx_fines_camera on fines (camera_id);

-- RLS: acceso total para admin (mismo patrón que el resto de tablas) ----------
alter table traffic_cameras enable row level security;
create policy "traffic_cameras_admin_all" on traffic_cameras
  for all using (is_admin()) with check (is_admin());

-- Seed: official Medellín photo-detection points (approximate, geocoded).
insert into traffic_cameras (id, name, type, lat, lng, zone, max_speed_kmh, approximate, source) values
  ('88888888-8888-4888-8888-000000000001', 'Avenida 80 con Calle 2A', 'velocidad', 6.210186, -75.603533, 'Avenida 80', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000002', 'Avenida 80 con Carrera 76', 'velocidad', 6.2345, -75.602, 'Avenida 80', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000003', 'Avenida 80 con Calle 35', 'velocidad', 6.238723, -75.602996, 'Avenida 80', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000004', 'Avenida 80 con Calle 44 (San Juan)', 'velocidad', 6.2562, -75.6013, 'Avenida 80', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000005', 'Avenida 80 con Calle 48', 'velocidad', 6.256408, -75.601404, 'Avenida 80', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000006', 'Avenida 80 con Calle 65', 'velocidad', 6.279074, -75.588767, 'Avenida 80', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000007', 'Avenida 81 con Calle 73', 'velocidad', 6.279074, -75.588767, 'Avenida 80', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000008', 'Avenida 80 con Calle 12 Sur', 'velocidad', 6.211962, -75.578077, 'Avenida 80', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000009', 'Avenida del Río con Calle 77', 'velocidad', 6.287283, -75.56708, 'Autopista Norte / Río', 80, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000010', 'Autopista Norte con Calle 95', 'velocidad', 6.301173, -75.556653, 'Autopista Norte / Río', 80, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000011', 'Autopista Norte con Calle 103M', 'velocidad', 6.278649, -75.57109, 'Autopista Norte / Río', 80, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000012', 'Carrera 64C con Calle 97A', 'velocidad', 6.270296, -75.572714, 'Autopista Norte / Río', 80, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000013', 'Avenida Regional con Calle 57', 'velocidad', 6.257631, -75.573456, 'Autopista Norte / Río', 80, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000014', 'Avenida Regional con Calle 18', 'velocidad', 6.243673, -75.575332, 'Autopista Norte / Río', 80, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000015', 'Autopista Sur con Calle 44A (San Juan)', 'velocidad', 6.253019, -75.583306, 'Autopista Sur', 80, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000016', 'Autopista Sur con Calle 32', 'velocidad', 6.243673, -75.575332, 'Autopista Sur', 80, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000017', 'Autopista Sur con Calle 4 Sur', 'velocidad', 6.211962, -75.578077, 'Autopista Sur', 80, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000018', 'Carrera 52 con Calle 2 Sur (Guayabal)', 'velocidad', 6.206137, -75.587896, 'Autopista Sur', 60, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000019', 'Carrera 65 con Calle 72', 'velocidad', 6.269732, -75.60256, 'Carrera 65', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000020', 'Carrera 65 con Calle 59A', 'velocidad', 6.262958, -75.57717, 'Carrera 65', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000021', 'Carrera 65 con Calle 32D', 'velocidad', 6.235426, -75.579848, 'Carrera 65', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000022', 'Carrera 65 con Calle 8B', 'velocidad', 6.21331, -75.584842, 'Carrera 65', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000023', 'Avenida Las Vegas (Cra 48) con Calle 10 Sur', 'velocidad', 6.200202, -75.578485, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000024', 'Avenida Las Vegas (Cra 48) con Calle 4 Sur', 'velocidad', 6.214267, -75.576787, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000025', 'Avenida Las Vegas (Cra 48) con Calle 9', 'velocidad', 6.211661, -75.574845, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000026', 'Avenida Las Vegas (Cra 48) con Calle 16A Sur', 'velocidad', 6.1575, -75.601, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000027', 'Avenida El Poblado (Cra 43A) con Calle 9', 'velocidad', 6.190399, -75.578917, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000028', 'Avenida El Poblado (Cra 43A) con Calle 16A Sur', 'velocidad', 6.186978, -75.573802, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000029', 'Carrera 32 con Calle 5 Sur', 'velocidad', 6.20062, -75.563683, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000030', 'Carrera 25 con Calle 9A Sur', 'velocidad', 6.194208, -75.572469, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000031', 'Avenida Guayabal con Calle 6 Sur', 'velocidad', 6.206137, -75.587896, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000032', 'Avenida Guayabal con Calle 20', 'velocidad', 6.207303, -75.586451, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000033', 'Avenida Guayabal con Calle 14 Sur', 'velocidad', 6.206137, -75.587896, 'Corredor Sur', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000034', 'Avenida Industriales con Calle 29', 'velocidad', 6.230205, -75.574406, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000035', 'Calle 30 con Carrera 66B', 'velocidad', 6.23253, -75.603879, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000036', 'Calle 33 con Carrera 76', 'velocidad', 6.242, -75.595833, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000037', 'Calle 44 (San Juan) con Carrera 52', 'velocidad', 6.245391, -75.573424, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000038', 'Calle 44 (San Juan) con Carrera 53', 'velocidad', 6.245391, -75.573424, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000039', 'Calle 44 (San Juan) con Carrera 70', 'velocidad', 6.256827, -75.590147, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000040', 'Calle 50 (Colombia) con Carrera 65', 'velocidad', 6.222248, -75.574545, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000041', 'Calle 50 (Colombia) con Carrera 55', 'velocidad', 6.257631, -75.573456, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000042', 'Calle 55 con Carrera 67B', 'velocidad', 6.257775, -75.580938, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000043', 'Calle 10 con Carrera 43D', 'velocidad', 6.20062, -75.563683, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000044', 'Calle 10 con Carrera 48', 'velocidad', 6.211962, -75.578077, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000045', 'Carrera 70 con Calle 25', 'velocidad', 6.232, -75.6015, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000046', 'Calle 37 con Carrera 51', 'velocidad', 6.235159, -75.568904, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000047', 'Calle 38 con Carrera 52', 'velocidad', 6.235159, -75.568904, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000048', 'Carrera 46 con Calle 41', 'velocidad', 6.247, -75.5665, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000049', 'Carrera 46 con Calle 57', 'velocidad', 6.257743, -75.563728, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000050', 'Calle 67 con Carrera 45 (Av. Barranquilla)', 'velocidad', 6.26798, -75.568759, 'Centro y conectoras', 50, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000051', 'Avenida Las Palmas (sector Chuscalito)', 'velocidad', 6.215632, -75.55254, 'Las Palmas', 60, true, 'Alcaldía de Medellín / ANSV'),
  ('88888888-8888-4888-8888-000000000052', 'Avenida Las Palmas (sector Dulce Jesús Mío)', 'velocidad', 6.223052, -75.565318, 'Las Palmas', 60, true, 'Alcaldía de Medellín / ANSV')
on conflict (id) do nothing;
