/** Uygulamanin tum veri tipleri */

/* ------------------------------------------------------------------ */
/* ERP ucundan gelen ham kayitlar                                      */
/* ------------------------------------------------------------------ */

/** GET /api/public/fiyat-listesi -> urunler[] */
export interface ApiUrun {
  /** ERP'deki stok adi — satirin gorunen adi bu olur */
  ad: string;
  marka: string;
  kategori: string;
  model: string;
  kalite: string;
  gorunum: string;
  renk: string;
  /** ERP'deki "Aciklama" sutunu; bos olabilir */
  aciklama: string;
  kod: string;
  /** Muadil model adlari, virgulle ayrilmis */
  uyumlu: string;
  toptan: number | null;
  perakende: number | null;
  /** ERP adet vermez; yalnizca satilabilir stok var mi */
  stokVar: boolean;
}

export interface ApiYanit {
  guncellenme: string;
  paraBirimi: ParaBirimi;
  urunSayisi: number;
  urunler: ApiUrun[];
}

export type ParaBirimi = "TRY" | "USD" | "EUR";

/**
 * Excel'deki bir satira karsilik gelen tek bir urun kaydi.
 * Tum veri bu duz (flat) yapida tutulur; marka/kategori/model agaci
 * okuma aninda bu kayitlardan uretilir.
 */
export interface Urun {
  marka: string;
  kategori: string;
  model: string;
  /**
   * Satirin gorunen adi — ERP'deki STOK ADI.
   * (Alan adi 'kalite' kaldi: bilesenler bu adla okuyor.)
   */
  kalite: string;
  /** Kalite/gorunum/renk birlesimi; stok adinda gecmiyorsa rozet olur */
  kaliteRozeti?: string;
  /** Muadil model adlari, virgulle ayrilmis */
  uyumlu?: string;
  /**
   * Urun aciklamasi — listede stok kodunun YERINDE gosterilir
   * (musteri karari, 11 Eylul 2026). Bos ise satirda hic bir sey yazmaz.
   */
  aciklama?: string;
  /**
   * Stok kodu. ARTIK GOSTERILMIYOR; satir anahtari olarak duruyor
   * (FiyatTablosu'ndaki key).
   */
  stokKodu?: string;
  toptan: number | null;
  perakende: number | null;
  paraBirimi: ParaBirimi;
  /** "Var" | "Sinirli" | "Yok" | serbest metin */
  stok?: string;
  not?: string;
  /** Excel'deki siralamayi korumak icin */
  sira: number;
}

export interface Ayarlar {
  firmaAdi: string;
  sloganMetni: string;
  telefon: string;
  whatsapp: string;
  eposta: string;
  adres: string;
  /** Fiyat listesi altinda gosterilecek uyari/aciklama metni */
  uyariMetni: string;
  /** Perakende fiyatlar musteriye gosterilsin mi */
  perakendeGoster: boolean;
  /** Toptan fiyatlar musteriye gosterilsin mi */
  toptanGoster: boolean;
  /** Fiyatlara KDV dahil mi */
  kdvDahil: boolean;
  kdvOrani: number;
  /** Doviz cinsli fiyatlarin TL karsiligini gostermek icin kurlar */
  usdKuru: number;
  eurKuru: number;
}

/* ------------------------------------------------------------------ */
/* Sayfalarin kullandigi turetilmis (agac) tipler                      */
/* ------------------------------------------------------------------ */

export interface MarkaOzeti {
  ad: string;
  slug: string;
  logo: string;
  kategoriSayisi: number;
  modelSayisi: number;
  urunSayisi: number;
}

export interface KategoriOzeti {
  ad: string;
  slug: string;
  modelSayisi: number;
  urunSayisi: number;
}

export interface ModelOzeti {
  ad: string;
  slug: string;
  cesitSayisi: number;
  enUcuz: number | null;
  enPahali: number | null;
  paraBirimi: ParaBirimi;
}

/**
 * Satirdaki tiklanabilir muadil model rozeti.
 *
 * yol null ise o model listede YOK (ERP'de karti acilmamis veya adi
 * tutmuyor): rozet yazi olarak durur, baglanti verilmez — tiklayinca
 * bos sayfa acilmasin.
 */
export interface UyumluBaglanti {
  ad: string;
  yol: string | null;
}

export interface FiyatSatiri extends Urun {
  /** Ayni model+kategori icindeki en ucuz secenek mi */
  enUcuzMu: boolean;
  /** Muadil modeller, sayfa yollari cozulmus halde */
  uyumluBaglantilar?: UyumluBaglanti[];
}
