import { describe, it, expect, beforeEach, vi } from "vitest";

// The thin status actions call revalidatePath/redirect; stub them so the
// actions run in the in-memory (mock) data layer without a request context.
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

import { resetMockDB } from "@/lib/mock/store";
import { updateFineStatusAction } from "@/lib/actions/fines";
import { updateMaintenanceStatusAction } from "@/lib/actions/maintenance";
import { getFine } from "@/lib/data/fines";
import { getMaintenance } from "@/lib/data/maintenance";

// Stable seed ids (src/lib/mock/seed.ts).
const FINE_ID = "66666666-6666-4666-8666-000000000001";
const MAINT_ID = "55555555-5555-4555-8555-000000000001";

describe("updateFineStatusAction", () => {
  beforeEach(() => resetMockDB());

  it("cambia el estado de la multa", async () => {
    const res = await updateFineStatusAction(FINE_ID, "pagada");
    expect(res.ok).toBe(true);
    expect((await getFine(FINE_ID))?.status).toBe("pagada");
  });

  it("rechaza un estado inválido y no modifica nada", async () => {
    const before = (await getFine(FINE_ID))?.status;
    const res = await updateFineStatusAction(FINE_ID, "inventado");
    expect(res.error).toBeTruthy();
    expect((await getFine(FINE_ID))?.status).toBe(before);
  });

  it("reporta multa no encontrada", async () => {
    const res = await updateFineStatusAction("00000000-0000-4000-8000-000000000000", "pagada");
    expect(res.error).toBeTruthy();
  });
});

describe("updateMaintenanceStatusAction", () => {
  beforeEach(() => resetMockDB());

  it("marca el mantenimiento como realizado", async () => {
    const res = await updateMaintenanceStatusAction(MAINT_ID, "realizado");
    expect(res.ok).toBe(true);
    expect((await getMaintenance(MAINT_ID))?.status).toBe("realizado");
  });

  it("rechaza un estado inválido", async () => {
    const res = await updateMaintenanceStatusAction(MAINT_ID, "x");
    expect(res.error).toBeTruthy();
  });
});
