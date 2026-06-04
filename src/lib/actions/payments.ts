"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { paymentSchema, formToObject } from "@/lib/schemas";
import {
  createPayment,
  markPaymentPaid,
  updatePayment,
} from "@/lib/data/payments";
import { recordAudit } from "@/lib/data/audit";
import { todayISO } from "@/lib/utils";
import { type ActionState, parseErrors } from "./shared";

export async function createPaymentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = paymentSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const payment = await createPayment(parsed.data);
  await recordAudit({
    entityType: "payment",
    entityId: payment.id,
    action: "registrar",
    after: { amount: payment.amount, status: payment.status },
  });
  revalidatePath("/app/payments");
  revalidatePath("/app/dashboard");
  redirect(`/app/payments/${payment.id}`);
}

export async function updatePaymentAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = paymentSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const payment = await updatePayment(id, parsed.data);
  if (!payment) return { error: "Pago no encontrado." };
  await recordAudit({
    entityType: "payment",
    entityId: id,
    action: "editar",
    after: { status: payment.status },
  });
  revalidatePath("/app/payments");
  revalidatePath(`/app/payments/${id}`);
  redirect(`/app/payments/${id}`);
}

/** Mark a pending/overdue payment as paid today. */
export async function markPaidAction(formData: FormData): Promise<void> {
  const id = String(formData.get("payment_id") ?? "");
  if (!id) return;
  await markPaymentPaid(id, todayISO());
  await recordAudit({
    entityType: "payment",
    entityId: id,
    action: "marcar_pagado",
    after: { status: "pagado" },
  });
  revalidatePath("/app/payments");
  revalidatePath(`/app/payments/${id}`);
  revalidatePath("/app/dashboard");
}
