/**
 * CSV helpers (no dependencies). We chose CSV over XLSX for Fase 2A.4 because:
 *  - zero dependencies / no bundle or supply-chain cost,
 *  - opens directly in Excel / Google Sheets,
 *  - trivially streamable and testable.
 * The export module is structured so XLSX (multi-sheet) can be added later.
 *
 * Security: values are escaped for CSV AND guarded against spreadsheet formula
 * injection (a cell starting with = + - @ is prefixed with a quote).
 */

export type CsvValue = string | number | null | undefined;

export function csvEscape(value: CsvValue): string {
  let s = value === null || value === undefined ? "" : String(value);
  // Formula-injection guard.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  // Quote if it contains comma, quote or newline.
  if (/[",\n\r]/.test(s)) s = `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  const lines = [headers.map(csvEscape).join(",")];
  for (const row of rows) lines.push(row.map(csvEscape).join(","));
  // UTF-8 BOM so Excel renders accents correctly.
  return `﻿${lines.join("\r\n")}`;
}

/** e.g. exportFilename("motos", new Date("2026-06-04")) -> "motos-2026-06-04.csv" */
export function exportFilename(base: string, date: Date): string {
  const d = date.toISOString().slice(0, 10);
  return `${base}-${d}.csv`;
}
