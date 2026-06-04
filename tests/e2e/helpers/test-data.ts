import { E2E } from "./env";

/**
 * Factories for E2E test data. Every record is prefixed with E2E_TEST_PREFIX
 * (default "E2E") so the cleanup step can find and remove ONLY test rows.
 */

const PREFIX = E2E.prefix;

/** Short unique-ish token (timestamp tail + random) for this value. */
function token(): string {
  const ts = Date.now().toString().slice(-6);
  const rnd = Math.floor(Math.random() * 900 + 100); // 3 digits
  return `${ts}${rnd}`;
}

export function uniquePlate(): string {
  // Plate column is free text; keep it prefixed and unique.
  return `${PREFIX}${token()}`.slice(0, 12);
}

export function motorcycleData(overrides: Partial<Record<string, string>> = {}) {
  return {
    brand: `${PREFIX} Boxer`,
    model: "CT 100 Test",
    cc: "100",
    year: "2022",
    plate: uniquePlate(),
    color: "Negro",
    mileage: "15000",
    daily_price: "25000",
    weekly_price: "150000",
    monthly_price: "560000",
    current_status: "disponible",
    ...overrides,
  };
}

export function customerData(overrides: Partial<Record<string, string>> = {}) {
  const t = token();
  return {
    full_name: `${PREFIX} Cliente ${t}`,
    document_number: `${PREFIX}${t}`,
    nationality: "Colombiana",
    phone: "3001234567",
    ...overrides,
  };
}

/** Today / relative dates as yyyy-MM-dd for date inputs. */
export function isoDate(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export const PREFIX_VALUE = PREFIX;
