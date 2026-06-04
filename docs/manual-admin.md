# Manual del administrador

Guía rápida para el dueño del negocio. Todo funciona desde el celular.

## Ingreso

1. Abre la app y toca **Ingresar**.
2. En modo demo usa `admin@motorental.co` / `demo1234`.
   En producción usa el correo y contraseña creados en Supabase Auth.

## Navegación

- **Móvil:** barra inferior con Inicio, Motos, Alquileres, Vencimientos y Más.
- **Escritorio:** menú lateral con todos los módulos.

## Tareas frecuentes

### Registrar una moto
Motos → **Agregar** → completa marca, placa, tarifas, condición y fechas de
SOAT/tecnomecánica/impuestos/aceite → **Crear moto**. Las fechas alimentan las
alertas de vencimientos.

### Registrar un arrendatario
Arrendatarios → **Agregar** → datos personales, teléfono y licencia → **Crear**.
Desde su ficha puedes escribirle por **WhatsApp** y registrar pagos.

### Crear un alquiler
Alquileres → **Nuevo** → elige cliente y moto **disponible**, fecha de inicio,
valor y frecuencia → **Crear**. Al crear un alquiler **activo**, la moto pasa a
**alquilada** automáticamente. Una moto no puede tener dos alquileres activos.

### Finalizar un alquiler
Entra al alquiler → en **Gestión** elige dejar la moto **disponible** o en
**mantenimiento** → **Finalizar**.

### Registrar un pago
Pagos → **Registrar** (o desde la ficha del cliente/alquiler). Elige monto,
método (efectivo, transferencia, Nequi, Bancolombia) y estado. Usa **Marcar
como pagado hoy** desde el detalle para saldar un pendiente.

### Vencimientos
Vencimientos muestra SOAT, tecnomecánica, impuestos, aceite, mantenimientos y
pagos agrupados en **vencidos / 7 / 15 / 30 días**. Rojo = vencido,
amarillo = próximo, verde = al día.

### Mantenimientos
Mantenimientos → **Agregar** → tipo, fecha, costo y próxima fecha/kilometraje.

### Fotomultas
Fotomultas → **Registrar**. Consulta primero la multa en SIMIT/RUNT **de forma
manual** (el sistema no lo hace automáticamente). Si dejas el arrendatario
vacío, se sugiere el responsable según el alquiler activo en esa fecha.

### Reportes
Reportes resume ingresos, pagos pendientes, utilización de la flota, multas y
clientes activos.

### Auditoría
Configuración muestra el estado del backend y las últimas acciones registradas.

## Buenas prácticas

- Mantén las fechas de documentos actualizadas para que las alertas sirvan.
- Registra cada pago en el momento para evitar mora no detectada.
- Guarda evidencia (al activar Storage en Fase 1+/2).
