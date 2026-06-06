"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { maintenanceSchema, formToObject } from "@/lib/schemas";
import { MAINTENANCE_STATUSES, type MaintenanceStatus } from "@/lib/types";
import { createMaintenance, updateMaintenance } from "@/lib/data/maintenance";
import { recordAudit } from "@/lib/data/audit";
import { type ActionState, parseErrors } from "./shared";

export async function createMaintenanceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = maintenanceSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const record = await createMaintenance(parsed.data);
  await recordAudit({
    entityType: "maintenance",
    entityId: record.id,
    action: "registrar",
    after: { type: record.type, motorcycle_id: record.motorcycle_id },
  });
  revalidatePath("/app/maintenance");
  revalidatePath(`/app/motorcycles/${record.motorcycle_id}`);
  redirect("/app/maintenance");
}

export async function updateMaintenanceAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = maintenanceSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const record = await updateMaintenance(id, parsed.data);
  if (!record) return { error: "Mantenimiento no encontrado." };
  await recordAudit({ entityType: "maintenance", entityId: id, action: "editar" });
  revalidatePath("/app/maintenance");
  revalidatePath(`/app/motorcycles/${record.motorcycle_id}`);
  revalidatePath("/app/dashboard");
  redirect("/app/maintenance");
}

/** Quick inline status change (e.g. "ya se hizo"). Returns a plain result, no redirect. */
export async function updateMaintenanceStatusAction(
  id: string,
  status: string,
): Promise<{ ok?: boolean; error?: string }> {
  if (!MAINTENANCE_STATUSES.includes(status as MaintenanceStatus)) {
    return { error: "Estado inválido." };
  }
  const record = await updateMaintenance(id, { status: status as MaintenanceStatus });
  if (!record) return { error: "Mantenimiento no encontrado." };
  await recordAudit({
    entityType: "maintenance",
    entityId: id,
    action: "cambiar_estado",
    after: { status },
  });
  revalidatePath("/app/maintenance");
  revalidatePath(`/app/motorcycles/${record.motorcycle_id}`);
  revalidatePath("/app/dashboard");
  return { ok: true };
}
