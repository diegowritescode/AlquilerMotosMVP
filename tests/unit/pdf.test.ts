import { describe, it, expect } from "vitest";
import { generateRentalContractPdf } from "@/lib/pdf/rental-contract";

const data = {
  businessName: "Moto Rental",
  generatedAtLabel: "04/06/2026 10:00",
  moto: {
    brand: "Bajaj",
    model: "Boxer CT 100",
    plate: "ABC12D",
    cc: 100,
    year: 2022,
    mileage: 28500,
    general_condition: "bueno",
    engine_condition: "bueno",
    tires_condition: "regular",
  },
  customer: {
    full_name: "Juan David Ramírez",
    document_type: "CC",
    document_number: "1234567890",
    phone: "3105551234",
    address: "Cra 50 # 10-25",
    license_number: "1234567890",
    license_category: "A2",
  },
  rental: {
    start_date: "01/05/2026",
    end_date: null,
    agreed_value: 150000,
    payment_frequency: "semanal",
    status: "activo",
    notes: "Pago semanal cada lunes.",
  },
};

describe("generateRentalContractPdf", () => {
  it("genera bytes de un PDF válido", async () => {
    const bytes = await generateRentalContractPdf(data);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(500);
    // Cabecera de archivo PDF: "%PDF-"
    const header = String.fromCharCode(...bytes.slice(0, 5));
    expect(header).toBe("%PDF-");
  });

  it("maneja campos opcionales ausentes sin lanzar", async () => {
    const minimal = {
      ...data,
      customer: { ...data.customer, address: null, license_number: null, license_category: null },
      rental: { ...data.rental, notes: null },
    };
    const bytes = await generateRentalContractPdf(minimal);
    expect(bytes.length).toBeGreaterThan(500);
  });
});
