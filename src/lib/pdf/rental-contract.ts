import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  CONDITION_LABELS,
  PAYMENT_FREQUENCY_LABELS,
  RENTAL_STATUS_LABELS,
} from "@/lib/constants";

/**
 * Server-side generator for the rental "acta" (operational delivery record).
 * Uses pdf-lib (no headless browser). Returns the PDF bytes.
 *
 * NOTE: this is an OPERATIONAL support document, NOT a legally-binding contract
 * nor a digital signature. See docs/contracts.md.
 */

export interface RentalContractData {
  business: {
    name: string;
    ownerName?: string | null;
    ownerDocument?: string | null;
    city?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  /** Optional custom terms (one per line); falls back to default conditions. */
  customTerms?: string | null;
  generatedAtLabel: string; // pre-formatted date string (server passes it)
  moto: {
    brand: string;
    model: string;
    plate: string;
    cc: number;
    year: number;
    mileage: number;
    general_condition: string;
    engine_condition: string;
    tires_condition: string;
  };
  customer: {
    full_name: string;
    document_type: string;
    document_number: string;
    phone: string;
    address?: string | null;
    license_number?: string | null;
    license_category?: string | null;
  };
  rental: {
    start_date: string;
    end_date?: string | null;
    agreed_value: number;
    payment_frequency: string;
    status: string;
    notes?: string | null;
  };
}

/** Money as "$ 150.000" (es-CO grouping, no exotic spaces for WinAnsi). */
function money(n: number): string {
  return `$ ${Math.round(n).toLocaleString("es-CO")}`;
}

/** Keep text within WinAnsi (Helvetica) range; Spanish accents are fine. */
function sanitize(text: string): string {
  return (text ?? "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x00-\xFF]/g, "?");
}

function wrap(text: string, maxChars: number): string[] {
  const words = sanitize(text).split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      if (line) lines.push(line.trim());
      line = w;
    } else {
      line = `${line} ${w}`.trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines.length ? lines : [""];
}

const CONDITIONS = [
  "El arrendatario recibe la motocicleta en el estado descrito en este documento.",
  "El arrendatario se compromete a responder por los danos ocasionados a la motocicleta durante el periodo de uso.",
  "El arrendatario se compromete a responder por multas, comparendos o fotomultas generadas durante el periodo de uso, sujeto a validacion del administrador.",
  "Los pagos se acuerdan y gestionan por fuera del sistema; esta plataforma registra unicamente el control interno.",
  "Este documento es un soporte operativo y debe ser revisado por un asesor legal antes de usarse como contrato legal definitivo.",
];

export async function generateRentalContractPdf(
  data: RentalContractData,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const MARGIN = 50;
  const WIDTH = 595;
  const HEIGHT = 842;
  const brand = rgb(0.85, 0.66, 0.0);
  const dark = rgb(0.1, 0.1, 0.1);

  let page = pdf.addPage([WIDTH, HEIGHT]);
  let y = HEIGHT - MARGIN;

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN) {
      page = pdf.addPage([WIDTH, HEIGHT]);
      y = HEIGHT - MARGIN;
    }
  }

