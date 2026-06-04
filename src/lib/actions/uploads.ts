"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { STORAGE_BUCKETS } from "@/lib/storage";
import {
  uploadServer,
  uploadBytesServer,
  removeServer,
} from "@/lib/storage-server";
import { validateUploadFile } from "@/lib/upload";
import { getMotorcycle } from "@/lib/data/motorcycles";
import { getCustomer } from "@/lib/data/customers";
import { getPayment, updatePayment } from "@/lib/data/payments";
import { getFine, updateFine } from "@/lib/data/fines";
import { getRental } from "@/lib/data/rentals";
import {
  createRentalEvidence,
  deleteRentalEvidence,
  type RentalEvidenceType,
} from "@/lib/data/rental-evidence";
import {
  createRentalContract,
  listRentalContracts,
} from "@/lib/data/rental-contracts";
import { generateRentalContractPdf } from "@/lib/pdf/rental-contract";
import { getBusinessSettings } from "@/lib/data/business-settings";
import { formatDate } from "@/lib/utils";
import {
  createMotorcyclePhoto,
  deleteMotorcyclePhoto,
} from "@/lib/data/motorcycle-photos";
import {
  createCustomerDocument,
  deleteCustomerDocument,
} from "@/lib/data/customer-documents";
import { recordAudit } from "@/lib/data/audit";

export interface UploadState {
  error?: string;
  success?: boolean;
}

/** Pull and server-validate the file from a FormData payload. */
function readFile(formData: FormData): { file?: File; error?: string } {
  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return { error: "Selecciona un archivo." };
  }
  const result = validateUploadFile(file as File);
  if (!result.ok) return { error: result.error };
  return { file: file as File };
}

// ---------------------------------------------------------------------------
// Motorcycle photos
// ---------------------------------------------------------------------------

export async function uploadMotorcyclePhotoAction(
  motorcycleId: string,
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const moto = await getMotorcycle(motorcycleId);
  if (!moto) return { error: "Moto no encontrada." };

  const { file, error } = readFile(formData);
  if (error || !file) return { error };

  const up = await uploadServer(STORAGE_BUCKETS.motorcyclePhotos, file, motorcycleId);
  if (!up.ok || !up.path) return { error: up.error ?? "No se pudo subir la foto." };

  await createMotorcyclePhoto({ motorcycle_id: motorcycleId, file_url: up.path });
  await recordAudit({
    entityType: "motorcycle",
    entityId: motorcycleId,
    action: "subir_foto",
  });
  revalidatePath(`/app/motorcycles/${motorcycleId}`);
  return { success: true };
}

export async function deleteMotorcyclePhotoAction(
  motorcycleId: string,
  photoId: string,
  path: string,
): Promise<void> {
  await removeServer(STORAGE_BUCKETS.motorcyclePhotos, path);
  await deleteMotorcyclePhoto(photoId);
  await recordAudit({
    entityType: "motorcycle",
    entityId: motorcycleId,
    action: "eliminar_foto",
  });
  revalidatePath(`/app/motorcycles/${motorcycleId}`);
}

// ---------------------------------------------------------------------------
// Customer documents
// ---------------------------------------------------------------------------

export async function uploadCustomerDocumentAction(
  customerId: string,
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const customer = await getCustomer(customerId);
  if (!customer) return { error: "Cliente no encontrado." };

  const type = String(formData.get("type") ?? "otro");
  const { file, error } = readFile(formData);
  if (error || !file) return { error };

  const up = await uploadServer(
    STORAGE_BUCKETS.customerDocuments,
    file,
    customerId,
  );
  if (!up.ok || !up.path) return { error: up.error ?? "No se pudo subir el documento." };

  await createCustomerDocument({ customer_id: customerId, type, file_url: up.path });
  await recordAudit({
    entityType: "customer",
    entityId: customerId,
    action: "subir_documento",
    after: { type },
  });
  revalidatePath(`/app/customers/${customerId}`);
  return { success: true };
}

export async function deleteCustomerDocumentAction(
  customerId: string,
  docId: string,
  path: string,
): Promise<void> {
  await removeServer(STORAGE_BUCKETS.customerDocuments, path);
  await deleteCustomerDocument(docId);
  await recordAudit({
    entityType: "customer",
    entityId: customerId,
    action: "eliminar_documento",
  });
  revalidatePath(`/app/customers/${customerId}`);
}

// ---------------------------------------------------------------------------
// Payment evidence (single file on the row's evidence_url)
// ---------------------------------------------------------------------------

