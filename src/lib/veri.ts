/**
 * Sayfalarin kullandigi veri katmani.
 *
 * Onceden burasi diskteki bir JSON dosyasini okuyordu (Excel yuklenerek
 * doldurulan liste). Artik TEK kaynak ERP'dir: erp.ts uctan listeyi
 * ceker, buradaki fonksiyonlar o listeden marka > kategori > model
 * agacini uretir.
 *
 * Yazma islemi YOKTUR — bu uygulama hicbir veri saklamaz. Kalici disk,
 * yedek, yonetim paneli ve sifre gerekmez; pod her yeniden bastiginda
 * ayni listeyi ERP'den alir.
 */
import { erpVerisiniOku } from "./erp";
import { slugla, temizle } from "./slug";
import { logoYolu } from "./logolar";
import type {
  Ayarlar,
  FiyatSatiri,
  KategoriOzeti,
  MarkaOzeti,
  ModelOzeti,
  ParaBirimi,
  Urun,
} from "./tipler";

/* ------------------------------------------------------------------ */
/* Ayarlar — ortam degiskenlerinden                                     */
/* ------------------------------------------------------------------ */

/**
 * "0", "false", "hayir" gibi degerleri kapali sayar. Bos birakilan
 * degisken varsayilana duser.
 */
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
    sloganMetni:
      process.env.SLOGAN?.trim() ||
      "Marka, kategori ve model seçin; güncel toptan ve perakende fiyatları görün.",
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
     * Musteri isterse USD_KURU verilir, TL karsiligi kucuk punto eklenir.
     */
    usdKuru: Number(process.env.USD_KURU) || 0,
    eurKuru: Number(process.env.EUR_KURU) || 0,
  };
}

/* ------------------------------------------------------------------ */
/* Yardimcilar                                                         */
/* ------------------------------------------------------------------ */

/** Turkce alfabetik siralama */
const trSirala = (a: string, b: string) => a.localeCompare(b, "tr");

/** ERP tum fiyatlari USD tutar */
const PARA: ParaBirimi = "USD";

/** Bir urun kumesinin fiyat araligi (toptan yoksa perakendeye duser) */
function fiyatAraligi(urunler: Urun[]): { enUcuz: number | null; enPahali: number | null } {
  const gecerli = urunler
    .map((u) => u.toptan ?? u.perakende)
    .filter((f): f is number => typeof f === "number" && f > 0);
  if (!gecerli.length) return { enUcuz: null, enPahali: null };
  return { enUcuz: Math.min(...gecerli), enPahali: Math.max(...gecerli) };
}

async function urunleriAl(): Promise<Urun[]> {
  const { urunler } = await erpVerisiniOku();
  return urunler;
}

/* ------------------------------------------------------------------ */
/* Agac                                                                */
/* ------------------------------------------------------------------ */

export async function markalar(): Promise<MarkaOzeti[]> {
  const urunler = await urunleriAl();
  const harita = new Map<
    string,
    { ad: string; kategoriler: Set<string>; modeller: Set<string>; sayi: number }
  >();

  for (const u of urunler) {
    const slug = slugla(u.marka);
    if (!slug) continue;
    let kayit = harita.get(slug);
    if (!kayit) {
      kayit = { ad: u.marka, kategoriler: new Set(), modeller: new Set(), sayi: 0 };
      harita.set(slug, kayit);
    }
    kayit.kategoriler.add(slugla(u.kategori));
    kayit.modeller.add(slugla(u.model));
    kayit.sayi++;
  }

  return [...harita.entries()]
    .map(([slug, k]) => ({
      ad: k.ad,
      slug,
      logo: logoYolu(k.ad),
      kategoriSayisi: k.kategoriler.size,
      modelSayisi: k.modeller.size,
      urunSayisi: k.sayi,
    }))
    .sort((a, b) => b.urunSayisi - a.urunSayisi || trSirala(a.ad, b.ad));
}

export async function markaAdi(markaSlug: string): Promise<string | null> {
  const urunler = await urunleriAl();
  return urunler.find((u) => slugla(u.marka) === markaSlug)?.marka ?? null;
}

export async function kategoriler(markaSlug: string): Promise<KategoriOzeti[]> {
  const urunler = await urunleriAl();
  const harita = new Map<string, { ad: string; modeller: Set<string>; sayi: number }>();

  for (const u of urunler) {
    if (slugla(u.marka) !== markaSlug) continue;
    const slug = slugla(u.kategori);
    if (!slug) continue;
    let kayit = harita.get(slug);
    if (!kayit) {
      kayit = { ad: u.kategori, modeller: new Set(), sayi: 0 };
      harita.set(slug, kayit);
    }
    kayit.modeller.add(slugla(u.model));
    kayit.sayi++;
  }

  return [...harita.entries()]
    .map(([slug, k]) => ({ ad: k.ad, slug, modelSayisi: k.modeller.size, urunSayisi: k.sayi }))
    .sort((a, b) => b.modelSayisi - a.modelSayisi || trSirala(a.ad, b.ad));
}

export async function kategoriAdi(
  markaSlug: string,
  kategoriSlug: string,
): Promise<string | null> {
  const urunler = await urunleriAl();
  return (
    urunler.find((u) => slugla(u.marka) === markaSlug && slugla(u.kategori) === kategoriSlug)
      ?.kategori ?? null
  );
}

