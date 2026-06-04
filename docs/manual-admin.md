# Manual de uso — Moto Rental

Guía práctica para el dueño del negocio. Pensada para usarse **desde el
celular**. No necesitas conocimientos técnicos.

> Consejo: agrega la página a la pantalla de inicio de tu teléfono para abrirla
> como una app (menú del navegador → "Agregar a pantalla de inicio").

---

## 1. Iniciar sesión

1. Abre la dirección de la aplicación.
2. Toca **Ingresar**.
3. Escribe tu **correo** y **contraseña**.
4. Entrarás al **Dashboard** (centro de control).

Para salir, usa el botón **Salir** en la parte superior.

---

## 2. Crear una moto

1. En la barra inferior, toca **Motos** → botón **+ Agregar**
   (o usa la acción rápida **Nueva moto** en el Dashboard).
2. Completa marca, modelo, placa, color, cilindraje, año y kilometraje.
3. Define las **tarifas** (día / semana / mes).
4. Registra las fechas de **SOAT, tecnomecánica, impuestos y cambio de aceite**
   → con esto el sistema te avisará antes de que venzan.
5. Elige el **estado** (disponible, alquilada, mantenimiento, inactiva).
6. Toca **Crear moto**.

---

## 3. Crear un arrendatario

1. Toca **Más → Arrendatarios → + Agregar** (o acción rápida **Nuevo cliente**).
2. Completa nombre, tipo y número de documento, teléfono y dirección.
3. Agrega la **licencia** (número y categoría) si la tienes.
4. Toca **Crear cliente**.

Desde la ficha del cliente puedes **escribirle por WhatsApp** con un toque.

---

## 4. Crear un alquiler

1. Toca **Alquileres → Nuevo** (o acción rápida **Nuevo alquiler**).
2. Elige el **arrendatario** y una **moto disponible**.
3. Define **fecha de inicio**, **valor acordado** y **frecuencia** (diario,
   semanal o mensual).
4. Deja el estado en **Activo** y toca **Crear alquiler**.

> Al crear un alquiler activo, la moto pasa automáticamente a **"alquilada"**.
> Una misma moto no puede tener dos alquileres activos al tiempo.

Para **finalizar**: entra al alquiler → en *Gestión*, elige si la moto queda
**disponible** o **en mantenimiento** → **Finalizar**.

**Acta y evidencias del alquiler** (en el detalle del alquiler):

- **Acta del alquiler →** toca **Generar acta PDF**. Se crea un documento con
  los datos de la moto, el arrendatario, el alquiler y las condiciones. Luego
  puedes **Ver**, **Descargar** (se baja directo desde la app, sin entrar a
  Supabase) o **Regenerar** (crea una nueva versión). El acta usa los datos de
  *Configuración del negocio*. Es un soporte operativo; para uso legal
  definitivo, revísala con un asesor (no es firma digital).
- **Evidencia de entrega →** sube fotos de la moto al entregar, kilometraje y
  accesorios.
- **Evidencia de devolución →** sube fotos al recibir, kilometraje final y
  daños observados.

---

## 5. Registrar un pago

> El sistema **no cobra**: tú sigues cobrando como hoy (efectivo, transferencia,
> Nequi, Bancolombia). Aquí solo **registras lo recibido** para llevar el control.

1. Toca **Más → Pagos → Registrar** (o desde la ficha del cliente/alquiler).
2. Elige el arrendatario y, si aplica, el alquiler.
3. Escribe el **monto**, el **método** (efectivo, transferencia, Nequi,
   Bancolombia) y el **estado**.
4. Toca **Registrar pago**.

Para marcar como pagado un cobro pendiente: abre el pago → **Marcar como pagado
hoy**.

---

## 6. Revisar pagos pendientes

- En el **Dashboard**, la tarjeta **Pagos pendientes** muestra cuántos hay y
  cuánto suman. Tócala para ver el detalle.
- En **Pagos**, usa los filtros **Pendientes / Vencidos / Pagados**.
- Rojo = vencido (mora), Amarillo = pendiente/parcial, Verde = pagado.

---

## 7. Registrar mantenimiento

