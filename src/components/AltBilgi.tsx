import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { whatsappLinki } from "@/lib/bicim";
import type { Ayarlar } from "@/lib/tipler";

/**
 * Alt bilgi: yalnizca dolu olan iletisim kanallari gorunur.
 * Hicbiri doldurulmamissa yalnizca uyari ve telif satiri kalir.
 */
export function AltBilgi({ ayarlar }: { ayarlar: Ayarlar }) {
  const kanallar = [
    ayarlar.telefon && {
      Ikon: Phone,
      metin: ayarlar.telefon,
      href: `tel:${ayarlar.telefon.replace(/\s/g, "")}`,
    },
    ayarlar.whatsapp && {
      Ikon: MessageCircle,
      metin: "WhatsApp",
      href: whatsappLinki(ayarlar.whatsapp),
    },
    ayarlar.eposta && { Ikon: Mail, metin: ayarlar.eposta, href: `mailto:${ayarlar.eposta}` },
    ayarlar.adres && { Ikon: MapPin, metin: ayarlar.adres, href: null },
  ].filter(Boolean) as { Ikon: typeof Phone; metin: string; href: string | null }[];

  return (
    <footer className="yazdirma-gizle mt-auto border-t border-kenar">
      <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6 sm:pb-8">
        {kanallar.length > 0 && (
          <div className="mb-5 flex flex-wrap gap-x-6 gap-y-3">
            {kanallar.map(({ Ikon, metin, href }) => {
              const icerik = (
                <span className="flex items-center gap-2 text-sm text-metin-2 transition hover:text-metin">
                  <Ikon className="size-4 shrink-0 text-metin-3" strokeWidth={1.75} />
                  {metin}
                </span>
              );
              return href ? (
                <a key={metin} href={href}>
                  {icerik}
                </a>
              ) : (
                <span key={metin}>{icerik}</span>
              );
            })}
          </div>
        )}

        <p className="max-w-[62ch] text-xs leading-relaxed text-metin-3">{ayarlar.uyariMetni}</p>

        <p className="mt-4 text-xs text-metin-3">
          © {new Date().getFullYear()} {ayarlar.firmaAdi}
        </p>
      </div>
    </footer>
  );
}