export async function modeller(
  markaSlug: string,
  kategoriSlug: string,
): Promise<ModelOzeti[]> {
  const urunler = await urunleriAl();
  const harita = new Map<string, Urun[]>();

  for (const u of urunler) {
    if (slugla(u.marka) !== markaSlug) continue;
    if (slugla(u.kategori) !== kategoriSlug) continue;
    const slug = slugla(u.model);
    if (!slug) continue;
    const liste = harita.get(slug);
    if (liste) liste.push(u);
    else harita.set(slug, [u]);
  }

  return [...harita.entries()]
    .map(([slug, liste]) => ({
      ad: liste[0].model,
      slug,
      cesitSayisi: liste.length,
      paraBirimi: PARA,
      ...fiyatAraligi(liste),
    }))
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr", { numeric: true }));
}

export async function modelAdi(
  markaSlug: string,
  kategoriSlug: string,
  modelSlug: string,
): Promise<string | null> {
  const urunler = await urunleriAl();
  return (
    urunler.find(
      (u) =>
        slugla(u.marka) === markaSlug &&
        slugla(u.kategori) === kategoriSlug &&
        slugla(u.model) === modelSlug,
    )?.model ?? null
  );
}

export async function fiyatlar(
  markaSlug: string,
  kategoriSlug: string,
  modelSlug: string,
): Promise<FiyatSatiri[]> {
  const urunler = await urunleriAl();
  const liste = urunler.filter(
    (u) =>
      slugla(u.marka) === markaSlug &&
      slugla(u.kategori) === kategoriSlug &&
      slugla(u.model) === modelSlug,
  );

  const { enUcuz } = fiyatAraligi(liste);
  return [...liste]
    .sort((a, b) => (b.toptan ?? 0) - (a.toptan ?? 0) || a.sira - b.sira)
    .map((u) => ({ ...u, enUcuzMu: (u.toptan ?? u.perakende) === enUcuz }));
}

/** Ayni modelin diger kategorilerdeki karsiliklari (hizli gecis icin) */
export async function modelinDigerKategorileri(
  markaSlug: string,
  modelSlug: string,
): Promise<{ ad: string; slug: string; adet: number }[]> {
  const urunler = await urunleriAl();
  const harita = new Map<string, { ad: string; adet: number }>();
  for (const u of urunler) {
    if (slugla(u.marka) !== markaSlug || slugla(u.model) !== modelSlug) continue;
    const slug = slugla(u.kategori);
    const kayit = harita.get(slug);
    if (kayit) kayit.adet++;
    else harita.set(slug, { ad: u.kategori, adet: 1 });
  }
  return [...harita.entries()]
    .map(([slug, k]) => ({ slug, ad: k.ad, adet: k.adet }))
    .sort((a, b) => trSirala(a.ad, b.ad));
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

/** Model adina gore arama yapar (marka + model birlesik metinde arar) */
export async function modelAra(sorgu: string, limit = 40): Promise<AramaSonucu[]> {
  const temiz = temizle(sorgu);
  if (temiz.length < 2) return [];

  const parcalar = slugla(temiz).split("-").filter(Boolean);
  const urunler = await urunleriAl();
  const harita = new Map<
    string,
    AramaSonucu & { katHarita: Map<string, { ad: string; adet: number }> }
  >();

  for (const u of urunler) {
    const anahtar = `${slugla(u.marka)}|${slugla(u.model)}`;
    const hedef = `${slugla(u.marka)}-${slugla(u.model)}`;
    if (!parcalar.every((p) => hedef.includes(p))) continue;

    let kayit = harita.get(anahtar);
    if (!kayit) {
      kayit = {
        marka: u.marka,
        markaSlug: slugla(u.marka),
        model: u.model,
        modelSlug: slugla(u.model),
        kategoriler: [],
        cesitSayisi: 0,
        enUcuz: null,
        katHarita: new Map(),
      };
      harita.set(anahtar, kayit);
    }
    kayit.cesitSayisi++;
    const fiyat = u.toptan ?? u.perakende;
    if (typeof fiyat === "number" && fiyat > 0) {
      kayit.enUcuz = kayit.enUcuz === null ? fiyat : Math.min(kayit.enUcuz, fiyat);
    }
    const katSlug = slugla(u.kategori);
    const kat = kayit.katHarita.get(katSlug);
    if (kat) kat.adet++;
    else kayit.katHarita.set(katSlug, { ad: u.kategori, adet: 1 });
  }

  return [...harita.values()]
    .slice(0, limit)
    .map(({ katHarita, ...sonuc }) => ({
      ...sonuc,
      kategoriler: [...katHarita.entries()]
        .map(([slug, k]) => ({ slug, ad: k.ad, adet: k.adet }))
        .sort((a, b) => trSirala(a.ad, b.ad)),
    }))
    .sort(
      (a, b) =>
        trSirala(a.marka, b.marka) ||
        a.model.localeCompare(b.model, "tr", { numeric: true }),
    );
}

/* ------------------------------------------------------------------ */
/* Istatistik                                                          */
/* ------------------------------------------------------------------ */

export async function istatistik() {
  const { urunler, guncellenme, hata } = await erpVerisiniOku();

  const markaKumesi = new Set<string>();
  const kategoriKumesi = new Set<string>();
  const modelKumesi = new Set<string>();

  for (const u of urunler) {
    markaKumesi.add(slugla(u.marka));
    kategoriKumesi.add(slugla(u.kategori));
    modelKumesi.add(`${slugla(u.marka)}|${slugla(u.model)}`);
  }

  return {
    urunSayisi: urunler.length,
    markaSayisi: markaKumesi.size,
    kategoriSayisi: kategoriKumesi.size,
    modelSayisi: modelKumesi.size,
    guncellenmeTarihi: guncellenme,
    /** ERP'ye ulasilamadi — sayfalar bunu kullaniciya soyler */
    erpHatasi: hata,
  };
}
