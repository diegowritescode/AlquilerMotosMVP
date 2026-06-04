import { LegalPage, LegalSection } from "@/components/app/legal-page";
import { BUSINESS_NAME } from "@/lib/constants";

export const metadata = { title: "Términos y condiciones" };

export default function TermsPage() {
  return (
    <LegalPage title="Términos y condiciones del alquiler">
      <p>
        Estos términos regulan el alquiler de motocicletas ofrecido por{" "}
        {BUSINESS_NAME}. Al firmar el acuerdo de alquiler, el arrendatario
        acepta las condiciones aquí descritas.
      </p>

      <LegalSection title="1. Objeto del servicio">
        <p>
          {BUSINESS_NAME} entrega en alquiler una motocicleta en buen estado de
          funcionamiento, con sus documentos vigentes, para uso lícito por parte
          del arrendatario.
        </p>
      </LegalSection>

      <LegalSection title="2. Pagos">
        <p>
          El arrendatario se compromete a pagar el valor acordado según la
          frecuencia pactada (diaria, semanal o mensual). El incumplimiento en
          los pagos puede generar la suspensión del servicio y la recuperación
          de la moto.
        </p>
      </LegalSection>

      <LegalSection title="3. Multas e infracciones">
        <p>
          El arrendatario es responsable de las infracciones de tránsito,
          fotomultas y comparendos generados durante el periodo de alquiler. El
          valor de dichas multas será asumido por el arrendatario salvo acuerdo
          expreso en contrario.
        </p>
      </LegalSection>

      <LegalSection title="4. Daños y mantenimiento">
        <p>
          El mantenimiento preventivo es gestionado por {BUSINESS_NAME}. Los
          daños ocasionados por mal uso, accidentes o negligencia son
          responsabilidad del arrendatario.
        </p>
      </LegalSection>

      <LegalSection title="5. Devolución">
        <p>
          La moto debe devolverse en las mismas condiciones de entrega, salvo el
          desgaste normal por uso. Se documentará el estado al entregar y al
          recibir.
        </p>
      </LegalSection>

      <LegalSection title="6. Finalidad del sistema">
        <p>
          Esta plataforma es una herramienta de gestión y trazabilidad. No
          sustituye la asesoría legal ni las plataformas oficiales de tránsito
          (SIMIT, RUNT).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
