import { sablonUret } from "@/lib/excel";

export const dynamic = "force-dynamic";

export async function GET() {
  const govde = await sablonUret();
  return new Response(new Uint8Array(govde), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="fiyat-listesi-sablon.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
