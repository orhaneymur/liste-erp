import Link from "next/link";
import { ChevronLeft, ChevronRight, House } from "lucide-react";

export interface Adim {
  etiket: string;
  href?: string;
}

const ADIM_ADLARI = ["Marka", "Kategori", "Model", "Fiyatlar"];

/**
 * Ust kisimda "hangi adimdayim" bilgisini ve geri donus baglantilarini gosterir.
 * Mobilde tek satir halinde yatay kaydirilabilir.
 */
export function AdimCubugu({ adimlar }: { adimlar: Adim[] }) {
  const geriHref = adimlar.length > 1 ? adimlar[adimlar.length - 2]?.href : "/";
  const aktifAdim = adimlar.length;

  return (
    <nav aria-label="Sayfa gezinmesi" className="yazdirma-gizle mb-5">
      <div className="flex items-center gap-3">
        {geriHref && (
          <Link
            href={geriHref}
            className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-vurgu-400/50 hover:bg-vurgu-500/15 hover:text-white"
            aria-label="Geri dön"
          >
            <ChevronLeft className="size-5" />
          </Link>
        )}

        <ol className="kaydir-gizli flex min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap text-sm">
          <li className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <House className="size-4" />
              <span className="sr-only">Ana sayfa</span>
            </Link>
          </li>
          {adimlar.map((adim, indeks) => {
            const sonMu = indeks === adimlar.length - 1;
            return (
              <li key={`${adim.etiket}-${indeks}`} className="flex items-center">
                <ChevronRight className="size-4 shrink-0 text-slate-600" />
                {adim.href && !sonMu ? (
                  <Link
                    href={adim.href}
                    className="rounded-lg px-2 py-1 text-slate-400 transition hover:bg-white/5 hover:text-white"
                  >
                    {adim.etiket}
                  </Link>
                ) : (
                  <span className="px-2 py-1 font-semibold text-white">{adim.etiket}</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Adim gostergesi */}
      <div className="mt-3 flex items-center gap-1.5">
        {ADIM_ADLARI.map((ad, indeks) => (
          <div key={ad} className="flex flex-1 flex-col gap-1.5">
            <span
              className={`h-1 rounded-full transition-colors ${
                indeks < aktifAdim ? "bg-gradient-to-r from-vurgu-500 to-mor-500" : "bg-white/10"
              }`}
            />
            <span
              className={`text-[10px] font-medium uppercase tracking-wide ${
                indeks < aktifAdim ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {indeks + 1}. {ad}
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
}
