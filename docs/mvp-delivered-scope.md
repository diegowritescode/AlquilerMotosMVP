# Alcance entregado — MVP Fase 1

Documento de alcance para alinear expectativas con el cliente. Resume qué se
entregó, qué no, y la recomendación para la siguiente fase.

**Producto:** Moto Rental — **sistema interno de control operativo** para un
negocio de alquiler de motocicletas (Medellín). Lo usa el dueño/operador; **no**
es un portal para arrendatarios ni una plataforma de pagos en línea.
**Fase:** 1 (MVP operativo). **Estado:** entregado y validado.

---

## ✅ Qué incluye el MVP

| Módulo | Detalle |
| --- | --- |
| Landing pública | Presentación, beneficios, catálogo, requisitos, FAQ, CTA WhatsApp, términos y privacidad. |
| Autenticación | Login real con Supabase Auth. Rutas administrativas protegidas. |
| Dashboard | Centro de control: flota, ingresos, pagos pendientes, vencimientos, mantenimientos, multas y acciones rápidas. |
| Motos | Alta, edición, detalle con historial, búsqueda, filtros, baja lógica. |
| Arrendatarios | Datos administrativos: alta, edición, detalle con motos/pagos/multas, WhatsApp, estado financiero. |
| Alquileres | Crear/activar/finalizar/cancelar con reglas de negocio. |
| Pagos (registro interno) | Registro manual de pagos recibidos (efectivo, transferencia, Nequi, Bancolombia, otro), estados y calendario por mes. El cobro se gestiona por fuera del sistema. |
| Vencimientos | SOAT, tecnomecánica, impuestos, aceite, mantenimiento y pagos (vencidos / 7 / 15 / 30 días). |
| Mantenimientos | Registro, tipos, costos, próximos. |
| Fotomultas | Registro manual + sugerencia de responsable + **mapa OpenStreetMap/Leaflet** + **evidencia adjunta** (Storage). |
| Archivos | **Upload a Supabase Storage** (privado + URLs firmadas): fotos de motos, documentos de arrendatarios, comprobantes de pago y evidencia de multas. |
| Acta de alquiler | **PDF generado** (pdf-lib, versionado) + **evidencia de entrega/devolución**. Soporte operativo, no contrato legal definitivo. |
| Reportes | Ingresos, pendientes, utilización, motos por estado, multas, clientes activos + **exportación CSV**. |
| Configuración | **Datos del negocio** (acta PDF, fallback a env). |
| Auditoría | Registro de acciones críticas (crear/editar/cambiar estado). |
| WhatsApp | Enlaces wa.me configurables en landing, clientes y alquileres. |

## ❌ Qué NO incluye

**Fuera de alcance por decisión del cliente** (gestiona cobro/comunicación por
fuera y no quiere exponer la plataforma a los arrendatarios):

- Portal de cliente / autoservicio del arrendatario.
- Login del arrendatario.
- Pagos en línea / pasarelas (Wompi, Bold, Mercado Pago, PayU, ePayco) / checkout.
- App móvil nativa (la web es responsive / instalable tipo PWA).
- WhatsApp Business API (solo enlaces wa.me como contacto rápido).
- Consulta automática a SIMIT/RUNT y scraping (riesgo legal/técnico).

**Previsto para fases siguientes (no es Fase 1):**

- (✅ Carga de archivos a Storage — entregado en Fase 2A.2.)
- (✅ Mapa interactivo de fotomultas — entregado en Fase 2A.1.)
- Contratos/acta PDF, evidencia de entrega/devolución (Fase 2A).
- Exportación CSV/Excel y configuración del negocio (Fase 2A).
- Recordatorios y notificaciones por email, reportes avanzados (Fase 2B).

## 🧱 Módulos entregados (técnico)

- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind (dark, mobile-first).
- Backend: Server Actions de Next.js.
- Datos: Supabase PostgreSQL (con fallback demo en memoria para presentaciones).
- Auth: Supabase Auth. Storage: buckets privados preparados.
- Validación: Zod. Migraciones SQL + RLS + seed incluidos.

## 🔍 Validaciones realizadas

- `lint`, `typecheck` y `build` pasan sin errores.
- Pruebas unitarias (Vitest): utilidades, WhatsApp y schemas.
- Pruebas E2E (Playwright) de flujos críticos contra **Supabase real**:
  **48 passed / 0 failed** (landing, auth, dashboard, motos, clientes,
  alquileres, pagos, mantenimientos, fotomultas, vencimientos, reportes,
  auditoría).
- Reglas de negocio verificadas: alquiler activo → moto "alquilada"; no dos
  alquileres activos por moto; finalizar → disponible/mantenimiento; sugerencia
  de responsable en multas.

## ⚙️ Estado técnico

- App desplegada y funcionando, Supabase real configurado.
- Acceso a datos server-side con service-role (single-admin); RLS activo.
- Sin errores críticos conocidos.

## ⚠️ Limitaciones conocidas

- Los pagos son **registros internos**; el cobro se gestiona por fuera. El pago
  es opcional respecto al alquiler (permite abonos sueltos), por diseño.
- La carga de imágenes/documentos desde la UI queda para Fase 2A (los campos de
  URL ya existen).
- El "mapa" de fotomultas es un enlace a OpenStreetMap; el mapa interactivo es
  la prioridad de Fase 2A.
- La auditoría cubre acciones críticas; falta un visor con filtros.

## 🚀 Recomendación para Fase 2A (control operativo avanzado)

Tras el cambio de alcance, el foco es darle más control interno al administrador
(no portal ni pagos en línea):

1. ✅ **Mapa de fotomultas** (OpenStreetMap/Leaflet) + selección de ubicación y
   filtros por moto, arrendatario, estado y fecha. *(Entregado — Fase 2A.1)*
2. ✅ **Carga real de documentos/fotos** a Storage con URLs firmadas.
   *(Entregado — Fase 2A.2)*
3. ✅ **Acta/contrato PDF** y **evidencia de entrega/devolución** de la moto.
   *(Entregado — Fase 2A.3)*
4. ✅ **Exportación CSV** y **configuración del negocio**. *(Entregado — 2A.4)*
5. **Mejoras de reportes internos**.

Luego, **Fase 2B**: recordatorios internos, notificaciones por email, mejoras de
auditoría y estadísticas por zona. Detalle en [`docs/roadmap.md`](roadmap.md).

> Priorizar según el feedback recogido en la demo (ver `docs/demo-script.md`).
