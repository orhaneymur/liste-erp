import fs from "node:fs";
import path from "node:path";
import { slugla, temizle } from "./slug";
import { logoYolu } from "./logolar";
import { ornekUrunler } from "./ornek-veri";
import type {
  Ayarlar,
  FiyatSatiri,
  KategoriOzeti,
  MarkaOzeti,
  ModelOzeti,
  ParaBirimi,
  Urun,
  VeriTabani,
} from "./tipler";

/* ------------------------------------------------------------------ */
/* Dosya yollari                                                       */
/* ------------------------------------------------------------------ */

const VERI_KLASORU = process.env.VERI_KLASORU
  ? path.resolve(process.env.VERI_KLASORU)
  : path.join(process.cwd(), "veri");

const FIYAT_DOSYASI = path.join(VERI_KLASORU, "fiyatlar.json");
const AYAR_DOSYASI = path.join(VERI_KLASORU, "ayarlar.json");

export const VARSAYILAN_AYARLAR: Ayarlar = {
  firmaAdi: "Telefon Yedek Parça",
  sloganMetni: "Güncel toptan ve perakende parça fiyatları",
  telefon: "",
  whatsapp: "",
  eposta: "",
  adres: "",
  uyariMetni:
    "Fiyatlar bilgilendirme amaçlıdır, stok durumuna göre değişebilir. Sipariş öncesi teyit alınması gerekir.",
  perakendeGoster: true,
  toptanGoster: true,
  kdvDahil: false,
  kdvOrani: 20,
  varsayilanParaBirimi: "USD",
  usdKuru: 0,
  eurKuru: 0,
};

function klasorHazirla() {
  if (!fs.existsSync(VERI_KLASORU)) {
    fs.mkdirSync(VERI_KLASORU, { recursive: true });
  }
}

/* ------------------------------------------------------------------ */
/* Onbellek (dosya degismedikce tekrar okumaz)                         */
/* ------------------------------------------------------------------ */

let fiyatOnbellek: { mtime: number; veri: VeriTabani } | null = null;
let ayarOnbellek: { mtime: number; veri: Ayarlar } | null = null;

/* ------------------------------------------------------------------ */
/* Okuma / yazma                                                       */
/* ------------------------------------------------------------------ */

export function veriOku(): VeriTabani {
  klasorHazirla();

  // Dosya yoksa ornek veri ile olustur
  if (!fs.existsSync(FIYAT_DOSYASI)) {
    const baslangic: VeriTabani = {
      urunler: ornekUrunler(),
      guncellenmeTarihi: new Date().toISOString(),
      kaynakDosya: "ornek-liste",
    };
    fs.writeFileSync(FIYAT_DOSYASI, JSON.stringify(baslangic), "utf8");
    fiyatOnbellek = { mtime: fs.statSync(FIYAT_DOSYASI).mtimeMs, veri: baslangic };
    return baslangic;
  }

  const mtime = fs.statSync(FIYAT_DOSYASI).mtimeMs;
  if (fiyatOnbellek && fiyatOnbellek.mtime === mtime) return fiyatOnbellek.veri;

  try {
    const veri = JSON.parse(fs.readFileSync(FIYAT_DOSYASI, "utf8")) as VeriTabani;
    veri.urunler ??= [];
    fiyatOnbellek = { mtime, veri };
    return veri;
  } catch {
    return { urunler: [], guncellenmeTarihi: null, kaynakDosya: null };
  }
}

export function veriYaz(urunler: Urun[], kaynakDosya: string | null): VeriTabani {
  klasorHazirla();
  const veri: VeriTabani = {
    urunler,
    guncellenmeTarihi: new Date().toISOString(),
    kaynakDosya,
  };
  fs.writeFileSync(FIYAT_DOSYASI, JSON.stringify(veri), "utf8");
  fiyatOnbellek = { mtime: fs.statSync(FIYAT_DOSYASI).mtimeMs, veri };
  return veri;
}

