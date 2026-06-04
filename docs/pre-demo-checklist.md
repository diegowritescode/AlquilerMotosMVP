# Checklist pre-demo

Recorre esta lista **antes** de presentar al cliente. Marca cada punto.

## Acceso y app

- [ ] **URL correcta** abre sin errores (producción/staging).
- [ ] **Login** funciona con el usuario admin real.
- [ ] **Usuario admin** existe en Supabase Auth con `role='admin'` en `profiles`.
- [ ] La app **se ve bien desde el celular** (es donde la usará el cliente).
- [ ] **Cerrar sesión** funciona y vuelve a `/login`.

## Datos demo

- [ ] **Datos demo cargados** y coherentes: re-ejecuta `supabase/seed.sql` para
      refrescar fechas/vencimientos al día de hoy.
- [ ] El **Dashboard se ve "vivo"**: motos en varios estados, pagos pendientes,
      vencimientos próximos y al menos una multa.
- [ ] **No hay datos personales reales** (solo ficticios).
- [ ] No quedan registros de prueba con prefijo **E2E** visibles
      (el teardown de las pruebas los elimina).

## Seguridad

- [ ] `ALLOW_DEMO_LOGIN` **no** está en `true` en producción (login demo desactivado).
- [ ] `SUPABASE_SERVICE_ROLE_KEY` **solo** en variables de servidor; nunca con
      prefijo `NEXT_PUBLIC_` ni en el cliente.
- [ ] Variables **E2E_\*** (incl. `E2E_SUPABASE_SERVICE_ROLE_KEY`,
      `E2E_ALLOW_DB_CLEANUP`) **no** están configuradas en producción.
- [ ] **Buckets de Storage privados** (todos): `motorcycle-photos`,
      `customer-documents`, `payment-evidence`, `fine-evidence`,
      `rental-evidence`, `rental-contracts`. Archivos solo vía **URLs firmadas**.
- [ ] Contraseña del admin **fuerte** (no `demo1234`).
- [ ] El usuario de QA (`auth-test@motorental.co` u otro de pruebas) es
      **solo para staging/QA**: elimínalo o desactívalo en el Supabase de
      producción real; no debe quedar como cuenta operativa/backdoor.
- [ ] La service-role usada por las pruebas (`E2E_SUPABASE_SERVICE_ROLE_KEY`) es
      **distinta** y no se versiona.
- [ ] El seed/demo usa **datos ficticios** (sin personas reales).

## Integraciones

- [ ] **WhatsApp** apunta al **número correcto** del negocio
      (`NEXT_PUBLIC_BUSINESS_WHATSAPP`) — pruébalo tocando el botón.
- [ ] `NEXT_PUBLIC_BUSINESS_NAME` muestra el nombre correcto.

## Calidad

- [ ] `npm run lint` ✅
- [ ] `npm run typecheck` ✅
- [ ] `npm run build` ✅
- [ ] `npm run test:unit` ✅
- [ ] `npm run test:e2e` ✅ (si el entorno de pruebas está disponible)

## Logística de la demo

- [ ] Internet estable / datos del celular como respaldo.
- [ ] Guion a la mano (`docs/demo-script.md`).
- [ ] Pantalla del teléfono lista para proyectar/compartir (si aplica).
- [ ] Plan B: si falla la red, abrir en **modo demo** local (sin Supabase).
