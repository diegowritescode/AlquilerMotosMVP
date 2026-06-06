"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { trafficCameraSchema, formToObject } from "@/lib/schemas";
import { createCamera, updateCamera, deleteCamera } from "@/lib/data/cameras";
import { recordAudit } from "@/lib/data/audit";
import { type ActionState, parseErrors } from "./shared";

const LIST = "/app/fines/cameras";

export async function createCameraAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = trafficCameraSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const camera = await createCamera(parsed.data);
  await recordAudit({
    entityType: "traffic_camera",
    entityId: camera.id,
    action: "registrar",
    after: { name: camera.name, type: camera.type },
  });
  revalidatePath(LIST);
  revalidatePath("/app/fines");
  redirect(LIST);
}

export async function updateCameraAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = trafficCameraSchema.safeParse(formToObject(formData));
  if (!parsed.success) return parseErrors(parsed.error);

  const camera = await updateCamera(id, parsed.data);
  if (!camera) return { error: "Cámara no encontrada." };
  await recordAudit({ entityType: "traffic_camera", entityId: id, action: "editar" });
  revalidatePath(LIST);
  revalidatePath("/app/fines");
  redirect(LIST);
}

export async function deleteCameraAction(id: string): Promise<void> {
  await deleteCamera(id);
  await recordAudit({ entityType: "traffic_camera", entityId: id, action: "eliminar" });
  revalidatePath(LIST);
  revalidatePath("/app/fines");
  redirect(LIST);
}