export async function uploadPaymentEvidenceAction(
  paymentId: string,
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const payment = await getPayment(paymentId);
  if (!payment) return { error: "Pago no encontrado." };

  const { file, error } = readFile(formData);
  if (error || !file) return { error };

  const up = await uploadServer(STORAGE_BUCKETS.paymentEvidence, file, paymentId);
  if (!up.ok || !up.path) return { error: up.error ?? "No se pudo subir el comprobante." };

  await updatePayment(paymentId, { evidence_url: up.path });
  await recordAudit({
    entityType: "payment",
    entityId: paymentId,
    action: "subir_comprobante",
  });
  revalidatePath(`/app/payments/${paymentId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Fine evidence (single file on the row's evidence_url)
// ---------------------------------------------------------------------------

export async function uploadFineEvidenceAction(
  fineId: string,
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const fine = await getFine(fineId);
  if (!fine) return { error: "Multa no encontrada." };

  const { file, error } = readFile(formData);
  if (error || !file) return { error };

  const up = await uploadServer(STORAGE_BUCKETS.fineEvidence, file, fineId);
  if (!up.ok || !up.path) return { error: up.error ?? "No se pudo subir la evidencia." };

  await updateFine(fineId, { evidence_url: up.path });
  await recordAudit({
    entityType: "fine",
    entityId: fineId,
    action: "subir_evidencia",
  });
  revalidatePath(`/app/fines/${fineId}`);
  return { success: true };
}

// ---------------------------------------------------------------------------
// Rental evidence (delivery / return)
// ---------------------------------------------------------------------------

export async function uploadRentalEvidenceAction(
  rentalId: string,
  type: RentalEvidenceType,
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const rental = await getRental(rentalId);
  if (!rental) return { error: "Alquiler no encontrado." };

  const { file, error } = readFile(formData);
  if (error || !file) return { error };

  const up = await uploadServer(
    STORAGE_BUCKETS.rentalEvidence,
    file,
    `${rentalId}/${type}`,
  );
  if (!up.ok || !up.path) return { error: up.error ?? "No se pudo subir la evidencia." };

  await createRentalEvidence({
    rental_id: rentalId,
    type,
    file_path: up.path,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
  });
  await recordAudit({
    entityType: "rental",
    entityId: rentalId,
    action: "rental_evidence_uploaded",
    after: { type },
  });
  revalidatePath(`/app/rentals/${rentalId}`);
  return { success: true };
}

export async function deleteRentalEvidenceAction(
  rentalId: string,
  evidenceId: string,
  path: string,
): Promise<void> {
  await removeServer(STORAGE_BUCKETS.rentalEvidence, path);
  await deleteRentalEvidence(evidenceId);
  await recordAudit({
    entityType: "rental",
    entityId: rentalId,
    action: "rental_evidence_deleted",
  });
  revalidatePath(`/app/rentals/${rentalId}`);
}

// ---------------------------------------------------------------------------
// Rental contract (acta PDF)
// ---------------------------------------------------------------------------

export async function generateRentalContractAction(
  rentalId: string,
  _prev: UploadState,
  _formData: FormData,
): Promise<UploadState> {
  const rental = await getRental(rentalId);
  if (!rental) return { error: "Alquiler no encontrado." };
  const [moto, customer] = await Promise.all([
    getMotorcycle(rental.motorcycle_id),
    getCustomer(rental.customer_id),
  ]);
  if (!moto || !customer) {
    return { error: "Faltan datos de la moto o el arrendatario." };
  }

  const [existing, settings] = await Promise.all([
    listRentalContracts(rentalId),
    getBusinessSettings(),
  ]);
  const version = (existing[0]?.version ?? 0) + 1;

  let bytes: Uint8Array;
  try {
    bytes = await generateRentalContractPdf({
      business: {
        name: settings.business_name,
        ownerName: settings.owner_name,
        ownerDocument: settings.owner_document,
        city: settings.city,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
      },
      customTerms: settings.contract_terms_text,
      generatedAtLabel: format(new Date(), "dd/MM/yyyy HH:mm"),
      moto: {
        brand: moto.brand,
        model: moto.model,
        plate: moto.plate,
        cc: moto.cc,
        year: moto.year,
        mileage: moto.mileage,
        general_condition: moto.general_condition,
        engine_condition: moto.engine_condition,
        tires_condition: moto.tires_condition,
      },
      customer: {
        full_name: customer.full_name,
        document_type: customer.document_type,
        document_number: customer.document_number,
        phone: customer.phone,
        address: customer.address,
        license_number: customer.license_number,
        license_category: customer.license_category,
      },
      rental: {
        start_date: formatDate(rental.start_date),
        end_date: rental.end_date ? formatDate(rental.end_date) : null,
        agreed_value: rental.agreed_value,
        payment_frequency: rental.payment_frequency,
        status: rental.status,
        notes: rental.notes,
      },
    });
  } catch (err) {
    console.error("[contract] error generando PDF:", err);
    return { error: "No se pudo generar el PDF." };
  }

  const up = await uploadBytesServer(
    STORAGE_BUCKETS.rentalContracts,
    bytes,
    `acta-v${version}.pdf`,
    "application/pdf",
    rentalId,
  );
  if (!up.ok || !up.path) {
    return { error: up.error ?? "No se pudo guardar el acta." };
  }

  await createRentalContract({
    rental_id: rentalId,
    file_path: up.path,
    file_name: `acta-v${version}.pdf`,
    version,
  });
  await recordAudit({
    entityType: "rental",
    entityId: rentalId,
    action: version > 1 ? "rental_contract_regenerated" : "rental_contract_generated",
    after: { version },
  });
  revalidatePath(`/app/rentals/${rentalId}`);
  return { success: true };
}
