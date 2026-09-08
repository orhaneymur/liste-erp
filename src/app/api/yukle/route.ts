import { NextResponse } from "next/server";
import { dosyayiOku } from "@/lib/excel";
import { oturumVarMi } from "@/lib/oturum";
import { ayarlarOku, istatistik, veriYaz, yedekAl } from "@/lib/veri";

export const dynamic = "force-dynamic";

/** 25 MB ustu dosya kabul edilmez */
const AZAMI_BOYUT = 25 * 1024 * 1024;

export async function POST(istek: Request) {
  if (!(await oturumVarMi())) {
    return NextResponse.json({ hata: "Oturum geçersiz. Tekrar giriş yapın." }, { status: 401 });
  }

  let dosya: File | null = null;
  try {
    const form = await istek.formData();
    const alan = form.get("dosya");
    if (alan instanceof File) dosya = alan;
  } catch {
    return NextResponse.json({ hata: "Dosya okunamadı." }, { status: 400 });
  }

  if (!dosya) {
    return NextResponse.json({ hata: "Dosya seçilmedi." }, { status: 400 });
  }
  if (dosya.size > AZAMI_BOYUT) {
    return NextResponse.json({ hata: "Dosya 25 MB'dan büyük olamaz." }, { status: 413 });
  }

  // ERP'den inen stok dosyasinda "Para Birimi" kolonu yoktur; fiyatlarin
  // hangi birimde oldugu site ayarindan gelir (Shenzhen icin USD).
  const ayarlar = ayarlarOku();
  const sonuc = await dosyayiOku(
    await dosya.arrayBuffer(),
    dosya.name,
    ayarlar.varsayilanParaBirimi,
  );

  if (sonuc.hatalar.length || !sonuc.urunler.length) {
    return NextResponse.json(
      {
        hata: sonuc.hatalar[0] ?? "Dosyada geçerli satır bulunamadı.",
        hatalar: sonuc.hatalar,
        uyarilar: sonuc.uyarilar,
      },
      { status: 422 },
    );
  }

  yedekAl();
  veriYaz(sonuc.urunler, dosya.name);

  return NextResponse.json({
    tamam: true,
    eklenen: sonuc.urunler.length,
    okunanSatir: sonuc.toplamSatir,
    atlanan: sonuc.atlananSatir,
    uyarilar: sonuc.uyarilar,
    istatistik: istatistik(),
  });
}
