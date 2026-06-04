import { describe, it, expect } from "vitest";
import { normalizePhone, whatsappLink } from "@/lib/whatsapp";

describe("normalizePhone", () => {
  it("antepone 57 a un número local de 10 dígitos", () => {
    expect(normalizePhone("3001234567")).toBe("573001234567");
  });
  it("respeta un número que ya trae código de país", () => {
    expect(normalizePhone("573001234567")).toBe("573001234567");
  });
  it("elimina caracteres no numéricos", () => {
    expect(normalizePhone("+57 300 123 4567")).toBe("573001234567");
  });
});

describe("whatsappLink", () => {
  it("construye un enlace wa.me con texto codificado", () => {
    const link = whatsappLink("3001234567", "Hola mundo");
    expect(link).toBe("https://wa.me/573001234567?text=Hola%20mundo");
  });
  it("sin mensaje devuelve solo el enlace base", () => {
    expect(whatsappLink("3001234567")).toBe("https://wa.me/573001234567");
  });
});
