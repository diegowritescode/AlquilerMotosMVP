import type {
  AuditLog,
  Customer,
  Fine,
  MaintenanceRecord,
  Motorcycle,
  Payment,
  Rental,
} from "../types";
import { buildSeed } from "./seed";

/**
 * In-memory data store used in DEMO mode (no Supabase credentials).
 *
 * It is seeded once and kept on `globalThis` so it survives Next.js module
 * reloads within a single running server process. Data resets when the server
 * restarts — which is the expected behaviour for a demo. The production path
 * uses Supabase Postgres (see supabase/migrations + docs/database.md).
 */
export interface MockDB {
  motorcycles: Motorcycle[];
  customers: Customer[];
  rentals: Rental[];
  payments: Payment[];
  maintenance: MaintenanceRecord[];
  fines: Fine[];
  auditLogs: AuditLog[];
}

const GLOBAL_KEY = "__MOTO_RENTAL_MOCK_DB__";

type GlobalWithDB = typeof globalThis & { [GLOBAL_KEY]?: MockDB };

export function getMockDB(): MockDB {
  const g = globalThis as GlobalWithDB;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = buildSeed();
  }
  return g[GLOBAL_KEY] as MockDB;
}

/** Test/dev helper to reset the store back to seed data. */
export function resetMockDB(): MockDB {
  const g = globalThis as GlobalWithDB;
  g[GLOBAL_KEY] = buildSeed();
  return g[GLOBAL_KEY] as MockDB;
}
