/** Uygulamanin tum veri tipleri */

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
  /** Kalite / cesit adi. Orn: "Servis Orijinal", "OLED Hard", "A Kalite TFT" */
  kalite: string;
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
  /**
   * Excel'de "Para Birimi" kolonu YOKSA fiyatlarin hangi birimde
   * oldugu kabul edilecek. ERP'den inen stok dosyasinda boyle bir
   * kolon yoktur ve oradaki fiyatlar USD'dir.
   */
  varsayilanParaBirimi: ParaBirimi;
  /** Doviz cinsli fiyatlarin TL karsiligini gostermek icin kurlar */
  usdKuru: number;
  eurKuru: number;
}

export interface VeriTabani {
  urunler: Urun[];
  guncellenmeTarihi: string | null;
  /** Son yuklenen Excel dosyasinin adi */
  kaynakDosya: string | null;
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

export interface FiyatSatiri extends Urun {
  /** Ayni model+kategori icindeki en ucuz secenek mi */
  enUcuzMu: boolean;
}
