import { getBusinessSettings } from "@/lib/data/business-settings";
import { PageHeader } from "@/components/app/page-header";
import { BusinessForm } from "./business-form";

export const metadata = { title: "Configuración del negocio" };

export default async function BusinessSettingsPage() {
  const settings = await getBusinessSettings();
  return (
    <div>
      <PageHeader
        title="Configuración del negocio"
        subtitle="Datos usados en el acta PDF y la operación interna"
        backHref="/app/settings"
      />
      <BusinessForm settings={settings} />
    </div>
  );
}
