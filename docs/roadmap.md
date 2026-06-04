# Roadmap

## Fase 1 — MVP operativo (este repositorio)

Landing, login admin, dashboard, motos, arrendatarios, alquileres, pagos
manuales, vencimientos, mantenimientos, fotomultas manuales, reportes básicos y
auditoría. Mobile-first, dark theme, WhatsApp integrado.

## Fase 2 — Automatización y portal cliente

- Portal de cliente (autoservicio, consulta de su info).
- Verificación documental estructurada.
- Solicitud de alquiler desde el catálogo.
- Contrato PDF + aceptación de términos con evidencia.
- **Pagos online** (integrar **una** pasarela: Wompi o Bold) con webhooks.
- Links de pago automáticos por WhatsApp.
- Recordatorios por email (Resend/Brevo) de pagos, vencimientos y mantenimiento.
- **Mapa simple de fotomultas** (OpenStreetMap + Leaflet) con ubicación manual.
- Exportación CSV/Excel.
- Carga real de archivos a Supabase Storage con URLs firmadas.

## Fase 3 — Escalamiento

- PWA instalable avanzada / app nativa (alto volumen).
- Multiusuario y roles (operador, cobrador, mecánico, auditor).
- Multi-sede, scoring de clientes, integración contable.
- Analítica avanzada / BI (>30–50 motos).
- Integración formal con proveedores de datos de tránsito (si el volumen lo justifica).

## Fuera de alcance del MVP (y por qué)

| Funcionalidad | Razón |
| --- | --- |
| App nativa | Sobrecosto para flota pequeña |
| Microservicios / Kubernetes | Sobreingeniería |
| Scraping SIMIT/RUNT | Riesgo legal y técnico |
| Múltiples pasarelas | Complejidad innecesaria |
| WhatsApp Business API | Puede esperar |
| Verificación automática de identidad | Costosa para MVP |
| BI avanzado / mapa de calor | Poca data inicial |
