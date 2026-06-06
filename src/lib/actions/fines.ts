"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fineSchema, formToObject } from "@/lib/schemas";
import { FINE_STATUSES, type FineStatus } from "@/lib/types";
import { createFine, updateFine } from "@/lib/data/fines";
import { rentalForMotorcycleOnDate } from "@/lib/data/rentals";
import { recordAudit } from "@/lib/data/audit";
import { type ActionState, parseErrors } from "./shared";

export async function createFineAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = fineSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const data = { ...parsed.data };

  // Suggestion rule (whitepaper §14.3): if no responsible customer was chosen,
  // try to infer it from the active rental for that moto on the fine date.
  // NOTE: Official lookups (SIMIT/RUNT) are MANUAL — we never scrape them.
  if (!data.customer_id) {
    const rental = await rentalForMotorcycleOnDate(data.motorcycle_id, data.date);
    if (rental) {
      data.customer_id = rental.customer_id;
      data.rental_id = rental.id;
    }
  }

  const fine = await createFine(data);
  await recordAudit({
    entityType: "fine",
    entityId: fine.id,
    action: "registrar",
    after: { amount: fine.amount, motorcycle_id: fine.motorcycle_id },
  });
  revalidatePath("/app/fines");
  redirect(`/app/fines/${fine.id}`);
}

export async function updateFineAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = fineSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const fine = await updateFine(id, parsed.data);
  if (!fine) return { error: "Multa no encontrada." };
  await recordAudit({ entityType: "fine", entityId: id, action: "editar" });
  revalidatePath("/app/fines");
  revalidatePath(`/app/fines/${id}`);
  redirect(`/app/fines/${id}`);
}

/** Quick inline status change (no full form). Returns a plain result, no redirect. */
export async function updateFineStatusAction(
  id: string,
  status: string,
): Promise<{ ok?: boolean; error?: string }> {
  if (!FINE_STATUSES.includes(status as FineStatus)) {
    return { error: "Estado inválido." };
  }
  const fine = await updateFine(id, { status: status as FineStatus });
  if (!fine) return { error: "Multa no encontrada." };
  await recordAudit({
    entityType: "fine",
    entityId: id,
    action: "cambiar_estado",
    after: { status },
  });
  revalidatePath("/app/fines");
  revalidatePath(`/app/fines/${id}`);
  revalidatePath(`/app/motorcycles/${fine.motorcycle_id}`);
  revalidatePath("/app/dashboard");
  return { ok: true };
}