export function ayarlarOku(): Ayarlar {
  klasorHazirla();
  if (!fs.existsSync(AYAR_DOSYASI)) return { ...VARSAYILAN_AYARLAR };

  const mtime = fs.statSync(AYAR_DOSYASI).mtimeMs;
  if (ayarOnbellek && ayarOnbellek.mtime === mtime) return ayarOnbellek.veri;

  try {
    const kayitli = JSON.parse(fs.readFileSync(AYAR_DOSYASI, "utf8")) as Partial<Ayarlar>;
    const veri = { ...VARSAYILAN_AYARLAR, ...kayitli };
    ayarOnbellek = { mtime, veri };
    return veri;
  } catch {
    return { ...VARSAYILAN_AYARLAR };
  }
}

export function ayarlarYaz(yeni: Partial<Ayarlar>): Ayarlar {
  klasorHazirla();
  const veri = { ...ayarlarOku(), ...yeni };
  fs.writeFileSync(AYAR_DOSYASI, JSON.stringify(veri, null, 2), "utf8");
  ayarOnbellek = { mtime: fs.statSync(AYAR_DOSYASI).mtimeMs, veri };
  return veri;
}

/** Yedek olarak son yuklenen listeyi saklar (ustune yazmadan once cagirilir) */
export function yedekAl(): string | null {
  if (!fs.existsSync(FIYAT_DOSYASI)) return null;
  klasorHazirla();
  const yedekKlasoru = path.join(VERI_KLASORU, "yedekler");
  if (!fs.existsSync(yedekKlasoru)) fs.mkdirSync(yedekKlasoru, { recursive: true });

  const damga = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const hedef = path.join(yedekKlasoru, `fiyatlar-${damga}.json`);
  fs.copyFileSync(FIYAT_DOSYASI, hedef);

  // en fazla 20 yedek tut
  const yedekler = fs
    .readdirSync(yedekKlasoru)
    .filter((d) => d.endsWith(".json"))
    .sort();
  for (const eski of yedekler.slice(0, Math.max(0, yedekler.length - 20))) {
    fs.rmSync(path.join(yedekKlasoru, eski), { force: true });
  }
  return hedef;
}

/* ------------------------------------------------------------------ */
/* Sorgular - marka / kategori / model / fiyat                         */
/* ------------------------------------------------------------------ */

/** Listede en cok kullanilan para birimini bulur */
function baskinParaBirimi(urunler: Urun[]): ParaBirimi {
  const sayac = new Map<ParaBirimi, number>();
  for (const u of urunler) sayac.set(u.paraBirimi, (sayac.get(u.paraBirimi) ?? 0) + 1);
  let baskin: ParaBirimi = "TRY";
  let enCok = -1;
  for (const [birim, adet] of sayac) {
    if (adet > enCok) {
      baskin = birim;
      enCok = adet;
    }
  }
  return baskin;
}

/**
 * Fiyat araligini hesaplar.
 * Farkli para birimleri karisiksa sadece baskin para biriminin fiyatlari
 * karsilastirilir; boylece 45 USD ile 35 TL yan yana kiyaslanmis olmaz.
 */
function fiyatlariTopla(urunler: Urun[]): {
  enUcuz: number | null;
  enPahali: number | null;
  paraBirimi: ParaBirimi;
} {
  const paraBirimi = baskinParaBirimi(urunler);
  const gecerli = urunler
    .filter((u) => u.paraBirimi === paraBirimi)
    .map((u) => u.toptan ?? u.perakende)
    .filter((f): f is number => typeof f === "number" && f > 0);

  if (!gecerli.length) return { enUcuz: null, enPahali: null, paraBirimi };
  return { enUcuz: Math.min(...gecerli), enPahali: Math.max(...gecerli), paraBirimi };
}

/** Turkce alfabetik siralama */
const trSirala = (a: string, b: string) => a.localeCompare(b, "tr");

