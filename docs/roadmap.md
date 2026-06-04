# Roadmap

> **Posicionamiento:** Moto Rental es un **sistema interno de control operativo**
> para el negocio de alquiler de motocicletas. Lo usa el dueño/operador. No es un
> portal para arrendatarios ni una plataforma de pagos en línea.

## Fase 1 — MVP operativo (entregado)

Landing pública (captación por WhatsApp), login del administrador, dashboard,
motos, arrendatarios (datos administrativos), alquileres, **pagos como registro
interno manual**, vencimientos, mantenimientos, fotomultas manuales, reportes
internos y auditoría. Mobile-first, dark theme, WhatsApp como contacto rápido.

---

## Fase 2A — Control operativo avanzado (PRIORIDAD)

Enfocada en darle más control interno al administrador.

1. ✅ **Mapa de fotomultas** con OpenStreetMap + Leaflet. *(Entregado en 2A.1)*
2. ✅ **Selección de ubicación en mapa** al registrar/editar una fotomulta
   (clic en el mapa o coordenadas manuales; sin geocoding ni GPS). *(2A.1)*
3. ✅ **Filtros** por estado, moto, arrendatario y rango de fechas que afectan
   lista y mapa. *(2A.1)*
4. ✅ **Upload real de documentos/fotos** a Supabase Storage (fotos de motos,
   documentos del arrendatario, comprobantes de pago, evidencia de multas) con
   buckets privados y URLs firmadas. *(Entregado en 2A.2 — ver docs/storage.md)*
5. ✅ **Acta / contrato PDF** del alquiler (pdf-lib, versionada). *(2A.3)*
6. ✅ **Evidencia de entrega y devolución** de la moto (fotos + estado). *(2A.3)*
7. ✅ **Exportación CSV** de motos, arrendatarios, alquileres, pagos, fotomultas
   y mantenimientos. *(2A.4 — ver docs/exports.md)*
8. ✅ **Configuración del negocio** (nombre, propietario, contacto, términos del
   acta). *(2A.4 — ver docs/business-settings.md)*
9. **Mejoras de reportes internos** (rentabilidad por moto, mora por cliente).

10. ✅ **PWA instalable** (manifest, íconos, service worker online-first, página
    offline, install prompt). *(2A.5 — ver docs/pwa.md)*

> El mapa muestra **fotomultas registradas manualmente**. No consulta SIMIT/RUNT
> ni automatiza comparendos; OpenStreetMap se usa solo para visualizar la
> ubicación, que se ingresa a mano o seleccionando un punto en el mapa.

## Fase 2B — Automatización

1. **Recordatorios internos** (pagos, vencimientos, mantenimientos).
2. **Notificaciones por email** (bajo costo).
3. **Mejoras de auditoría** (visor con filtros, más acciones cubiertas).
4. **Reportes avanzados** y tendencias.
5. **Mapa con estadísticas por zona** (zonas con más multas).

---

## No prioritario / cancelado por ahora (decisión del cliente)

El cliente gestiona el cobro y la comunicación por fuera del sistema y no quiere
exponer la plataforma a los arrendatarios. Por lo tanto, queda fuera de alcance:

| Funcionalidad | Estado |
| --- | --- |
| Portal de cliente / arrendatario | Cancelado por ahora |
| Login / autoservicio del arrendatario | Cancelado por ahora |
| Pagos en línea | Cancelado por ahora |
| Integración con pasarelas (Wompi, Bold, Mercado Pago, PayU, ePayco) | Cancelado por ahora |
| Links de pago / checkout | Cancelado por ahora |
| App móvil nativa | No prioritario |
| WhatsApp Business API | No prioritario (se mantienen enlaces wa.me) |
| Consulta automática SIMIT/RUNT / scraping | Descartado (riesgo legal/técnico) |
| Multiusuario / roles avanzados | No prioritario |

> Si el negocio cambia de estrategia, estas funcionalidades pueden reconsiderarse
> en una fase posterior; el modelo de datos no impide agregarlas.
