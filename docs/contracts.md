# Acta del alquiler (PDF) y evidencia de entrega/devolución

Fase 2A.3 agrega, en el detalle de cada alquiler (`/app/rentals/[id]`):

- **Acta del alquiler**: documento PDF operativo generado por el sistema.
- **Evidencia de entrega** y **evidencia de devolución**: archivos subidos.

## ¿Qué es el acta PDF?

Un **soporte operativo** que deja constancia de quién recibió qué moto, cuándo,
en qué estado y bajo qué condiciones. **No es un contrato legal definitivo ni
una firma digital.**

### Qué incluye

- **Encabezado:** nombre del negocio, fecha de generación, título
  "Acta de entrega y alquiler de motocicleta".
- **Motocicleta:** marca, modelo, placa, cilindraje, año, kilometraje, estado
  general/motor/llantas.
- **Arrendatario:** nombre, tipo y número de documento, teléfono, dirección y
  licencia (si existen).
- **Alquiler:** fecha inicio/fin, valor acordado, frecuencia, estado,
  observaciones.
- **Condiciones operativas:** recepción en el estado descrito; responsabilidad
  por daños; responsabilidad por multas/comparendos sujeta a validación del
  administrador; los pagos se gestionan por fuera (registro interno); aviso de
  revisión legal.
- **Firmas placeholder:** administrador y arrendatario (líneas para firma
  manual; no hay firma digital).

### Cómo se genera

- Botón **"Generar acta PDF"** en el detalle del alquiler.
- Server Action `generateRentalContractAction` (server-only) arma el PDF con
  **pdf-lib** (sin navegador headless), lo sube a Storage y registra una fila en
  `rental_contracts` con su **versión** (incremental).
- Si ya existe, se muestran **Ver acta** / **Descargar** y **Regenerar acta**
  (la regeneración crea una nueva versión; la anterior se conserva).

### Dónde se almacena

- Bucket **privado** `rental-contracts`. Se guarda el **storage path** en
  `rental_contracts.file_path`; la vista/descarga usa una **URL firmada** (1 h).

## Evidencia de entrega / devolución

- Se suben en el detalle del alquiler (tipo `delivery` o `return`).
- Bucket **privado** `rental-evidence`; metadatos en la tabla `rental_evidence`
  (tipo, nombre, mime, tamaño). Mismas reglas de validación que el resto de
  uploads (JPG/PNG/WEBP/PDF, hasta 5 MB — ver [`storage.md`](storage.md)).
- Se pueden eliminar (borrado lógico + remoción del archivo en Storage).

## Modelo de datos (trade-off)

Se usan **dos tablas** en vez de una `rental_documents` genérica:

- `rental_evidence` — N archivos subidos por el usuario (entrega/devolución).
- `rental_contracts` — actas generadas por el sistema, **versionadas**.

Tienen semántica y ciclo de vida distintos (subida manual vs. generación
versionada), por lo que separarlas mantiene el modelo claro sin un campo `kind`
que mezcle ambos. Migración: `supabase/migrations/0004_rental_documents.sql`.

## Limitaciones legales y técnicas

- **No es firma digital** ni biométrica; las firmas son líneas para firmar a
  mano sobre el PDF impreso.
- Es un **soporte operativo**: debe ser **revisado por un asesor legal** antes
  de usarse como contrato legal definitivo.
- El PDF refleja los datos **al momento de generarse**; si cambian, regenera.
- En **modo demo** (sin Supabase) no hay Storage: el botón muestra un mensaje de
  "Storage no disponible".
- Texto del PDF en Latin-1 (Helvetica/WinAnsi); se sanea para evitar caracteres
  no soportados.
