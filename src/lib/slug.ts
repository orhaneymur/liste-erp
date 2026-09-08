/**
 * Turkce karakterleri dogru donusturen URL slug uretici.
 * "İphone 11 Pro Max" -> "iphone-11-pro-max"
 * "Şarj Soketi"       -> "sarj-soketi"
 */
export function slugla(metin: string): string {
  return sadeMetin(metin)
    .replace(/&/g, " ve ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Metni karsilastirma icin sadelestirir: Turkce harfleri ASCII karsiligina
 * cevirip kucuk harfe indirir. "Servis ORIJINAL" -> "servis orijinal"
 *
 * Not: toLocaleLowerCase("tr") kullanilmaz; cunku "I" harfini "ı" yapar ve
 * ASCII anahtar kelimelerle ("incell", "orijinal") eslesme bozulur.
 */
export function sadeMetin(metin: string): string {
  return (metin ?? "")
    .toString()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/** Bosluklari sadelestirip bas/son bosluklari kirpar */
export function temizle(metin: unknown): string {
  return String(metin ?? "")
    .replace(/\s+/g, " ")
    .trim();
}
