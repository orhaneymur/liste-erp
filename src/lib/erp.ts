/**
 * ERP baglantisi ve ONBELLEKLI INDEKS.
 *
 * Bu uygulama kendi veritabanini tutmaz; butun urunler musterinin
 * ERP'sinden gelir (GET /api/public/fiyat-listesi).
 *
 * ── Neden indeks? ────────────────────────────────────────────────────
 * Ilk surumde her sayfa fonksiyonu listeyi bastan tariyordu. Bir model
 * sayfasi veri katmanini dokuz kez cagiriyor (ucu generateMetadata'da
 * tekrar) ve her cagri 5152 urunu yeniden isliyordu: ~46.000 kayit
 * donusumu ve yuz binlerce slug hesabi. Ilk bayt 1,4 saniyeydi.
 *
 * Simdi liste BIR KEZ cekilir, sluglari BIR KEZ hesaplanir ve butun
 * agac (marka > kategori > model > fiyat satirlari) onceden kurulmus
 * Map'lere yazilir. Sayfalar tarama yapmaz, hazir kayittan okur.
 *
 * Onbellek surdugu surece (varsayilan 60 sn) ERP'ye de gidilmez.
 */
import type {
  ApiUrun,
  ApiYanit,
  FiyatSatiri,
  KategoriOzeti,
  MarkaOzeti,
  ModelOzeti,
  Urun,
  UyumluBaglanti,
} from "./tipler";
import { sadeMetin, slugla, temizle } from "./slug";
import { logoYolu } from "./logolar";

const ERP_TABAN = process.env.ERP_API_URL?.trim() || "http://teknikerp-backend:3000";
const UC = `${ERP_TABAN.replace(/\/+$/, "")}/api/public/fiyat-listesi`;

/**
 * Liste ne siklikla tazelensin (saniye). ERP ucu da kendi icinde bir
 * dakika onbellek tutar; fiyat degisikligi siteye en gec iki dakikada
 * yansir.
 */
const TAZELEME_SANIYE = Number(process.env.LISTE_TAZELEME_SANIYE) || 60;

/** Urune slug alanlari eklenmis hali — slug BIR KEZ hesaplanir */
export interface IndeksliUrun extends Urun {
  markaSlug: string;
  kategoriSlug: string;
  modelSlug: string;
}

export interface Liste {
  urunler: IndeksliUrun[];
  guncellenme: string | null;
  /** ERP'ye ulasilamadi — sayfalar bunu kullaniciya soyler */
  hata: boolean;

  /* Onceden hesaplanmis agac */
  markalar: MarkaOzeti[];
  markaAdi: Map<string, string>;
  /** markaSlug -> kategoriler */
  kategoriler: Map<string, KategoriOzeti[]>;
  /** "markaSlug/kategoriSlug" -> modeller */
  modeller: Map<string, ModelOzeti[]>;
  /** "markaSlug/kategoriSlug/modelSlug" -> fiyat satirlari */
  satirlar: Map<string, FiyatSatiri[]>;
  /** "markaSlug/modelSlug" -> o modelin diger kategorileri */
  modelKategorileri: Map<string, { ad: string; slug: string; adet: number }[]>;
  /** Arama icin: her model bir kayit */
  aramaKayitlari: AramaKaydi[];

  sayilar: { urun: number; marka: number; kategori: number; model: number };
}

export interface AramaKaydi {
  marka: string;
  markaSlug: string;
  model: string;
  modelSlug: string;
  /** "marka-model" — aramada bu metinde bakilir */
  hedef: string;
  kategoriler: { ad: string; slug: string; adet: number }[];
  cesitSayisi: number;
  enUcuz: number | null;
}

/* ------------------------------------------------------------------ */
/* Yardimcilar                                                         */
/* ------------------------------------------------------------------ */

const trSirala = (a: string, b: string) => a.localeCompare(b, "tr");

/**
 * Satirin musteriye gorunen adi: kalite, gorunum ve renk tek metinde
 * birlesir. Birlestirmezsek ayni modelin siyah ve kirmizi arka kapagi
 * listede iki kez ayni adla gorunur.
 */
