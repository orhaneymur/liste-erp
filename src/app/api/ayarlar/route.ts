import { NextResponse } from "next/server";
import { oturumVarMi } from "@/lib/oturum";
import { ayarlarOku, ayarlarYaz } from "@/lib/veri";
import type { Ayarlar } from "@/lib/tipler";

export const dynamic = "force-dynamic";

function metin(deger: unknown, azamiUzunluk = 300): string {
  return String(deger ?? "").slice(0, azamiUzunluk).trim();
}

function sayi(deger: unknown, enAz: number, enCok: number, varsayilan: number): number {
  const cevrilen = Number(deger);
  if (!Number.isFinite(cevrilen)) return varsayilan;
  return Math.min(enCok, Math.max(enAz, cevrilen));
}

export async function POST(istek: Request) {
  if (!(await oturumVarMi())) {
    return NextResponse.json({ hata: "Oturum geçersiz. Tekrar giriş yapın." }, { status: 401 });
  }

  let govde: Record<string, unknown>;
  try {
    govde = (await istek.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ hata: "Geçersiz istek." }, { status: 400 });
  }

  const temiz: Partial<Ayarlar> = {};
  const varsa = (alan: string) => Object.hasOwn(govde, alan);

  // Sadece gonderilen alanlar guncellenir, digerleri oldugu gibi kalir
  if (varsa("firmaAdi")) temiz.firmaAdi = metin(govde.firmaAdi, 80) || "Telefon Yedek Parça";
  if (varsa("sloganMetni")) temiz.sloganMetni = metin(govde.sloganMetni, 200);
  if (varsa("telefon")) temiz.telefon = metin(govde.telefon, 40);
  if (varsa("whatsapp")) temiz.whatsapp = metin(govde.whatsapp, 40);
  if (varsa("eposta")) temiz.eposta = metin(govde.eposta, 80);
  if (varsa("adres")) temiz.adres = metin(govde.adres, 160);
  if (varsa("uyariMetni")) temiz.uyariMetni = metin(govde.uyariMetni, 400);
  if (varsa("perakendeGoster")) temiz.perakendeGoster = Boolean(govde.perakendeGoster);
  if (varsa("toptanGoster")) temiz.toptanGoster = Boolean(govde.toptanGoster);
  if (varsa("kdvDahil")) temiz.kdvDahil = Boolean(govde.kdvDahil);
  if (varsa("kdvOrani")) temiz.kdvOrani = sayi(govde.kdvOrani, 0, 100, 20);
  if (varsa("usdKuru")) temiz.usdKuru = sayi(govde.usdKuru, 0, 100000, 0);
  if (varsa("eurKuru")) temiz.eurKuru = sayi(govde.eurKuru, 0, 100000, 0);

  // Iki fiyat tipi birden kapatilamaz; en az toptan gorunur kalir
  const sonuc = { ...ayarlarOku(), ...temiz };
  if (!sonuc.toptanGoster && !sonuc.perakendeGoster) {
    temiz.toptanGoster = true;
  }

  return NextResponse.json({ tamam: true, ayarlar: ayarlarYaz(temiz) });
}
