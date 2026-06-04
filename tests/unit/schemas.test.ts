import { describe, it, expect } from "vitest";
import {
  motorcycleSchema,
  customerSchema,
  rentalSchema,
  paymentSchema,
} from "@/lib/schemas";

const validMoto = {
  brand: "Bajaj",
  model: "Boxer",
  cc: "100",
  year: "2022",
  plate: "abc12d",
  color: "Negro",
  mileage: "15000",
  daily_price: "25000",
  weekly_price: "150000",
  monthly_price: "560000",
  general_condition: "bueno",
  engine_condition: "bueno",
  tires_condition: "bueno",
  current_status: "disponible",
};

describe("motorcycleSchema", () => {
  it("acepta una moto válida y normaliza la placa a mayúsculas", () => {
    const r = motorcycleSchema.safeParse(validMoto);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.plate).toBe("ABC12D");
  });
  it("rechaza marca vacía", () => {
    expect(motorcycleSchema.safeParse({ ...validMoto, brand: "" }).success).toBe(false);
  });
  it("rechaza kilometraje negativo", () => {
    expect(motorcycleSchema.safeParse({ ...validMoto, mileage: "-5" }).success).toBe(false);
  });
  it("rechaza año no razonable", () => {
    expect(motorcycleSchema.safeParse({ ...validMoto, year: "1800" }).success).toBe(false);
  });
});

describe("customerSchema", () => {
  const base = {
    full_name: "Juan",
    document_type: "CC",
    document_number: "123456",
    nationality: "Colombiana",
    phone: "3001234567",
  };
  it("acepta un cliente válido", () => {
    expect(customerSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza nombre vacío", () => {
    expect(customerSchema.safeParse({ ...base, full_name: "" }).success).toBe(false);
  });
  it("rechaza documento corto", () => {
    expect(customerSchema.safeParse({ ...base, document_number: "1" }).success).toBe(false);
  });
});

describe("rentalSchema", () => {
  const base = {
    customer_id: "c1",
    motorcycle_id: "m1",
    start_date: "2024-05-01",
    agreed_value: "150000",
    payment_frequency: "semanal",
    status: "activo",
  };
  it("acepta un alquiler válido", () => {
    expect(rentalSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza sin arrendatario", () => {
    expect(rentalSchema.safeParse({ ...base, customer_id: "" }).success).toBe(false);
  });
});

describe("paymentSchema", () => {
  const base = {
    customer_id: "c1",
    amount: "150000",
    method: "efectivo",
    status: "pagado",
  };
  it("acepta un pago válido (alquiler opcional)", () => {
    expect(paymentSchema.safeParse(base).success).toBe(true);
  });
  it("rechaza monto negativo", () => {
    expect(paymentSchema.safeParse({ ...base, amount: "-100" }).success).toBe(false);
  });
  it("rechaza sin arrendatario", () => {
    expect(paymentSchema.safeParse({ ...base, customer_id: "" }).success).toBe(false);
  });
});
