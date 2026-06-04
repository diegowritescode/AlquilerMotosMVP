-- =============================================================================
-- Moto Rental — Datos semilla (demo). Personas y placas ficticias.
-- Fechas relativas a CURRENT_DATE para que las alertas tengan sentido.
-- Ejecutar DESPUÉS de 0001_init.sql. Idempotente vía ON CONFLICT.
-- =============================================================================

-- Motos -----------------------------------------------------------------------
insert into motorcycles (id, brand, model, cc, year, plate, color, mileage,
  daily_price, weekly_price, monthly_price, general_condition, engine_condition,
  tires_condition, current_status, notes, soat_expiration, tecnomecanica_expiration,
  tax_expiration, next_oil_change_date, next_oil_change_mileage)
values
  ('11111111-1111-4111-8111-000000000001','Bajaj','Boxer CT 100',100,2022,'ABC12D','Negro',28500,25000,150000,560000,'bueno','bueno','regular','alquilada','Moto de trabajo, mantenimiento al día.', current_date + 12, current_date + 15, current_date + 48, current_date + 5, 30000),
  ('11111111-1111-4111-8111-000000000002','AKT','NKD 125',125,2021,'DEF34G','Rojo',41200,27000,150000,580000,'regular','bueno','regular','alquilada',null, current_date + 40, current_date - 3, current_date + 70, current_date + 10, 43000),
  ('11111111-1111-4111-8111-000000000003','Auteco','Eco Deluxe',100,2020,'HJK56L','Azul',52300,22000,130000,500000,'regular','regular','malo','mantenimiento','En taller por cambio de llantas.', current_date + 90, current_date + 25, current_date + 120, current_date + 2, 53000),
  ('11111111-1111-4111-8111-000000000004','Honda','Dream Neo',110,2023,'MNO78P','Gris',15800,30000,170000,640000,'bueno','bueno','bueno','disponible',null, current_date + 200, current_date + 210, current_date + 180, current_date + 35, 18000),
  ('11111111-1111-4111-8111-000000000005','Yamaha','Libero 125',125,2019,'UVW12X','Negro',63400,24000,140000,520000,'regular','regular','regular','disponible',null, current_date - 8, current_date + 6, current_date + 90, current_date + 17, 65000)
on conflict (id) do nothing;

-- Clientes --------------------------------------------------------------------
insert into customers (id, full_name, document_type, document_number, nationality,
  birth_date, phone, address, license_number, license_category, references_info, notes, status)
values
  ('22222222-2222-4222-8222-000000000001','Juan David Ramírez','CC','1234567890','Colombiana','1995-04-12','3105551234','Cra 50 # 10-25, Medellín','1234567890','A2','Trabaja en domicilios (Rappi).',null,'activo'),
  ('22222222-2222-4222-8222-000000000002','María Fernanda Gómez','CC','1098765432','Colombiana','1990-09-30','3127778899','Calle 30 # 65-12, Medellín','1098765432','A2',null,null,'activo'),
  ('22222222-2222-4222-8222-000000000003','Carlos Andrés Yepes','CC','71234567','Colombiana','1988-01-22','3145550011','Av. Las Vegas # 48-10, Envigado','71234567','A2','Mensajería empresarial.','Cliente recurrente.','activo'),
  ('22222222-2222-4222-8222-000000000004','Laura Restrepo Mejía','CE','E0456789','Venezolana','1998-07-05','3169990022','Carrera 70 # 44-30, Medellín',null,null,null,'Documentación de licencia pendiente.','activo')
on conflict (id) do nothing;

-- Alquileres ------------------------------------------------------------------
insert into rentals (id, customer_id, motorcycle_id, start_date, end_date,
  agreed_value, payment_frequency, payment_day, status, terms_accepted_at, notes)
