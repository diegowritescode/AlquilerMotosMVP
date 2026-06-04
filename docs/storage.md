# Storage — fotos, documentos y evidencias

Fase 2A.2 habilita la subida real de archivos a **Supabase Storage** desde el
panel interno. Aplica a fotos de motos, documentos de arrendatarios y evidencias
de pagos y fotomultas.

## Buckets requeridos (todos PRIVADOS)

| Bucket | Uso |
| --- | --- |
| `motorcycle-photos` | Fotos de motocicletas. |
| `customer-documents` | Documentos del arrendatario (licencia, cédula, foto frontal…). **Datos sensibles.** |
| `payment-evidence` | Comprobantes de pago (registro interno). |
| `fine-evidence` | Evidencia/soporte de fotomultas. |
| `rental-evidence` | Evidencia de entrega/devolución del alquiler (Fase 2A.3). |
| `rental-contracts` | Actas PDF generadas del alquiler (Fase 2A.3). |

### Cómo crearlos

Supabase → **Storage → New bucket** → nombre exacto del bucket → **Public: OFF**
(privado). Repite para los cuatro. No se requieren políticas adicionales: el
acceso ocurre **server-side con la service-role key**; para mostrar archivos se
generan **URLs firmadas** temporales.

> Si prefieres el camino "anon + RLS por sesión", deberás añadir políticas de
> Storage por bucket que permitan al rol admin leer/escribir. El MVP usa
> service-role en el servidor, así que no es necesario.

## Por qué privados

Los documentos del arrendatario son **datos personales sensibles** (Ley 1581 de
2012). Buckets privados + URLs firmadas evitan exposición pública permanente.
Ningún archivo queda accesible sin una URL firmada vigente.

## Tipos y tamaño permitidos

- **Tipos:** `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- **Tamaño máximo:** **5 MB** por archivo.
- Definidos en [`src/lib/upload.ts`](../../src/lib/upload.ts) (`ALLOWED_MIME_TYPES`,
  `MAX_FILE_SIZE`) y validados **en cliente** (feedback inmediato) **y en
  servidor** (fuente de verdad, en las Server Actions).

## Cómo funciona (arquitectura)

1. El usuario elige un archivo en `FileUploadField` (cliente). Validación local.
2. El `<form>` envía el archivo a una **Server Action** (`src/lib/actions/uploads.ts`).
3. La acción re-valida, verifica que la entidad exista y sube con
   `uploadServer()` (service-role, **server-only**) al bucket, con prefijo
   `<entityId>/<timestamp>-<nombre>`.
4. Se guarda el **storage path** (no una URL pública) en la base de datos:
   - Fotos de moto → tabla `motorcycle_photos.file_url`.
   - Documentos → tabla `customer_documents.file_url` (+ `type`).
   - Pago → `payments.evidence_url`.
   - Multa → `fines.evidence_url`.
5. Al **leer**, la página (server) genera una **URL firmada** con
   `signedUrlServer()` (expira en **1 hora**) para mostrar imagen o enlace.

### Decisión de almacenamiento

Las columnas se llaman `*_url` por compatibilidad histórica, pero **almacenan el
storage path** (relativo al bucket), no una URL. La URL firmada se genera al
consultar. Así el dato persistido nunca caduca y el archivo sigue privado.

## Qué evidencia se puede adjuntar

- **Moto:** una o varias fotos (galería en el detalle, con opción de eliminar).
- **Arrendatario:** documentos por tipo (licencia, documento de identidad, foto
  frontal, otro). Lista en el detalle con preview/enlace y eliminar.
- **Pago:** un comprobante (imagen o PDF). El sistema **no cobra**; es registro
  interno de un pago recibido por fuera.
- **Fotomulta:** una evidencia de soporte (captura, foto o PDF). No se consulta
  SIMIT/RUNT.
- **Alquiler:** evidencia de **entrega** y **devolución** (fotos, kilometraje,
  daños) + **acta PDF** generada y versionada. Ver [`contracts.md`](contracts.md).

## Flujo de subida (UX)

La subida se hace **desde el detalle** de cada entidad (no en el formulario de
creación): primero creas la moto/cliente/pago/multa y luego adjuntas archivos en
su página de detalle. Esto mantiene el flujo simple y evita archivos huérfanos
sin entidad asociada.

## Seguridad y privacidad

- Buckets **privados**; acceso restringido al administrador.
- La **service-role key nunca se expone al cliente** (solo se usa en
  `storage-server.ts` / Server Actions).
- **No** usar documentos reales de personas en datos demo sin autorización.
- **No** compartir URLs firmadas por fuera si contienen documentos sensibles
  (caducan en 1 hora, pero mientras tanto dan acceso).
- Recomendación: mantener publicada la **política de tratamiento de datos**
  (`/privacy`) y recoger autorización del titular.

## Limitaciones conocidas

- En **modo demo** (sin Supabase) no hay Storage: los campos de subida muestran
  un mensaje de error claro y las listas quedan vacías.
- Sin compresión/redimensionado de imágenes ni miniaturas server-side.
- Una sola evidencia por pago/multa (se reemplaza al subir otra).
- URLs firmadas de 1 hora; al recargar se regeneran.
- Sin antivirus/scan de archivos (considerar en fases futuras si se requiere).
