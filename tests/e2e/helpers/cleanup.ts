import { getTestDbClient } from "./supabase-admin";
import { E2E } from "./env";

/**
 * Safe cleanup of E2E-created rows ONLY.
 *
 * Hard guards prevent destructive runs:
 *   - refuse if NODE_ENV=production or VERCEL_ENV=production
 *   - refuse unless E2E_ALLOW_DB_CLEANUP=true
 *   - no-op (warn) in demo mode (no test DB client)
 *
 * It NEVER truncates and only deletes rows whose prefixed columns match
 * E2E_TEST_PREFIX, plus their dependent rows (fines/payments/maintenance/
 * rentals belonging to those E2E motos/customers).
 */
async function delIn(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  table: string,
  column: string,
  ids: string[],
): Promise<number> {
  if (ids.length === 0) return 0;
  const { error, count } = await db
    .from(table)
    .delete({ count: "exact" })
    .in(column, ids);
  if (error) {
    console.warn(`[cleanup] ${table}.${column}: ${error.message}`);
    return 0;
  }
  return count ?? 0;
}

export interface CleanupResult {
  ran: boolean;
  reason?: string;
  deleted?: Record<string, number>;
}

export async function cleanupE2EData(): Promise<CleanupResult> {
  if (process.env.NODE_ENV === "production") {
    throw new Error("[cleanup] Bloqueado: NODE_ENV=production.");
  }
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("[cleanup] Bloqueado: VERCEL_ENV=production.");
  }
  if (!E2E.allowCleanup) {
    return { ran: false, reason: "E2E_ALLOW_DB_CLEANUP no es 'true'." };
  }

  const db = getTestDbClient();
  if (!db) {
    return { ran: false, reason: "Sin cliente de DB (modo demo)." };
  }

  const p = `${E2E.prefix}%`;

  // Identify E2E motos & customers by prefixed columns.
  const { data: motos } = await db
    .from("motorcycles")
    .select("id")
    .or(`plate.ilike.${p},brand.ilike.${p}`);
  const motoIds: string[] = (motos ?? []).map((m: { id: string }) => m.id);

  const { data: custs } = await db
    .from("customers")
    .select("id")
    .or(`document_number.ilike.${p},full_name.ilike.${p}`);
  const custIds: string[] = (custs ?? []).map((c: { id: string }) => c.id);

  // Rentals that belong to those motos or customers.
  const rentalIds = new Set<string>();
  if (motoIds.length) {
    const { data } = await db.from("rentals").select("id").in("motorcycle_id", motoIds);
    (data ?? []).forEach((r: { id: string }) => rentalIds.add(r.id));
  }
  if (custIds.length) {
    const { data } = await db.from("rentals").select("id").in("customer_id", custIds);
    (data ?? []).forEach((r: { id: string }) => rentalIds.add(r.id));
  }
  const rentalIdList = Array.from(rentalIds);

  const deleted: Record<string, number> = {};
  // Order respects FKs: leaf tables first.
  deleted.fines =
    (await delIn(db, "fines", "motorcycle_id", motoIds)) +
    (await delIn(db, "fines", "customer_id", custIds));
  deleted.payments =
    (await delIn(db, "payments", "rental_id", rentalIdList)) +
    (await delIn(db, "payments", "customer_id", custIds));
  deleted.maintenance_records = await delIn(db, "maintenance_records", "motorcycle_id", motoIds);
  deleted.rentals = await delIn(db, "rentals", "id", rentalIdList);
  deleted.customers = await delIn(db, "customers", "id", custIds);
  deleted.motorcycles = await delIn(db, "motorcycles", "id", motoIds);
  deleted.audit_logs = await delIn(db, "audit_logs", "entity_id", [
    ...motoIds,
    ...custIds,
    ...rentalIdList,
  ]);

  return { ran: true, deleted };
}