values
  ('33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000001','11111111-1111-4111-8111-000000000001', current_date - 20, null, 150000,'semanal','lunes','activo', now() - interval '20 days','Pago semanal cada lunes.'),
  ('33333333-3333-4333-8333-000000000002','22222222-2222-4222-8222-000000000003','11111111-1111-4111-8111-000000000002', current_date - 12, null, 150000,'semanal','viernes','activo', now() - interval '12 days', null),
  ('33333333-3333-4333-8333-000000000003','22222222-2222-4222-8222-000000000002','11111111-1111-4111-8111-000000000004', current_date - 60, current_date - 5, 170000,'semanal','lunes','finalizado', now() - interval '60 days','Alquiler finalizado, moto devuelta en buen estado.')
on conflict (id) do nothing;

-- Pagos -----------------------------------------------------------------------
insert into payments (id, rental_id, customer_id, amount, method, status, due_date, paid_at, reference, notes)
values
  ('44444444-4444-4444-8444-000000000001','33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000001',150000,'efectivo','pagado', current_date - 13, current_date - 13, null, null),
  ('44444444-4444-4444-8444-000000000002','33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000001',150000,'nequi','pagado', current_date - 6, current_date - 6, 'NQ-88231', null),
  ('44444444-4444-4444-8444-000000000003','33333333-3333-4333-8333-000000000001','22222222-2222-4222-8222-000000000001',150000,'efectivo','pendiente', current_date + 1, null, null,'Próximo pago semanal.'),
  ('44444444-4444-4444-8444-000000000004','33333333-3333-4333-8333-000000000002','22222222-2222-4222-8222-000000000003',150000,'transferencia','vencido', current_date - 2, null, null,'Cliente avisó que paga el fin de semana.'),
  ('44444444-4444-4444-8444-000000000005','33333333-3333-4333-8333-000000000002','22222222-2222-4222-8222-000000000003',75000,'nequi','parcial', current_date - 9, current_date - 8, 'NQ-77120','Abono parcial.'),
  ('44444444-4444-4444-8444-000000000006','33333333-3333-4333-8333-000000000003','22222222-2222-4222-8222-000000000002',170000,'bancolombia','pagado', current_date - 12, current_date - 12, 'BC-44012', null)
on conflict (id) do nothing;

-- Mantenimientos --------------------------------------------------------------
insert into maintenance_records (id, motorcycle_id, type, date, mileage, cost, next_date, next_mileage, status, notes)
values
  ('55555555-5555-4555-8555-000000000001','11111111-1111-4111-8111-000000000001','cambio_aceite', current_date - 35, 27000, 45000, current_date + 5, 30000,'programado','Aceite 20W50 mineral.'),
  ('55555555-5555-4555-8555-000000000002','11111111-1111-4111-8111-000000000003','llantas', current_date - 1, 52300, 180000, null, null,'programado','Cambio de llanta trasera.'),
  ('55555555-5555-4555-8555-000000000003','11111111-1111-4111-8111-000000000002','frenos', current_date - 50, 39000, 60000, current_date - 2, 42000,'vencido','Revisión de pastillas pendiente.'),
  ('55555555-5555-4555-8555-000000000004','11111111-1111-4111-8111-000000000004','revision_general', current_date - 30, 15000, 90000, current_date + 60, 20000,'realizado',null)
on conflict (id) do nothing;

-- Fotomultas ------------------------------------------------------------------
insert into fines (id, motorcycle_id, customer_id, rental_id, date, amount, reason, location_text, lat, lng, status, notes)
values
  ('66666666-6666-4666-8666-000000000001','11111111-1111-4111-8111-000000000001','22222222-2222-4222-8222-000000000001','33333333-3333-4333-8333-000000000001', current_date - 10, 322900,'Exceso de velocidad (fotomulta)','Cl. 30 con Cra. 65, Medellín',6.2304,-75.5906,'pendiente','Registrada manualmente tras consulta en SIMIT.'),
  ('66666666-6666-4666-8666-000000000002','11111111-1111-4111-8111-000000000002','22222222-2222-4222-8222-000000000003','33333333-3333-4333-8333-000000000002', current_date - 4, 322900,'Cruce en semáforo en rojo','Av. Las Vegas, Envigado',6.1701,-75.5908,'en_disputa',null)
on conflict (id) do nothing;
