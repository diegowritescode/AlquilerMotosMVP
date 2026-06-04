import { describe, it, expect } from "vitest";
import { formatCOP, formatDate, calcAge, daysUntil } from "@/lib/utils";

const digits = (s: string) => s.replace(/\D/g, "");

describe("formatCOP", () => {
  it("formatea pesos colombianos sin decimales", () => {
    expect(digits(formatCOP(150000))).toBe("150000");
    expect(formatCOP(150000).startsWith("$")).toBe(true);
  });
  it("trata null/undefined como 0", () => {
    expect(digits(formatCOP(null))).toBe("0");
    expect(digits(formatCOP(undefined))).toBe("0");
  });
});

describe("formatDate", () => {
  it("formatea una fecha ISO en español", () => {
    expect(formatDate("2024-05-20")).toMatch(/20 may\.? 2024/i);
  });
  it("devuelve — para nulo", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
  });
});

describe("calcAge", () => {
  it("calcula edad aproximada", () => {
    const age = calcAge("2000-01-01");
    expect(age).not.toBeNull();
    expect(age!).toBeGreaterThanOrEqual(24);
  });
  it("null sin fecha", () => {
    expect(calcAge(null)).toBeNull();
  });
});

describe("daysUntil", () => {
  it("fecha pasada es negativa", () => {
    expect(daysUntil("2000-01-01")!).toBeLessThan(0);
  });
  it("null sin fecha", () => {
    expect(daysUntil(null)).toBeNull();
  });
});
