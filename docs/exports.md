# Exportaciones (CSV)

Fase 2A.4 agrega exportación de la información operativa desde **Reportes**
(`/app/reports` → tarjeta "Exportar información").

## Formato: CSV (¿por qué CSV y no XLSX?)

Se eligió **CSV** porque:

- **Cero dependencias** (no añade peso ni superficie de seguridad).
- Se abre directo en **Excel / Google Sheets**.
- Es trivial de generar, transmitir y testear.

El código (`src/lib/exports.ts`) está estructurado para poder agregar **XLSX
multi-hoja** más adelante sin reescribir la lógica de datos.

Los CSV llevan **BOM UTF-8** (para que Excel muestre bien los acentos) y
**escapado seguro** que neutraliza inyección de fórmulas (celdas que empiezan
por `= + - @` se prefijan con `'`).

## Qué se puede exportar

| Botón | Archivo | Columnas |
| --- | --- | --- |
| Motos | `motos-YYYY-MM-DD.csv` | placa, marca, modelo, cilindraje, año, estado, kilometraje, valores, vencimientos (SOAT/tecno/impuestos/aceite) |
| Arrendatarios | `arrendatarios-YYYY-MM-DD.csv` | nombre, documento, nacionalidad, teléfono, dirección, licencia, estado |
| Alquileres | `alquileres-YYYY-MM-DD.csv` | placa, arrendatario, fechas, valor, frecuencia, estado |
| Pagos | `pagos-YYYY-MM-DD.csv` | arrendatario, alquiler, placa, monto, método, estado, fechas, referencia |
| Fotomultas | `fotomultas-YYYY-MM-DD.csv` | placa, responsable, fecha, valor, motivo, ubicación, lat, lng, estado |
| Mantenimientos | `mantenimientos-YYYY-MM-DD.csv` | placa, tipo, fecha, km, costo, próxima fecha/km, estado, notas |

## Qué NO se exporta

- **Archivos** (fotos, documentos, comprobantes, evidencias, actas PDF): solo se
  exporta **metadata**. Los binarios viven en Storage privado.
- Datos de auditoría y configuración interna.

## Seguridad

- Endpoint server-side **protegido por sesión**: `GET /app/exports/<tipo>`.
  Sin sesión → `401`. Tipo inválido → `400`.
- El service-role **no** se expone al cliente.
- Cada descarga registra auditoría `export_generated`.
- Recordatorio: los **pagos** son registros internos de pagos gestionados por
  fuera del sistema (el sistema no cobra).

## Limitaciones conocidas

- Exporta **todo** el conjunto (sin filtros por fecha/estado todavía).
- CSV plano (no XLSX, no múltiples hojas) — ver justificación arriba.
- Montos en CSV como número entero COP (sin formato), para análisis en Excel.
