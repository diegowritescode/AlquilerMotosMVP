import { describe, it, expect } from "vitest";
import {
  MAX_FILE_SIZE,
  validateUploadFile,
  formatBytes,
  isImageType,
} from "@/lib/upload";

describe("validateUploadFile", () => {
  it("acepta una imagen válida dentro del límite", () => {
    expect(validateUploadFile({ type: "image/png", size: 1024 }).ok).toBe(true);
    expect(validateUploadFile({ type: "image/jpeg", size: 2048 }).ok).toBe(true);
    expect(validateUploadFile({ type: "application/pdf", size: 5000 }).ok).toBe(true);
  });
  it("rechaza tipos no permitidos", () => {
    const r = validateUploadFile({ type: "text/plain", size: 100 });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/Tipo no permitido/);
  });
  it("rechaza archivos que superan el tamaño máximo", () => {
    const r = validateUploadFile({ type: "image/png", size: MAX_FILE_SIZE + 1 });
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/máximo/);
  });
  it("rechaza archivo vacío o ausente", () => {
    expect(validateUploadFile(null).ok).toBe(false);
    expect(validateUploadFile({ type: "image/png", size: 0 }).ok).toBe(false);
  });
});

describe("formatBytes", () => {
  it("formatea tamaños", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});

describe("isImageType", () => {
  it("detecta imágenes por mime y por extensión", () => {
    expect(isImageType("image/png")).toBe(true);
    expect(isImageType("123/foto.JPG")).toBe(true);
    expect(isImageType("abc/doc.pdf")).toBe(false);
    expect(isImageType("application/pdf")).toBe(false);
  });
});
