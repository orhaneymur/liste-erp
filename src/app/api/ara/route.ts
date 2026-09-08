import { NextResponse } from "next/server";
import { modelAra } from "@/lib/veri";

/*
 * Model arama ucu. Sonuc sorguya bagli oldugu icin onbelleklenmez.
 *
 * DIKKAT: modelAra async'dir. await unutulursa NextResponse.json bir
 * Promise'i serilestirmeye calisir; arama kutusu bos doner ve sayfa
 * "yuklenemedi" hatasi verir. TypeScript bunu YAKALAMAZ, cunku
 * NextResponse.json her turu kabul eder — 8 Eylul 2026'da tam olarak
 * bu sekilde gozden kacti.
 */
export const dynamic = "force-dynamic";

export async function GET(istek: Request) {
  const { searchParams } = new URL(istek.url);
  const sorgu = searchParams.get("q") ?? "";

  try {
    const sonuclar = await modelAra(sorgu);
    return NextResponse.json({ sonuclar });
  } catch (sebep) {
    // ERP'ye ulasilamazsa arama "bulunamadi" desin, sayfa cokmesin
    console.error("Arama basarisiz:", sebep);
    return NextResponse.json({ sonuclar: [] });
  }
}
