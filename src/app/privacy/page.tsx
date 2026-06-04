import { LegalPage, LegalSection } from "@/components/app/legal-page";
import { BUSINESS_NAME } from "@/lib/constants";

export const metadata = { title: "Política de privacidad" };

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de tratamiento de datos personales">
      <p>
        En {BUSINESS_NAME} tratamos datos personales con fines exclusivamente
        operativos relacionados con el alquiler de motocicletas. Esta política
        resume cómo recolectamos, usamos y protegemos esa información, en línea
        con la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.
      </p>

      <LegalSection title="1. Datos que recolectamos">
        <p>
          Nombre, documento de identidad, fecha de nacimiento, teléfono,
          dirección, licencia de conducción, fotografías de documentos,
          historial de alquileres, pagos e incidentes asociados al servicio.
        </p>
      </LegalSection>

      <LegalSection title="2. Finalidad">
        <p>
          Identificar al arrendatario, gestionar el alquiler, controlar pagos y
          vencimientos, registrar mantenimientos e infracciones, y mantener la
          trazabilidad operativa del negocio.
        </p>
      </LegalSection>

      <LegalSection title="3. Uso de documentos y fotografías">
        <p>
          Las fotografías de documentos y de la moto se utilizan únicamente como
          evidencia del proceso de alquiler. Se almacenan de forma privada y con
          acceso restringido al administrador del negocio.
        </p>
      </LegalSection>

      <LegalSection title="4. Conservación y seguridad">
        <p>
          La información se conserva mientras exista relación operativa y por el
          tiempo exigido por la ley. Aplicamos controles de acceso, eliminación
          lógica de registros y respaldo periódico.
        </p>
      </LegalSection>

      <LegalSection title="5. Derechos del titular (Habeas Data)">
        <p>
          El titular puede conocer, actualizar, rectificar y solicitar la
          supresión de sus datos, así como revocar la autorización, escribiendo
          a los canales de contacto del negocio.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
