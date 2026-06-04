# Configuración del negocio

Fase 2A.4 agrega una pantalla para configurar los datos del negocio:
**`/app/settings/business`** (enlace desde `/app/settings`).

## Campos

| Campo | Uso |
| --- | --- |
| `business_name` | Nombre del negocio (acta PDF, encabezados). |
| `owner_name` | Propietario (acta PDF). |
| `owner_document` | Documento / NIT (acta PDF). |
| `phone` | Teléfono de contacto (acta PDF). |
| `whatsapp` | WhatsApp del negocio (acta + referencia). |
| `email` | Correo (acta PDF). Validado. |
| `city` | Ciudad (acta PDF). |
| `address` | Dirección (acta PDF). |
| `currency` | Moneda (default `COP`). |
| `alert_days_before_expiration` | Días de anticipación para alertas (1–365, default 30). |
| `contract_terms_text` | Términos personalizados del acta (una condición por línea). |

## Modelo de datos

Tabla **`business_settings`** (migración `0005_business_settings.sql`),
**single-row** (sistema single-business/single-admin). Helpers en
`src/lib/data/business-settings.ts`:

- `getBusinessSettings()` — **nunca falla ni devuelve null**: si no hay registro
  (o en modo demo, o si falta la migración) devuelve **valores por defecto**
  tomados de las variables de entorno (`NEXT_PUBLIC_BUSINESS_NAME`,
  `NEXT_PUBLIC_BUSINESS_WHATSAPP`).
- `updateBusinessSettings(input)` — actualiza el registro único o lo crea.

> Fallback a `.env`: si no configuras el negocio en la UI (o falta la migración),
> el acta y la info usan los valores de entorno. Así nada se rompe.

## Impacto en el acta PDF

El acta (`docs/contracts.md`) usa estos datos en el encabezado: nombre del
negocio, propietario, documento/NIT, ciudad, dirección, teléfono y correo. Si
defines **términos personalizados**, el acta los usa en "Condiciones
operativas" (una por línea); si los dejas vacíos, usa las condiciones por
defecto.

## Seguridad / auditoría

- Edición protegida por sesión (admin). RLS activo en la tabla.
- Cambios registran auditoría `business_settings_updated`.

## Nota sobre WhatsApp

El número de WhatsApp de la **landing pública** sigue tomándose de
`NEXT_PUBLIC_BUSINESS_WHATSAPP` (componente cliente). El `whatsapp` de
`business_settings` se usa en el acta y en la vista de configuración. Unificar
ambos en una sola fuente es una mejora futura.
