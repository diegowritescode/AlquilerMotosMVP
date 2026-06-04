"use server";

import { revalidatePath } from "next/cache";
import { businessSettingsSchema, formToObject } from "@/lib/schemas";
import { updateBusinessSettings } from "@/lib/data/business-settings";
import { recordAudit } from "@/lib/data/audit";
import { type ActionState, parseErrors } from "./shared";

export async function updateBusinessSettingsAction(
  _prev: ActionState & { success?: boolean },
  formData: FormData,
): Promise<ActionState & { success?: boolean }> {
  const parsed = businessSettingsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  try {
    const saved = await updateBusinessSettings(parsed.data);
    await recordAudit({
      entityType: "business_settings",
      entityId: saved.id ?? "single",
      action: "business_settings_updated",
      after: { business_name: saved.business_name },
    });
  } catch (err) {
    console.error("[business-settings] update error:", err);
    return { error: "No se pudo guardar la configuración." };
  }

  revalidatePath("/app/settings/business");
  revalidatePath("/app/settings");
  return { success: true };
}
