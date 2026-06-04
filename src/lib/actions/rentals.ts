"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { rentalSchema, formToObject } from "@/lib/schemas";
import {
  changeRentalStatus,
  createRental,
  finalizeRental,
  getRental,
  hasActiveRental,
  updateRental,
} from "@/lib/data/rentals";
import type { RentalStatus } from "@/lib/types";
import { recordAudit } from "@/lib/data/audit";
import { type ActionState, parseErrors } from "./shared";

export async function createRentalAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = rentalSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  // Business rule: prevent two active rentals on the same motorcycle.
  if (
    parsed.data.status === "activo" &&
    (await hasActiveRental(parsed.data.motorcycle_id))
  ) {
    return {
      error: "Esta moto ya tiene un alquiler activo. Finaliza el actual primero.",
    };
  }

  const rental = await createRental(parsed.data);
  await recordAudit({
    entityType: "rental",
    entityId: rental.id,
    action: "crear",
    after: { status: rental.status, motorcycle_id: rental.motorcycle_id },
  });
  revalidatePath("/app/rentals");
  revalidatePath("/app/motorcycles");
  redirect(`/app/rentals/${rental.id}`);
}

export async function updateRentalAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = rentalSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  if (
    parsed.data.status === "activo" &&
    (await hasActiveRental(parsed.data.motorcycle_id, id))
  ) {
    return { error: "Esta moto ya tiene otro alquiler activo." };
  }

  const before = await getRental(id);
  const rental = await updateRental(id, parsed.data);
  if (!rental) return { error: "Alquiler no encontrado." };
  await recordAudit({
    entityType: "rental",
    entityId: id,
    action: before?.status !== rental.status ? "cambiar_estado" : "editar",
    before: before ? { status: before.status } : null,
    after: { status: rental.status },
  });
  revalidatePath("/app/rentals");
  revalidatePath(`/app/rentals/${id}`);
  revalidatePath("/app/motorcycles");
  redirect(`/app/rentals/${id}`);
}

export async function finalizeRentalAction(formData: FormData): Promise<void> {
  const id = String(formData.get("rental_id") ?? "");
  const next = String(formData.get("next_motorcycle_status") ?? "disponible") as
    | "disponible"
    | "mantenimiento";
  if (!id) return;
  await finalizeRental(id, next);
  await recordAudit({
    entityType: "rental",
    entityId: id,
    action: "finalizar",
    after: { next_motorcycle_status: next },
  });
  revalidatePath("/app/rentals");
  revalidatePath(`/app/rentals/${id}`);
  revalidatePath("/app/motorcycles");
  redirect(`/app/rentals/${id}`);
}

export async function changeRentalStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("rental_id") ?? "");
  const status = String(formData.get("status") ?? "") as RentalStatus;
  if (!id || !status) return;
  await changeRentalStatus(id, status);
  await recordAudit({
    entityType: "rental",
    entityId: id,
    action: "cambiar_estado",
    after: { status },
  });
  revalidatePath("/app/rentals");
  revalidatePath(`/app/rentals/${id}`);
  revalidatePath("/app/motorcycles");
  redirect(`/app/rentals/${id}`);
}
