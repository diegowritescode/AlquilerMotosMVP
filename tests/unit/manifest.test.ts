import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

describe("manifest.webmanifest", () => {
  const manifest = JSON.parse(
    readFileSync("public/manifest.webmanifest", "utf8"),
  );

  it("tiene los campos obligatorios", () => {
    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBeTruthy();
    expect(manifest.start_url).toBe("/app/dashboard");
    expect(manifest.scope).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#0a0a0b");
    expect(manifest.background_color).toBe("#0a0a0b");
  });

  it("incluye íconos 192 y 512 + maskable", () => {
    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");
    const purposes = manifest.icons.map((i: { purpose?: string }) => i.purpose);
    expect(purposes).toContain("maskable");
  });
});
