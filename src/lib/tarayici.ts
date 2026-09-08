/**
 * Sayfayi sunucudan yeniden yukleyip, yukleme sonrasi gosterilecek
 * bildirimi tasiyan kucuk yardimcilar.
 *
 * Neden: yonetim panelindeki ozet kartlari sunucuda uretiliyor. Excel
 * yuklendikten sonra bu kartlarin kesin olarak guncellenmesi icin sayfa
 * yeniden yukleniyor; ama kullanicinin "islem basarili" raporunu kaybetmemesi
 * gerekiyor. Rapor sessionStorage'a birakilip yeni sayfada okunuyor.
 */

export function yenileVeBildir(anahtar: string, bildirim: unknown): void {
  try {
    sessionStorage.setItem(anahtar, JSON.stringify(bildirim));
  } catch {
    /* gizli sekmede sessionStorage kapali olabilir */
  }
  window.location.replace(window.location.pathname);
}

export function bekleyenBildirim<T>(anahtar: string): T | null {
  try {
    const kayit = sessionStorage.getItem(anahtar);
    if (!kayit) return null;
    sessionStorage.removeItem(anahtar);
    return JSON.parse(kayit) as T;
  } catch {
    return null;
  }
}
