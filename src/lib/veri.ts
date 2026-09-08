/**
 * Sayfalarin kullandigi veri katmani.
 *
 * Butun agir is erp.ts'te bir kez yapilir (indeks kurma); buradaki
 * fonksiyonlar hazir Map'lerden okur. Hicbiri listeyi TARAMAZ —
 * eskiden her cagri 5152 urunu bastan geziyordu ve bir model sayfasi
 * bunu dokuz kez yapiyordu.
 */
import { listeyiAl } from "./erp";
import { slugla, temizle } from "./slug";
import type {
  Ayarlar,
  FiyatSatiri,
  KategoriOzeti,
  MarkaOzeti,
  ModelOzeti,
} from "./tipler";

/* ------------------------------------------------------------------ */
/* Ayarlar — ortam degiskenlerinden                                     */
/* ------------------------------------------------------------------ */

/** "0", "false", "hayir" kapali sayilir; bos degisken varsayilana duser */
const evetMi = (deger: string | undefined, varsayilan: boolean): boolean => {
  if (deger === undefined || deger.trim() === "") return varsayilan;
  return !["0", "false", "hayir", "hayır", "kapali", "kapalı"].includes(
    deger.trim().toLowerCase(),
  );
};

/**
 * Musteriye ozel gorunum ayarlari. Kubernetes'te ConfigMap'ten ortam
 * degiskeni olarak gelir; degistirmek icin imaj derlemek gerekmez.
 * Bos birakilan alan sayfada hic gorunmez.
 */
export function ayarlarOku(): Ayarlar {
  return {
    firmaAdi: process.env.FIRMA_ADI?.trim() || "Fiyat Listesi",
    sloganMetni: process.env.SLOGAN?.trim() || "",
    telefon: process.env.TELEFON?.trim() || "",
    whatsapp: process.env.WHATSAPP?.trim() || "",
    eposta: process.env.EPOSTA?.trim() || "",
    adres: process.env.ADRES?.trim() || "",
    uyariMetni:
      process.env.UYARI?.trim() ||
      "Fiyatlar bilgilendirme amaçlıdır, stok durumuna göre değişebilir. Sipariş öncesi teyit alınması gerekir.",
    toptanGoster: evetMi(process.env.TOPTAN_GOSTER, true),
    perakendeGoster: evetMi(process.env.PERAKENDE_GOSTER, true),
    kdvDahil: evetMi(process.env.KDV_DAHIL, false),
    kdvOrani: Number(process.env.KDV_ORANI) || 20,
    /*
     * Kurlar 0: fiyatlar USD gosterilir, TL karsiligi YAZILMAZ. Elle
     * guncellenen bir kur eskidiginde sessizce yanlis fiyat gostermesin.
     */
    usdKuru: Number(process.env.USD_KURU) || 0,
    eurKuru: Number(process.env.EUR_KURU) || 0,
  };
}

/* ------------------------------------------------------------------ */
/* Agac — hepsi hazir indeksten                                        */
/* ------------------------------------------------------------------ */

export async function markalar(): Promise<MarkaOzeti[]> {
  return (await listeyiAl()).markalar;
}

export async function markaAdi(markaSlug: string): Promise<string | null> {
  return (await listeyiAl()).markaAdi.get(markaSlug) ?? null;
}

export async function kategoriler(markaSlug: string): Promise<KategoriOzeti[]> {
  return (await listeyiAl()).kategoriler.get(markaSlug) ?? [];
}

export async function kategoriAdi(
  markaSlug: string,
  kategoriSlug: string,
): Promise<string | null> {
  const liste = await listeyiAl();
  return liste.kategoriler.get(markaSlug)?.find((k) => k.slug === kategoriSlug)?.ad ?? null;
}

export async function modeller(
  markaSlug: string,
  kategoriSlug: string,
): Promise<ModelOzeti[]> {
  return (await listeyiAl()).modeller.get(`${markaSlug}/${kategoriSlug}`) ?? [];
}

export async function modelAdi(
  markaSlug: string,
  kategoriSlug: string,
  modelSlug: string,
): Promise<string | null> {
  const liste = await listeyiAl();
  return (
    liste.modeller.get(`${markaSlug}/${kategoriSlug}`)?.find((m) => m.slug === modelSlug)?.ad ??
    null
  );
}

export async function fiyatlar(
  markaSlug: string,
  kategoriSlug: string,
  modelSlug: string,
): Promise<FiyatSatiri[]> {
  return (await listeyiAl()).satirlar.get(`${markaSlug}/${kategoriSlug}/${modelSlug}`) ?? [];
}

/** Ayni modelin diger kategorilerdeki karsiliklari (hizli gecis icin) */
export async function modelinDigerKategorileri(
  markaSlug: string,
  modelSlug: string,
): Promise<{ ad: string; slug: string; adet: number }[]> {
  return (await listeyiAl()).modelKategorileri.get(`${markaSlug}/${modelSlug}`) ?? [];
}

/* ------------------------------------------------------------------ */
/* Arama                                                               */
/* ------------------------------------------------------------------ */

export interface AramaSonucu {
  marka: string;
  markaSlug: string;
  model: string;
  modelSlug: string;
  kategoriler: { ad: string; slug: string; adet: number }[];
  cesitSayisi: number;
  enUcuz: number | null;
}

/**
 * Model adina gore arama. Arama kayitlari indekste hazir duruyor
 * (her model bir kayit, ~1500 tane); burada yalnizca metin eslemesi
 * yapilir — urun listesi taranmaz.
 */
export async function modelAra(sorgu: string, limit = 40): Promise<AramaSonucu[]> {
  const temiz = temizle(sorgu);
  if (temiz.length < 2) return [];

  const parcalar = slugla(temiz).split("-").filter(Boolean);
  if (!parcalar.length) return [];

  const liste = await listeyiAl();
  const sonuclar: AramaSonucu[] = [];

  for (const kayit of liste.aramaKayitlari) {
    if (!parcalar.every((p) => kayit.hedef.includes(p))) continue;
    sonuclar.push({
      marka: kayit.marka,
      markaSlug: kayit.markaSlug,
      model: kayit.model,
      modelSlug: kayit.modelSlug,
      kategoriler: kayit.kategoriler,
      cesitSayisi: kayit.cesitSayisi,
      enUcuz: kayit.enUcuz,
    });
    if (sonuclar.length >= limit) break;
  }

  return sonuclar;
}

/* ------------------------------------------------------------------ */
/* Istatistik                                                          */
/* ------------------------------------------------------------------ */

export async function istatistik() {
  const liste = await listeyiAl();
  return {
    urunSayisi: liste.sayilar.urun,
    markaSayisi: liste.sayilar.marka,
    kategoriSayisi: liste.sayilar.kategori,
    modelSayisi: liste.sayilar.model,
    guncellenmeTarihi: liste.guncellenme,
    /** ERP'ye ulasilamadi — sayfalar bunu kullaniciya soyler */
    erpHatasi: liste.hata,
  };
}
