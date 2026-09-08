import { slugla } from "./slug";

/**
 * public/logolar/ altinda bulunan logo dosyalari.
 * (scripts/logolari-hazirla.mjs tarafindan uretilir)
 */
export const MEVCUT_LOGOLAR = [
  "apple",
  "samsung",
  "xiaomi",
  "redmi",
  "huawei",
  "honor",
  "oppo",
  "realme",
  "vivo",
  "oneplus",
  "google",
  "nokia",
  "motorola",
  "asus",
  "lenovo",
  "sony",
  "lg",
  "htc",
  "zte",
  "tcl",
  "alcatel",
  "tecno",
  "infinix",
  "vestel",
  "meizu",
  "reeder",
  "casper",
  "general-mobile",
  "poco",
  "diger",
] as const;

/**
 * Excel'de marka adi farkli yazilmis olabilir; bu tablo onlari
 * dogru logo dosyasina baglar. Anahtarlar slug formatindadir.
 */
const TAKMA_ADLAR: Record<string, string> = {
  iphone: "apple",
  "i-phone": "apple",
  ipad: "apple",
  apple: "apple",
  galaxy: "samsung",
  samsun: "samsung",
  "samsung-galaxy": "samsung",
  mi: "xiaomi",
  "xiaomi-redmi": "redmi",
  "redmi-note": "redmi",
  pocophone: "poco",
  "huawei-honor": "honor",
  "google-pixel": "google",
  pixel: "google",
  "one-plus": "oneplus",
  gm: "general-mobile",
  "general-mobil": "general-mobile",
  "generalmobile": "general-mobile",
  reader: "reeder",
  "t-c-l": "tcl",
};

/** Marka adindan logo dosya yolunu bulur. Bulamazsa genel logoyu dondurur. */
export function logoYolu(markaAdi: string): string {
  const slug = slugla(markaAdi);
  const dosya =
    (MEVCUT_LOGOLAR as readonly string[]).find((l) => l === slug) ??
    TAKMA_ADLAR[slug] ??
    (MEVCUT_LOGOLAR as readonly string[]).find((l) => slug.startsWith(l)) ??
    "diger";
  return `/logolar/${dosya}.svg`;
}

/** Logosu olmayan markalar icin kart arka plan rengi uretir (marka adina gore sabit) */
export function markaRengi(markaAdi: string): string {
  const renkler = [
    "#0ea5e9",
    "#8b5cf6",
    "#f43f5e",
    "#10b981",
    "#f59e0b",
    "#6366f1",
    "#14b8a6",
    "#ec4899",
  ];
  let toplam = 0;
  for (const harf of markaAdi) toplam += harf.charCodeAt(0);
  return renkler[toplam % renkler.length];
}