export function markalar(): MarkaOzeti[] {
  const { urunler } = veriOku();
  const harita = new Map<string, { ad: string; kategoriler: Set<string>; modeller: Set<string>; sayi: number }>();

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

export function markaAdi(markaSlug: string): string | null {
  const { urunler } = veriOku();
  const bulunan = urunler.find((u) => slugla(u.marka) === markaSlug);
  return bulunan ? bulunan.marka : null;
}

export function kategoriler(markaSlug: string): KategoriOzeti[] {
  const { urunler } = veriOku();
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
    .map(([slug, k]) => ({
      ad: k.ad,
      slug,
      modelSayisi: k.modeller.size,
      urunSayisi: k.sayi,
    }))
    .sort((a, b) => b.modelSayisi - a.modelSayisi || trSirala(a.ad, b.ad));
}

export function kategoriAdi(markaSlug: string, kategoriSlug: string): string | null {
  const { urunler } = veriOku();
  const bulunan = urunler.find(
    (u) => slugla(u.marka) === markaSlug && slugla(u.kategori) === kategoriSlug,
  );
  return bulunan ? bulunan.kategori : null;
}

export function modeller(markaSlug: string, kategoriSlug: string): ModelOzeti[] {
  const { urunler } = veriOku();
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
    .map(([slug, liste]) => {
      const { enUcuz, enPahali, paraBirimi } = fiyatlariTopla(liste);
      return { ad: liste[0].model, slug, cesitSayisi: liste.length, enUcuz, enPahali, paraBirimi };
    })
    .sort((a, b) => a.ad.localeCompare(b.ad, "tr", { numeric: true }));
}

export function modelAdi(
  markaSlug: string,
  kategoriSlug: string,
  modelSlug: string,
): string | null {
  const { urunler } = veriOku();
  const bulunan = urunler.find(
    (u) =>
      slugla(u.marka) === markaSlug &&
      slugla(u.kategori) === kategoriSlug &&
      slugla(u.model) === modelSlug,
  );
  return bulunan ? bulunan.model : null;
}

export function fiyatlar(
  markaSlug: string,
  kategoriSlug: string,
  modelSlug: string,
): FiyatSatiri[] {
  const { urunler } = veriOku();
  const liste = urunler.filter(
    (u) =>
      slugla(u.marka) === markaSlug &&
      slugla(u.kategori) === kategoriSlug &&
      slugla(u.model) === modelSlug,
  );

  const { enUcuz, paraBirimi } = fiyatlariTopla(liste);
  return liste
    .sort((a, b) => (b.toptan ?? 0) - (a.toptan ?? 0) || a.sira - b.sira)
    .map((u) => ({
      ...u,
      enUcuzMu: u.paraBirimi === paraBirimi && (u.toptan ?? u.perakende) === enUcuz,
    }));
}

/** Ayni modelin diger kategorilerdeki karsiliklarini dondurur (hizli gecis icin) */
export function modelinDigerKategorileri(
  markaSlug: string,
  modelSlug: string,
): { ad: string; slug: string; adet: number }[] {
  const { urunler } = veriOku();
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
export function modelAra(sorgu: string, limit = 40): AramaSonucu[] {
  const temiz = temizle(sorgu);
  if (temiz.length < 2) return [];

  const parcalar = slugla(temiz).split("-").filter(Boolean);
  const { urunler } = veriOku();
  const harita = new Map<string, AramaSonucu & { katHarita: Map<string, { ad: string; adet: number }> }>();

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
    .sort((a, b) => trSirala(a.marka, b.marka) || a.model.localeCompare(b.model, "tr", { numeric: true }));
}

/* ------------------------------------------------------------------ */
/* Istatistik                                                          */
/* ------------------------------------------------------------------ */

export function istatistik() {
  const { urunler, guncellenmeTarihi, kaynakDosya } = veriOku();
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
    guncellenmeTarihi,
    kaynakDosya,
  };
}
