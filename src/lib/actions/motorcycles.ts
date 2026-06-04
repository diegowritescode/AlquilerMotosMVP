"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  motorcycleSchema,
  motorcycleExpirationsSchema,
  formToObject,
} from "@/lib/schemas";
import {
  createMotorcycle,
  deleteMotorcycle,
  getMotorcycle,
  updateMotorcycle,
} from "@/lib/data/motorcycles";
import { recordAudit } from "@/lib/data/audit";
import { type ActionState, parseErrors } from "./shared";

export async function createMotorcycleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = motorcycleSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const moto = await createMotorcycle(parsed.data);
  await recordAudit({
    entityType: "motorcycle",
    entityId: moto.id,
    action: "crear",
    after: { plate: moto.plate, status: moto.current_status },
  });
  revalidatePath("/app/motorcycles");
  redirect(`/app/motorcycles/${moto.id}`);
}

export async function updateMotorcycleAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = motorcycleSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const before = await getMotorcycle(id);
  const moto = await updateMotorcycle(id, parsed.data);
  if (!moto) return { error: "Moto no encontrada." };

  await recordAudit({
    entityType: "motorcycle",
    entityId: id,
    action: before?.current_status !== moto.current_status ? "cambiar_estado" : "editar",
    before: before ? { status: before.current_status } : null,
    after: { status: moto.current_status },
  });
  revalidatePath("/app/motorcycles");
  revalidatePath(`/app/motorcycles/${id}`);
  redirect(`/app/motorcycles/${id}`);
}

/** Update ONLY the document/expiration dates (intuitive "renovar" from detail). */
export async function updateMotorcycleExpirationsAction(
  id: string,
  _prev: ActionState & { success?: boolean },
  formData: FormData,
): Promise<ActionState & { success?: boolean }> {
  const parsed = motorcycleExpirationsSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const moto = await updateMotorcycle(id, parsed.data);
  if (!moto) return { error: "Moto no encontrada." };
  await recordAudit({
    entityType: "motorcycle",
    entityId: id,
    action: "actualizar_vencimientos",
  });
  revalidatePath(`/app/motorcycles/${id}`);
  revalidatePath("/app/expirations");
  revalidatePath("/app/dashboard");
  return { success: true };
}

export async function deleteMotorcycleAction(id: string): Promise<void> {
  const before = await getMotorcycle(id);
  await deleteMotorcycle(id);
  await recordAudit({
    entityType: "motorcycle",
    entityId: id,
    action: "eliminar",
    before: before ? { plate: before.plate } : null,
  });
  revalidatePath("/app/motorcycles");
  redirect("/app/motorcycles");
}
