"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { customerSchema, formToObject } from "@/lib/schemas";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/lib/data/customers";
import { recordAudit } from "@/lib/data/audit";
import { type ActionState, parseErrors } from "./shared";

export async function createCustomerAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = customerSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const customer = await createCustomer(parsed.data);
  await recordAudit({
    entityType: "customer",
    entityId: customer.id,
    action: "crear",
    after: { name: customer.full_name, document: customer.document_number },
  });
  revalidatePath("/app/customers");
  redirect(`/app/customers/${customer.id}`);
}

export async function updateCustomerAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = customerSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const customer = await updateCustomer(id, parsed.data);
  if (!customer) return { error: "Cliente no encontrado." };
  await recordAudit({
    entityType: "customer",
    entityId: id,
    action: "editar",
    after: { name: customer.full_name },
  });
  revalidatePath("/app/customers");
  revalidatePath(`/app/customers/${id}`);
  redirect(`/app/customers/${id}`);
}

export async function deleteCustomerAction(id: string): Promise<void> {
  await deleteCustomer(id);
  await recordAudit({ entityType: "customer", entityId: id, action: "eliminar" });
  revalidatePath("/app/customers");
  redirect("/app/customers");
}
