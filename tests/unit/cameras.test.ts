import { describe, it, expect, beforeEach } from "vitest";
import { trafficCameraSchema } from "@/lib/schemas";
import { MEDELLIN_CAMERAS } from "@/lib/data/medellin-cameras-seed";
import { CAMERA_TYPES } from "@/lib/types";
import { resetMockDB } from "@/lib/mock/store";
import {
  listCameras,
  createCamera,
  updateCamera,
  deleteCamera,
  getCamera,
} from "@/lib/data/cameras";

// Medellín bounding box — every seeded point must fall inside it.
const BBOX = { minLat: 5.95, maxLat: 6.45, minLng: -75.75, maxLng: -75.45 };

const validCamera = {
  name: "Avenida 80 con Calle 30",
  type: "velocidad",
  lat: "6.2476",
  lng: "-75.5658",
  zone: "Avenida 80",
  max_speed_kmh: "50",
  approximate: "on",
  source: "manual",
};

describe("trafficCameraSchema", () => {
  it("acepta una cámara válida y coacciona números/booleano", () => {
    const r = trafficCameraSchema.safeParse(validCamera);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.lat).toBeCloseTo(6.2476);
      expect(r.data.max_speed_kmh).toBe(50);
      expect(r.data.approximate).toBe(true);
    }
  });
  it("rechaza nombre vacío", () => {
    expect(trafficCameraSchema.safeParse({ ...validCamera, name: "" }).success).toBe(false);
  });
  it("rechaza tipo inválido", () => {
    expect(trafficCameraSchema.safeParse({ ...validCamera, type: "x" }).success).toBe(false);
  });
  it("rechaza lat/lng no numéricos", () => {
    expect(trafficCameraSchema.safeParse({ ...validCamera, lat: "" }).success).toBe(false);
  });
});

describe("MEDELLIN_CAMERAS seed", () => {
  it("tiene puntos y todos con coordenadas válidas dentro de Medellín", () => {
    expect(MEDELLIN_CAMERAS.length).toBeGreaterThan(40);
    for (const c of MEDELLIN_CAMERAS) {
      expect(typeof c.lat).toBe("number");
      expect(typeof c.lng).toBe("number");
      expect(c.lat).toBeGreaterThanOrEqual(BBOX.minLat);
      expect(c.lat).toBeLessThanOrEqual(BBOX.maxLat);
      expect(c.lng).toBeGreaterThanOrEqual(BBOX.minLng);
      expect(c.lng).toBeLessThanOrEqual(BBOX.maxLng);
      expect(CAMERA_TYPES).toContain(c.type);
    }
  });
  it("usa ids únicos", () => {
    const ids = new Set(MEDELLIN_CAMERAS.map((c) => c.id));
    expect(ids.size).toBe(MEDELLIN_CAMERAS.length);
  });
});

describe("cameras data layer (mock)", () => {
  beforeEach(() => resetMockDB());

  it("lista las cámaras sembradas", async () => {
    const all = await listCameras();
    expect(all.length).toBe(MEDELLIN_CAMERAS.length);
  });

  it("crea, edita y borra (soft-delete)", async () => {
    const created = await createCamera({
      name: "Punto de prueba",
      type: "semaforo_rojo",
      lat: 6.25,
      lng: -75.56,
      zone: null,
      max_speed_kmh: null,
      approximate: true,
      source: null,
      notes: null,
    });
    expect(created.id).toBeTruthy();
    expect(await getCamera(created.id)).not.toBeNull();

    const updated = await updateCamera(created.id, { name: "Punto editado" });
    expect(updated?.name).toBe("Punto editado");

    const ok = await deleteCamera(created.id);
    expect(ok).toBe(true);
    expect(await getCamera(created.id)).toBeNull();
  });
});
