import type { ParaBirimi } from "./tipler";

export const PARA_SEMBOLU: Record<ParaBirimi, string> = {
  TRY: "\u20BA",
  USD: "$",
  EUR: "\u20AC",
};

/**
 * Sayiyi Turkce bicimde yazar: 12345.5 -> "12.345,50"
 * (Intl yerine elle yazildi; sunucu ile tarayici arasinda
 *  bicimlendirme farki olusup hydration hatasi cikmasin diye.)
 */
export function sayiBicimle(deger: number, ondalikBasamak?: number): string {
  const negatif = deger < 0;
  const mutlak = Math.abs(deger);
  const basamak = ondalikBasamak ?? (Number.isInteger(mutlak) ? 0 : 2);
  const [tam, ondalik] = mutlak.toFixed(basamak).split(".");
  const tamBicimli = tam.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negatif ? "-" : ""}${tamBicimli}${ondalik ? "," + ondalik : ""}`;
}

/** 1250 TRY -> "1.250 ₺" */
export function paraBicimle(deger: number | null | undefined, paraBirimi: ParaBirimi = "TRY"): string {
  if (deger === null || deger === undefined || Number.isNaN(deger)) return "-";
  return `${sayiBicimle(deger)} ${PARA_SEMBOLU[paraBirimi] ?? ""}`.trim();
}

/** Doviz cinsli fiyatin TL karsiligi (kur girilmediyse null) */
export function tlKarsiligi(
  deger: number | null,
  paraBirimi: ParaBirimi,
  usdKuru: number,
  eurKuru: number,
): number | null {
  if (deger === null || !deger) return null;
  if (paraBirimi === "USD" && usdKuru > 0) return deger * usdKuru;
  if (paraBirimi === "EUR" && eurKuru > 0) return deger * eurKuru;
  return null;
}

const AYLAR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
];

/** ISO tarihi "7 Eylül 2026, 14:30" bicimine cevirir */
export function tarihBicimle(iso: string | null | undefined): string {
  if (!iso) return "-";
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "-";
  const iki = (s: number) => String(s).padStart(2, "0");
  return `${t.getDate()} ${AYLAR[t.getMonth()]} ${t.getFullYear()}, ${iki(t.getHours())}:${iki(
    t.getMinutes(),
  )}`;
}

/** "3 gun once" tarzi kisa ifade */
export function gecenSure(iso: string | null | undefined): string {
  if (!iso) return "";
  const fark = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(fark)) return "";
  const dakika = Math.floor(fark / 60000);
  if (dakika < 1) return "az önce";
  if (dakika < 60) return `${dakika} dakika önce`;
  const saat = Math.floor(dakika / 60);
  if (saat < 24) return `${saat} saat önce`;
  const gun = Math.floor(saat / 24);
  if (gun < 30) return `${gun} gün önce`;
  return `${Math.floor(gun / 30)} ay önce`;
}
