import type { AuditLog } from "../types";
import { uuid } from "../utils";
import { getMockDB } from "../mock/store";
import { getDataClient, unwrap } from "./db";

const TABLE = "audit_logs";

/**
 * Centralized audit helper (whitepaper §16.3). Records critical actions to the
 * `audit_logs` table (Supabase) or the in-memory store (demo).
 *
 * Audit failures must never break the user action, so the Supabase insert is
 * best-effort and swallows errors (logged to the server console).
 */
export async function recordAudit(params: {
  entityType: string;
  entityId: string;
  action: string;
  actorLabel?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}): Promise<void> {
  const supabase = getDataClient();
  if (!supabase) return recordAuditMock(params);

  try {
    await supabase.from(TABLE).insert({
      actor_id: null,
      actor_label: params.actorLabel ?? "Administrador",
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      before_data: params.before ?? null,
      after_data: params.after ?? null,
    });
  } catch (err) {
    console.error("[audit] no se pudo registrar la acción:", err);
  }
}

export async function listAuditLogs(limit = 50): Promise<AuditLog[]> {
  const supabase = getDataClient();
  if (!supabase) return listAuditLogsMock(limit);
  const res = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return unwrap(res, "listAuditLogs") as AuditLog[];
}

// ---------------------------------------------------------------------------
// Demo (in-memory) fallback
// ---------------------------------------------------------------------------

function recordAuditMock(params: {
  entityType: string;
  entityId: string;
  action: string;
  actorLabel?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}): void {
  const db = getMockDB();
  const entry: AuditLog = {
    id: uuid(),
    actor_id: null,
    actor_label: params.actorLabel ?? "Propietario (demo)",
    entity_type: params.entityType,
    entity_id: params.entityId,
    action: params.action,
    before_data: params.before ?? null,
    after_data: params.after ?? null,
    created_at: new Date().toISOString(),
  };
  db.auditLogs.unshift(entry);
}

function listAuditLogsMock(limit: number): AuditLog[] {
  const db = getMockDB();
  return db.auditLogs.slice(0, limit);
}