1. Toca **Más → Mantenimientos → + Agregar**.
2. Elige la moto y el **tipo** (aceite, frenos, llantas, motor, revisión).
3. Registra **fecha**, **kilometraje** y **costo**.
4. Define la **próxima fecha / próximo kilometraje** para recibir la alerta.
5. Toca **Registrar mantenimiento**.

---

## 8. Registrar una fotomulta

1. Consulta primero el comparendo en las fuentes oficiales (**SIMIT / RUNT**).
   *El sistema no consulta automáticamente; el registro es manual.*
2. Toca **Más → Fotomultas → Registrar**.
3. Elige la **moto** y la **fecha**. Si dejas el responsable vacío, el sistema
   **sugiere** al arrendatario que tenía la moto ese día.
4. Escribe el **valor**, el **motivo** y el **estado**.
5. **Ubicación (opcional):** toca el punto en el **mini mapa** para fijarlo, o
   escribe latitud/longitud. Usa **Centrar en Medellín** o **Limpiar ubicación**
   si lo necesitas. La ubicación es manual; el mapa solo sirve para visualizar.
6. Toca **Registrar multa**.

> En **Fotomultas** puedes cambiar entre **Lista** y **Mapa**. El mapa muestra
> un pin por cada multa con ubicación; al tocarlo ves moto, responsable, motivo,
> valor, estado y un enlace al detalle y a OpenStreetMap. Los filtros (moto,
> arrendatario, fechas) afectan lista y mapa.

---

## 9. Revisar vencimientos

- Toca **Vencimientos** en la barra inferior.
- Verás todo agrupado en **Vencidos**, **Próximos 7 / 15 / 30 días**:
  SOAT, tecnomecánica, impuestos, cambio de aceite, mantenimientos y pagos.
- Toca cualquier alerta para ir directo a la moto o al cliente.

---

## 10. Leer reportes

- Toca **Más → Reportes**.
- Verás **ingresos** (total / mes / semana), **pagos pendientes**,
  **utilización de la flota** (% alquilada), **motos por estado**,
  **mantenimientos** y **multas pendientes**, y **clientes activos**.

---

## 11. Adjuntar fotos y documentos

Desde la página de **detalle** de cada registro puedes subir archivos (JPG, PNG,
WEBP o PDF, hasta 5 MB):

- **Moto →** Fotos: sube una o varias fotos; aparecen en una galería.
- **Arrendatario →** Documentos: elige el tipo (licencia, documento de
  identidad, foto frontal, otro) y sube el archivo.
- **Pago →** Comprobante: adjunta el soporte del pago recibido.
- **Fotomulta →** Evidencia: adjunta la captura o el PDF del comparendo.

> Los archivos se guardan de forma **privada y segura** en la nube. Los
> documentos de los arrendatarios son datos personales: no los compartas por
> fuera del sistema.

## 12. Configurar el negocio y exportar datos

- **Configuración del negocio →** *Más → Configuración → Negocio → Editar*
  (o `/app/settings/business`). Define nombre, propietario, documento/NIT,
  contacto, ciudad, dirección y los **términos del acta**. Estos datos aparecen
  en el acta PDF.
- **Exportar a CSV →** en *Reportes*, tarjeta **Exportar información**. Descarga
  motos, arrendatarios, alquileres, pagos, fotomultas o mantenimientos en CSV
  (se abre en Excel/Sheets). Solo metadatos: no incluye fotos ni documentos.

## 13. Recomendaciones de operación diaria

- **Cada mañana:** abre el Dashboard. Revisa pagos pendientes y vencimientos.
- **Al entregar/recibir una moto:** crea o finaliza el alquiler enseguida para
  que el estado de la flota sea siempre confiable.
- **Al recibir un pago:** regístralo en el momento (evita olvidos y mora oculta).
- **Documentos:** mantén SOAT, tecnomecánica e impuestos actualizados en la
  ficha de cada moto; así las alertas te sirven.
- **WhatsApp:** úsalo desde la ficha del cliente para cobros y recordatorios.
- **Una vez por semana:** revisa Reportes para ver ingresos y mora.
