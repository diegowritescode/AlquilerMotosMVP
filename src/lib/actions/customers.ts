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
import { createCustomerDocument } from "@/lib/data/customer-documents";
import { uploadServer } from "@/lib/storage-server";
import { STORAGE_BUCKETS } from "@/lib/storage";
import { validateUploadFile } from "@/lib/upload";
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

  // Optional license photo uploaded with the create form (best-effort: never
  // blocks customer creation; in demo mode / sin Storage simplemente se omite).
  const file = formData.get("license_file");
  if (file && typeof file !== "string" && file.size > 0) {
    const valid = validateUploadFile(file as File);
    if (valid.ok) {
      try {
        const up = await uploadServer(
          STORAGE_BUCKETS.customerDocuments,
          file as File,
          customer.id,
        );
        if (up.ok && up.path) {
          await createCustomerDocument({
            customer_id: customer.id,
            type: "licencia",
            file_url: up.path,
          });
        }
      } catch (err) {
        console.error("[customers] no se pudo subir la licencia:", err);
      }
    }
  }

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
