import { NextResponse } from "next/server";
import { disaAktar } from "@/lib/excel";
import { oturumVarMi } from "@/lib/oturum";
import { veriOku } from "@/lib/veri";

export const dynamic = "force-dynamic";

/** Yayindaki listeyi Excel olarak indirir (yonetici) */
export async function GET() {
  if (!(await oturumVarMi())) {
    return NextResponse.json({ hata: "Yetkisiz erişim." }, { status: 401 });
  }

  const { urunler } = veriOku();
  const govde = await disaAktar(urunler);
  const damga = new Date().toISOString().slice(0, 10);

  return new Response(new Uint8Array(govde), {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="fiyat-listesi-${damga}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