/** Stok adi bos gelirse kullanilan yedek: kalite / gorunum / renk */
function satirAdi(u: ApiUrun): string {
  const parcalar: string[] = [];
  for (const deger of [u.kalite, u.gorunum, u.renk]) {
    const temizDeger = temizle(deger);
    if (!temizDeger) continue;
    if (parcalar.some((v) => v.toLowerCase() === temizDeger.toLowerCase())) continue;
    parcalar.push(temizDeger);
  }
  return parcalar.join(" · ") || "Standart";
}

/**
 * Fiyat araligi — YALNIZCA stokta olan urunler sayilir.
 *
 * Karar 8 Eylul 2026: stokta olmayan urunun fiyati musteriye
 * gosterilmiyor. Gosterilmeyen bir fiyat "en uygun" secilemez, aksi
 * halde tabloda fiyati gizli bir satir en uygun isaretlenirdi.
 */
/**
 * Rozet yalnizca stok adinda GECMEYEN kalite bilgisi icin.
 *
 * Stok adi zaten "... CITASIZ BLACK" iceriyorsa ayni bilgiyi ikinci kez
 * yazmak satiri uzatir. Ama "A Kalite" / "Servis Orjinal" gibi degerler
 * stok adinda cogu zaman gecmiyor ve musterinin musterisi asil onu
 * karsilastiriyor — o durumda rozet olarak gosterilir.
 */
function rozetGerekliMi(u: ApiUrun): string | undefined {
  const adSade = sadeMetin(u.ad);
  const parcalar: string[] = [];

  for (const deger of [u.kalite, u.gorunum, u.renk]) {
    const temizDeger = temizle(deger);
    if (!temizDeger) continue;
    if (adSade.includes(sadeMetin(temizDeger))) continue;
    if (parcalar.some((v) => sadeMetin(v) === sadeMetin(temizDeger))) continue;
    parcalar.push(temizDeger);
  }

  return parcalar.length > 0 ? parcalar.join(" · ") : undefined;
}

/**
 * Muadil model adlarini SAYFA YOLUNA cevirir.
 *
 * Musteri "bu parca su modele de uyuyor" yazisini gorunce dogal olarak
 * uzerine basiyor. Rozet duz yaziyken hicbir sey olmuyordu; artik o
 * modelin fiyat sayfasina gidiyor.
 *
 * Hedef secimi — sirasiyla:
 *   1. ayni marka + ayni parca turu  (ekran ariyorsa yine ekran acilsin)
 *   2. ayni marka, herhangi bir tur  (o markada o tur yoksa)
 *   3. baska markadaki ayni model    (nadiren; muadil marka asiyorsa)
 *   4. hicbiri  -> baglanti verilmez, rozet yazi olarak kalir
 *
 * Urunun KENDI modeli listeden atilir: Excel'de cogu satir kendi
 * modelini de uyumlu sutununa yaziyor, kendine baglanti anlamsiz.
 */
function uyumluCoz(
  metin: string | undefined,
  markaSlug: string,
  kategoriSlug: string,
  modelSlug: string,
  modelYollari: Map<string, { markaSlug: string; kategoriSlug: string }[]>,
): UyumluBaglanti[] | undefined {
  if (!metin) return undefined;

  const cikti: UyumluBaglanti[] = [];
  const gorulen = new Set<string>();

  for (const ham of metin.split(",")) {
    const ad = temizle(ham);
    if (!ad) continue;

    const slug = slugla(ad);
    if (!slug || slug === modelSlug) continue;
    if (gorulen.has(slug)) continue;
    gorulen.add(slug);

    const adaylar = modelYollari.get(slug);
    let yol: string | null = null;

    if (adaylar && adaylar.length > 0) {
      const secim =
        adaylar.find((a) => a.markaSlug === markaSlug && a.kategoriSlug === kategoriSlug) ??
        adaylar.find((a) => a.markaSlug === markaSlug) ??
        adaylar[0];
      yol = `/marka/${secim.markaSlug}/${secim.kategoriSlug}/${slug}`;
    }

    cikti.push({ ad, yol });
  }

  return cikti.length > 0 ? cikti : undefined;
}

