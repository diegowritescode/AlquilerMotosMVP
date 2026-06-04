import { describe, it, expect } from "vitest";
import { csvEscape, toCsv, exportFilename } from "@/lib/csv";

describe("csvEscape", () => {
  it("deja valores simples sin cambios", () => {
    expect(csvEscape("hola")).toBe("hola");
    expect(csvEscape(150000)).toBe("150000");
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });
  it("entrecomilla comas, comillas y saltos de línea", () => {
    expect(csvEscape("a,b")).toBe('"a,b"');
    expect(csvEscape('di "hola"')).toBe('"di ""hola"""');
    expect(csvEscape("línea1\nlínea2")).toBe('"línea1\nlínea2"');
  });
  it("neutraliza inyección de fórmulas", () => {
    expect(csvEscape("=SUM(A1)")).toBe("'=SUM(A1)");
    expect(csvEscape("+1")).toBe("'+1");
    expect(csvEscape("-1")).toBe("'-1");
    expect(csvEscape("@x")).toBe("'@x");
  });
});

describe("toCsv", () => {
  it("genera encabezados + filas con BOM y CRLF", () => {
    const csv = toCsv(["a", "b"], [
      ["1", "2"],
      ["x,y", "z"],
    ]);
    expect(csv.charCodeAt(0)).toBe(0xfeff); // BOM
    const body = csv.slice(1);
    expect(body).toBe('a,b\r\n1,2\r\n"x,y",z');
  });
});

describe("exportFilename", () => {
  it("usa la fecha en el nombre", () => {
    expect(exportFilename("motos", new Date("2026-06-04T12:00:00Z"))).toBe(
      "motos-2026-06-04.csv",
    );
  });
});
