import { notFound } from "next/navigation";
import { getCamera } from "@/lib/data/cameras";
import { updateCameraAction } from "@/lib/actions/cameras";
import { PageHeader } from "@/components/app/page-header";
import { CameraForm } from "../../camera-form";

export const metadata = { title: "Editar cámara" };

export default async function EditCameraPage({
  params,
}: {
  params: { id: string };
}) {
  const camera = await getCamera(params.id);
  if (!camera) notFound();

  const action = updateCameraAction.bind(null, camera.id);

  return (
    <div>
      <PageHeader title="Editar cámara" backHref="/app/fines/cameras" />
      <CameraForm action={action} camera={camera} submitLabel="Guardar cambios" />
    </div>
  );
}
