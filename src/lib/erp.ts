/**
 * ERP baglantisi — fiyat listesinin TEK veri kaynagi.
 *
 * Bu uygulama kendi veritabanini tutmaz, Excel yuklenmez, yonetim paneli
 * yoktur. Butun urunler musterinin ERP'sinden gelir; ERP'de fiyat
 * degistigi anda liste de degisir.
 *
 * Cagirilan uc: GET /api/public/fiyat-listesi
 * Kimlik dogrulamasi istemez (ERP tarafinda bilerek acik birakilan tek
 * veri ucudur) ve yalnizca yayinlanabilir alanlari dondurur: maliyet,
 * RMB fiyati ve stok adedi ERP'nin sorgusunda hic yer almaz.
 *
 * Adres nereden gelir:
 *   ERP_API_URL   Kubernetes'te ayni namespace'teki ERP backend'i —
 *                 http://teknikerp-backend:3000
 *                 Servis adi tum musterilerde ayni oldugu icin bu deger
 *                 genelde hic degistirilmez.
 */
import type { ApiUrun, ApiYanit, Urun } from "./tipler";
import { temizle, slugla } from "./slug";

const ERP_TABAN = process.env.ERP_API_URL?.trim() || "http://teknikerp-backend:3000";
const UC = `${ERP_TABAN.replace(/\/+$/, "")}/api/public/fiyat-listesi`;

/**
 * Liste ne siklikla tazelensin (saniye).
 *
 * ERP ucu zaten kendi icinde bir dakika onbellek tutuyor; burada da ayni
 * sureyi kullaniyoruz. Fiyat degisikliginin siteye yansimasi en fazla iki
 * dakika surer, buna karsilik her ziyaretci icin ERP'ye gidilmez.
 */
const TAZELEME_SANIYE = Number(process.env.LISTE_TAZELEME_SANIYE) || 60;

export interface ErpVerisi {
  urunler: Urun[];
  guncellenme: string | null;
  /** ERP'ye ulasilamadiysa true — sayfa "liste su an acilamadi" der */
  hata: boolean;
}

const BOS: ErpVerisi = { urunler: [], guncellenme: null, hata: true };

/**
 * Satirin musteriye gorunen adi: kalite, gorunum ve renk tek metinde
 * birlesir. Birlestirmezsek ayni modelin siyah ve kirmizi arka kapagi
 * listede iki kez ayni adla gorunur.
 */
function satirAdi(u: ApiUrun): string {
  const parcalar: string[] = [];
  for (const deger of [u.kalite, u.gorunum, u.renk]) {
    const temizDeger = temizle(deger);
    if (!temizDeger) continue;
    if (parcalar.some((v) => slugla(v) === slugla(temizDeger))) continue;
    parcalar.push(temizDeger);
  }
  return parcalar.join(" · ") || "Standart";
}

/** ERP'den fiyat listesini ceker. Ulasilamazsa bos liste + hata bayragi. */
export async function erpVerisiniOku(): Promise<ErpVerisi> {
  try {
    const cevap = await fetch(UC, { next: { revalidate: TAZELEME_SANIYE } });
    if (!cevap.ok) throw new Error(`fiyat-listesi ${cevap.status}`);

    const veri = (await cevap.json()) as ApiYanit;
    const kayitlar = Array.isArray(veri.urunler) ? veri.urunler : [];

    return {
      urunler: kayitlar.map((u, sira) => ({
        marka: temizle(u.marka),
        kategori: temizle(u.kategori),
        model: temizle(u.model),
        kalite: satirAdi(u),
        stokKodu: temizle(u.kod) || undefined,
        toptan: u.toptan,
        perakende: u.perakende,
        // ERP butun fiyatlari USD tutar; cevrim yapilmaz
        paraBirimi: "USD" as const,
        /*
         * ERP adet vermez, yalnizca var/yok. Musterinin musterisine lazim
         * olan tek sey "simdi alabilir miyim" sorusunun cevabi; kac adet
         * oldugu ticari bilgidir.
         */
        stok: u.stokVar ? "Var" : "Yok",
        sira,
      })),
      guncellenme: veri.guncellenme ?? null,
      hata: false,
    };
  } catch (sebep) {
    console.error("ERP fiyat listesi okunamadi:", sebep);
    return BOS;
  }
}
