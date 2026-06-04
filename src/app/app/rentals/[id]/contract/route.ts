import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getRental } from "@/lib/data/rentals";
import { getMotorcycle } from "@/lib/data/motorcycles";
import { latestRentalContract } from "@/lib/data/rental-contracts";
import { downloadServer, STORAGE_BUCKETS } from "@/lib/storage-server";

/**
 * Descarga del acta PDF DESDE LA APP (no desde Supabase). Protegida por sesión.
 * Sirve el archivo privado con Content-Disposition: attachment usando el
 * cliente service-role en servidor (nunca expuesto al cliente).
 */
export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const rental = await getRental(params.id);
  if (!rental) {
    return NextResponse.json({ error: "Alquiler no encontrado" }, { status: 404 });
  }

  const contract = await latestRentalContract(params.id);
  if (!contract) {
    return NextResponse.json(
      { error: "Este alquiler aún no tiene acta generada." },
      { status: 404 },
    );
  }

  const bytes = await downloadServer(STORAGE_BUCKETS.rentalContracts, contract.file_path);
  if (!bytes) {
    return NextResponse.json(
      { error: "No se pudo descargar el acta (¿Storage configurado?)." },
      { status: 502 },
    );
  }

  const moto = await getMotorcycle(rental.motorcycle_id);
  const plate = moto?.plate ? `-${moto.plate}` : "";
  const fileName = `acta${plate}-v${contract.version}.pdf`;

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
