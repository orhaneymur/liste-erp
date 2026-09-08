import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { Ayarlar } from "@/lib/tipler";

function whatsappLinki(numara: string): string {
  const temiz = numara.replace(/\D/g, "");
  const uluslararasi = temiz.startsWith("90") ? temiz : `90${temiz.replace(/^0/, "")}`;
  return `https://wa.me/${uluslararasi}`;
}

export function AltBilgi({ ayarlar }: { ayarlar: Ayarlar }) {
  const iletisimVar = ayarlar.telefon || ayarlar.whatsapp || ayarlar.eposta || ayarlar.adres;

  return (
    <footer className="yazdirma-gizle mt-auto border-t border-white/[0.07] bg-black/25">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {iletisimVar ? (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            {ayarlar.telefon && (
              <a
                href={`tel:${ayarlar.telefon.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-slate-300 transition hover:text-white"
              >
                <Phone className="size-4 text-vurgu-400" />
                {ayarlar.telefon}
              </a>
            )}
            {ayarlar.whatsapp && (
              <a
                href={whatsappLinki(ayarlar.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 transition hover:text-emerald-300"
              >
                <MessageCircle className="size-4 text-emerald-400" />
                WhatsApp&apos;tan sorun
              </a>
            )}
            {ayarlar.eposta && (
              <a
                href={`mailto:${ayarlar.eposta}`}
                className="flex items-center gap-2 text-slate-300 transition hover:text-white"
              >
                <Mail className="size-4 text-vurgu-400" />
                {ayarlar.eposta}
              </a>
            )}
            {ayarlar.adres && (
              <span className="flex items-center gap-2 text-slate-400">
                <MapPin className="size-4 text-slate-500" />
                {ayarlar.adres}
              </span>
            )}
          </div>
        ) : null}

        <p className="mt-6 text-xs leading-relaxed text-slate-500">{ayarlar.uyariMetni}</p>
        <p className="mt-3 text-xs text-slate-600">
          &copy; {new Date().getFullYear()} {ayarlar.firmaAdi}
        </p>
      </div>
    </footer>
  );
}
