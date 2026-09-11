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

/**
 * WhatsApp numarasini wa.me baglantisina cevirir.
 * "+90 530 889 34 00" -> "https://wa.me/905308893400"
 *
 * wa.me yalnizca rakam kabul eder; bosluk, tire ve arti isareti
 * atilir. Numara ulke kodsuz girilirse baglanti calismaz — ayar
 * dosyasinda ulke koduyla yazilmasi gerekir.
 */
export function whatsappLinki(numara: string): string {
  const rakamlar = numara.replace(/\D/g, "");

  /*
   * Ulke kodu normallestirmesi (11 Eylul 2026).
   *
   * wa.me ULKE KODU ister ve bastaki sifiri kabul etmez: "05494974747"
   * verilirse baglanti sessizce calismaz — tiklayan kisi bos bir ekran
   * gorur. Ayari giren kisinin bunu bilmesini beklemek yerine yaygin uc
   * bicimi burada duzeltiyoruz.
   *
   *   00905494974747 -> 905494974747   (uluslararasi cikis kodu)
   *   05494974747    -> 905494974747   (yerel bicim, bastaki sifir)
   *   5494974747     -> 905494974747   (sifirsiz, 10 hane)
   *
   * Bunlarin disindaki numaralara DOKUNULMAZ: yabanci bir musteri kendi
   * ulke koduyla girdiginde bozmayalim.
   */
  if (rakamlar.startsWith("00")) return `https://wa.me/${rakamlar.slice(2)}`;
  if (rakamlar.length === 11 && rakamlar.startsWith("0")) {
    return `https://wa.me/90${rakamlar.slice(1)}`;
  }
  if (rakamlar.length === 10 && rakamlar.startsWith("5")) {
    return `https://wa.me/90${rakamlar}`;
  }
  return `https://wa.me/${rakamlar}`;
}