  function text(value: string, opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number } = {}) {
    const size = opts.size ?? 10;
    const f = opts.font ?? font;
    ensureSpace(size + (opts.gap ?? 4));
    (page as PDFPage).drawText(sanitize(value), { x: MARGIN, y, size, font: f, color: opts.color ?? dark });
    y -= size + (opts.gap ?? 4);
  }

  function heading(value: string) {
    y -= 6;
    text(value, { size: 12, font: bold, color: brand, gap: 6 });
    (page as PDFPage).drawLine({
      start: { x: MARGIN, y: y + 4 },
      end: { x: WIDTH - MARGIN, y: y + 4 },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 4;
  }

  function row(label: string, value: string) {
    ensureSpace(14);
    (page as PDFPage).drawText(sanitize(label), { x: MARGIN, y, size: 10, font: bold, color: dark });
    (page as PDFPage).drawText(sanitize(value), { x: MARGIN + 150, y, size: 10, font, color: dark });
    y -= 14;
  }

  // Header
  text(sanitize(data.business.name), { size: 16, font: bold, color: brand, gap: 2 });
  text("Acta de entrega y alquiler de motocicleta", { size: 13, font: bold, gap: 2 });
  const bizLine = [
    data.business.ownerName,
    data.business.ownerDocument ? `Doc/NIT ${data.business.ownerDocument}` : null,
    data.business.city,
    data.business.address,
    data.business.phone ? `Tel ${data.business.phone}` : null,
    data.business.email,
  ]
    .filter(Boolean)
    .join("  ·  ");
  if (bizLine) text(bizLine, { size: 9, color: rgb(0.4, 0.4, 0.4), gap: 2 });
  text(`Generada: ${data.generatedAtLabel}`, { size: 9, color: rgb(0.4, 0.4, 0.4), gap: 8 });

  // Motorcycle
  heading("Datos de la motocicleta");
  row("Marca / Modelo", `${data.moto.brand} ${data.moto.model}`);
  row("Placa", data.moto.plate);
  row("Cilindraje / Ano", `${data.moto.cc} cc  /  ${data.moto.year}`);
  row("Kilometraje", `${data.moto.mileage.toLocaleString("es-CO")} km`);
  row("Estado general", CONDITION_LABELS[data.moto.general_condition] ?? data.moto.general_condition);
  row("Estado motor", CONDITION_LABELS[data.moto.engine_condition] ?? data.moto.engine_condition);
  row("Estado llantas", CONDITION_LABELS[data.moto.tires_condition] ?? data.moto.tires_condition);

  // Customer
  heading("Datos del arrendatario");
  row("Nombre", data.customer.full_name);
  row("Documento", `${data.customer.document_type} ${data.customer.document_number}`);
  row("Telefono", data.customer.phone);
  if (data.customer.address) row("Direccion", data.customer.address);
  if (data.customer.license_number)
    row("Licencia", `${data.customer.license_number}${data.customer.license_category ? ` (${data.customer.license_category})` : ""}`);

  // Rental
  heading("Datos del alquiler");
  row("Fecha inicio", data.rental.start_date);
  row("Fecha final", data.rental.end_date ?? "Abierto");
  row("Valor acordado", money(data.rental.agreed_value));
  row("Frecuencia", PAYMENT_FREQUENCY_LABELS[data.rental.payment_frequency] ?? data.rental.payment_frequency);
  row("Estado", RENTAL_STATUS_LABELS[data.rental.status] ?? data.rental.status);
  if (data.rental.notes) {
    for (const l of wrap(`Observaciones: ${data.rental.notes}`, 95)) text(l, { size: 9, gap: 3 });
  }

  // Conditions (custom from business settings, or defaults)
  heading("Condiciones operativas");
  const customLines = (data.customTerms ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const conditions = customLines.length > 0 ? customLines : CONDITIONS;
  conditions.forEach((c, i) => {
    for (const l of wrap(`${i + 1}. ${c}`, 95)) text(l, { size: 9, gap: 3 });
    y -= 2;
  });

  // Signatures
  y -= 24;
  ensureSpace(60);
  const colW = (WIDTH - MARGIN * 2 - 30) / 2;
  (page as PDFPage).drawLine({ start: { x: MARGIN, y }, end: { x: MARGIN + colW, y }, thickness: 0.5, color: dark });
  (page as PDFPage).drawLine({ start: { x: MARGIN + colW + 30, y }, end: { x: WIDTH - MARGIN, y }, thickness: 0.5, color: dark });
  y -= 12;
  (page as PDFPage).drawText("Firma administrador", { x: MARGIN, y, size: 9, font, color: dark });
  (page as PDFPage).drawText("Firma arrendatario", { x: MARGIN + colW + 30, y, size: 9, font, color: dark });

  return pdf.save();
}
