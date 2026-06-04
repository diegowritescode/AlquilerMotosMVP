import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { buildExport, isExportType } from "@/lib/exports";
import { recordAudit } from "@/lib/data/audit";

/**
 * Protected CSV export endpoint. Server-side only; requires a session.
 * GET /app/exports/<type>  ->  text/csv attachment. Metadata only (no files).
 */
export async function GET(
  _req: Request,
  { params }: { params: { type: string } },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (!isExportType(params.type)) {
    return NextResponse.json({ error: "Tipo de exportación inválido" }, { status: 400 });
  }

  const result = await buildExport(params.type, new Date());

  await recordAudit({
    entityType: "export",
    entityId: params.type,
    action: "export_generated",
    actorLabel: session.email,
  });

  return new NextResponse(result.csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${result.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
