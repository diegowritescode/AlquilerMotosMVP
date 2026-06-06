import { PageHeader } from "@/components/app/page-header";
import { CameraForm } from "../camera-form";
import { createCameraAction } from "@/lib/actions/cameras";

export const metadata = { title: "Agregar cámara" };

export default function NewCameraPage() {
  return (
    <div>
      <PageHeader title="Agregar cámara" backHref="/app/fines/cameras" />
      <CameraForm action={createCameraAction} submitLabel="Agregar cámara" />
    </div>
  );
}