function fiyatAraligi(urunler: Urun[]): { enUcuz: number | null; enPahali: number | null } {
  let enUcuz: number | null = null;
  let enPahali: number | null = null;
  for (const u of urunler) {
    if (u.stok === "Yok") continue;
    const f = u.toptan ?? u.perakende;
    if (typeof f !== "number" || f <= 0) continue;
    if (enUcuz === null || f < enUcuz) enUcuz = f;
    if (enPahali === null || f > enPahali) enPahali = f;
  }
  return { enUcuz, enPahali };
}

const BOS_LISTE: Liste = {
  urunler: [],
  guncellenme: null,
  hata: true,
  markalar: [],
  markaAdi: new Map(),
  kategoriler: new Map(),
  modeller: new Map(),
  satirlar: new Map(),
  modelKategorileri: new Map(),
  aramaKayitlari: [],
  sayilar: { urun: 0, marka: 0, kategori: 0, model: 0 },
};

/* ------------------------------------------------------------------ */
/* Indeks kurma — liste basina BIR KEZ                                 */
/* ------------------------------------------------------------------ */

function indeksKur(kayitlar: ApiUrun[], guncellenme: string | null): Liste {
  const urunler: IndeksliUrun[] = [];

  // Tek gecis: slug hesapla, urunu hazirla
  for (let i = 0; i < kayitlar.length; i++) {
    const u = kayitlar[i];
    const marka = temizle(u.marka);
    const kategori = temizle(u.kategori);
    const model = temizle(u.model);
    if (!marka || !kategori || !model) continue;

    urunler.push({
      marka,
      kategori,
      model,
      markaSlug: slugla(marka),
      kategoriSlug: slugla(kategori),
      modelSlug: slugla(model),
      // Satir adi ERP'deki stok adi; bossa eski kalite birlesimine duser
      kalite: temizle(u.ad) || satirAdi(u),
      kaliteRozeti: rozetGerekliMi(u),
      uyumlu: temizle(u.uyumlu) || undefined,
      aciklama: temizle(u.aciklama) || undefined,
      stokKodu: temizle(u.kod) || undefined,
      toptan: u.toptan,
      perakende: u.perakende,
      // ERP butun fiyatlari USD tutar; cevrim yapilmaz
      paraBirimi: "USD",
      /*
       * ERP adet vermez, yalnizca var/yok. Musterinin musterisine lazim
       * olan tek sey "simdi alabilir miyim" sorusunun cevabi.
       */
      stok: u.stokVar ? "Var" : "Yok",
      sira: i,
    });
  }

  /* --- gruplama: tek gecis, uc ayri Map --- */
  const markaKutu = new Map<
    string,
    { ad: string; kategoriler: Set<string>; modeller: Set<string>; sayi: number }
  >();
  const kategoriKutu = new Map<
    string,
    { markaSlug: string; ad: string; slug: string; modeller: Set<string>; sayi: number }
  >();
  const modelKutu = new Map<string, IndeksliUrun[]>();
  const modelKatKutu = new Map<string, Map<string, { ad: string; adet: number }>>();
  const aramaKutu = new Map<
    string,
    AramaKaydi & { katHarita: Map<string, { ad: string; adet: number }> }
  >();

  for (const u of urunler) {
    // marka
    let m = markaKutu.get(u.markaSlug);
    if (!m) {
      m = { ad: u.marka, kategoriler: new Set(), modeller: new Set(), sayi: 0 };
      markaKutu.set(u.markaSlug, m);
    }
    m.kategoriler.add(u.kategoriSlug);
    m.modeller.add(u.modelSlug);
    m.sayi++;

    // marka > kategori
    const katAnahtar = `${u.markaSlug}/${u.kategoriSlug}`;
    let k = kategoriKutu.get(katAnahtar);
    if (!k) {
      k = {
        markaSlug: u.markaSlug,
        ad: u.kategori,
        slug: u.kategoriSlug,
        modeller: new Set(),
        sayi: 0,
      };
      kategoriKutu.set(katAnahtar, k);
    }
    k.modeller.add(u.modelSlug);
    k.sayi++;

    // marka > kategori > model
    const modAnahtar = `${u.markaSlug}/${u.kategoriSlug}/${u.modelSlug}`;
    const liste = modelKutu.get(modAnahtar);
    if (liste) liste.push(u);
    else modelKutu.set(modAnahtar, [u]);

    // modelin diger kategorileri
    const mkAnahtar = `${u.markaSlug}/${u.modelSlug}`;
    let mk = modelKatKutu.get(mkAnahtar);
    if (!mk) {
      mk = new Map();
      modelKatKutu.set(mkAnahtar, mk);
    }
    const mkKayit = mk.get(u.kategoriSlug);
    if (mkKayit) mkKayit.adet++;
    else mk.set(u.kategoriSlug, { ad: u.kategori, adet: 1 });

    // arama
    let a = aramaKutu.get(mkAnahtar);
    if (!a) {
      a = {
        marka: u.marka,
        markaSlug: u.markaSlug,
        model: u.model,
        modelSlug: u.modelSlug,
        hedef: `${u.markaSlug}-${u.modelSlug}`,
        kategoriler: [],
        cesitSayisi: 0,
        enUcuz: null,
        katHarita: new Map(),
      };
      aramaKutu.set(mkAnahtar, a);
    }
    a.cesitSayisi++;
    const fiyat = u.toptan ?? u.perakende;
    if (typeof fiyat === "number" && fiyat > 0) {
      a.enUcuz = a.enUcuz === null ? fiyat : Math.min(a.enUcuz, fiyat);
    }
    const aKat = a.katHarita.get(u.kategoriSlug);
    if (aKat) aKat.adet++;
    else a.katHarita.set(u.kategoriSlug, { ad: u.kategori, adet: 1 });
  }

  /*
   * Model slug'indan sayfa yoluna. Uyumlu model rozetlerini
   * tiklanabilir yapmak icin gerekiyor; bir kez kurulur, satir basina
   * tarama yapilmaz.
   */
  const modelYollari = new Map<string, { markaSlug: string; kategoriSlug: string }[]>();
  for (const anahtar of modelKutu.keys()) {
    const [markaSlug, kategoriSlug, modelSlug] = anahtar.split("/");
    const dizi = modelYollari.get(modelSlug);
    if (dizi) dizi.push({ markaSlug, kategoriSlug });
    else modelYollari.set(modelSlug, [{ markaSlug, kategoriSlug }]);
  }

  /* --- ozetleri uret --- */
  const markaAdi = new Map<string, string>();
  const markalar: MarkaOzeti[] = [];
  for (const [slug, m] of markaKutu) {
    markaAdi.set(slug, m.ad);
    markalar.push({
      ad: m.ad,
      slug,
      logo: logoYolu(m.ad),
      kategoriSayisi: m.kategoriler.size,
      modelSayisi: m.modeller.size,
      urunSayisi: m.sayi,
    });
  }
  markalar.sort((a, b) => b.urunSayisi - a.urunSayisi || trSirala(a.ad, b.ad));

  const kategoriler = new Map<string, KategoriOzeti[]>();
  for (const k of kategoriKutu.values()) {
    const dizi = kategoriler.get(k.markaSlug) ?? [];
    dizi.push({ ad: k.ad, slug: k.slug, modelSayisi: k.modeller.size, urunSayisi: k.sayi });
    kategoriler.set(k.markaSlug, dizi);
  }
  for (const dizi of kategoriler.values()) {
    dizi.sort((a, b) => b.modelSayisi - a.modelSayisi || trSirala(a.ad, b.ad));
  }

  const modeller = new Map<string, ModelOzeti[]>();
  const satirlar = new Map<string, FiyatSatiri[]>();
  for (const [anahtar, liste] of modelKutu) {
    const { enUcuz, enPahali } = fiyatAraligi(liste);
    const [markaSlug, kategoriSlug, modelSlug] = anahtar.split("/");

    const katAnahtar = `${markaSlug}/${kategoriSlug}`;
    const dizi = modeller.get(katAnahtar) ?? [];
    dizi.push({
      ad: liste[0].model,
      slug: modelSlug,
      cesitSayisi: liste.length,
      paraBirimi: "USD",
      enUcuz,
      enPahali,
    });
    modeller.set(katAnahtar, dizi);

    satirlar.set(
      anahtar,
      [...liste]
        .sort((a, b) => (b.toptan ?? 0) - (a.toptan ?? 0) || a.sira - b.sira)
        .map((u) => ({
          ...u,
          enUcuzMu: (u.toptan ?? u.perakende) === enUcuz,
          uyumluBaglantilar: uyumluCoz(
            u.uyumlu,
            markaSlug,
            kategoriSlug,
            modelSlug,
            modelYollari,
          ),
        })),
    );
  }
  for (const dizi of modeller.values()) {
    dizi.sort((a, b) => a.ad.localeCompare(b.ad, "tr", { numeric: true }));
  }

  const modelKategorileri = new Map<string, { ad: string; slug: string; adet: number }[]>();
  for (const [anahtar, harita] of modelKatKutu) {
    modelKategorileri.set(
      anahtar,
      [...harita.entries()]
        .map(([slug, k]) => ({ slug, ad: k.ad, adet: k.adet }))
        .sort((a, b) => trSirala(a.ad, b.ad)),
    );
  }

  const aramaKayitlari: AramaKaydi[] = [...aramaKutu.values()]
    .map(({ katHarita, ...kayit }) => ({
      ...kayit,
      kategoriler: [...katHarita.entries()]
        .map(([slug, k]) => ({ slug, ad: k.ad, adet: k.adet }))
        .sort((a, b) => trSirala(a.ad, b.ad)),
    }))
    .sort(
      (a, b) =>
        trSirala(a.marka, b.marka) ||
        a.model.localeCompare(b.model, "tr", { numeric: true }),
    );

  const kategoriKumesi = new Set<string>();
  for (const u of urunler) kategoriKumesi.add(u.kategoriSlug);

  return {
    urunler,
    guncellenme,
    hata: false,
    markalar,
    markaAdi,
    kategoriler,
    modeller,
    satirlar,
    modelKategorileri,
    aramaKayitlari,
    sayilar: {
      urun: urunler.length,
      marka: markaKutu.size,
      kategori: kategoriKumesi.size,
      model: aramaKutu.size,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Onbellek                                                            */
/* ------------------------------------------------------------------ */

let onbellek: { zaman: number; liste: Liste } | null = null;
let surenIstek: Promise<Liste> | null = null;

async function listeyiCek(): Promise<Liste> {
  try {
    // Next'in kendi fetch onbellegi de devrede; ikisi birlikte hem ERP'yi
    // hem CPU'yu korur.
    const cevap = await fetch(UC, { next: { revalidate: TAZELEME_SANIYE } });
    if (!cevap.ok) throw new Error(`fiyat-listesi ${cevap.status}`);

    const veri = (await cevap.json()) as ApiYanit;
    return indeksKur(Array.isArray(veri.urunler) ? veri.urunler : [], veri.guncellenme ?? null);
  } catch (sebep) {
    console.error("ERP fiyat listesi okunamadi:", sebep);
    return BOS_LISTE;
  }
}

/**
 * Hazir indeksi dondurur. Onbellek tazeyse aninda; degilse bir kez
 * ceker. Ayni anda gelen istekler tek cagriyi paylasir (surenIstek).
 */
export async function listeyiAl(): Promise<Liste> {
  const simdi = Date.now();

  if (onbellek && simdi - onbellek.zaman < TAZELEME_SANIYE * 1000) {
    return onbellek.liste;
  }

  // Ayni anda on kisi girdiginde ERP'ye on istek gitmesin
  if (surenIstek) return surenIstek;

  surenIstek = listeyiCek()
    .then((liste) => {
      // Hata durumunda eski listeyi koru: ERP bir dakika cevap vermezse
      // site bos kalmasin, elindekini gostermeye devam etsin.
      if (liste.hata && onbellek) return onbellek.liste;
      onbellek = { zaman: Date.now(), liste };
      return liste;
    })
    .finally(() => {
      surenIstek = null;
    });

  return surenIstek;
}
