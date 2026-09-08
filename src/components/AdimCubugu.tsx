import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type Adim = { etiket: string; href?: string };

/**
 * Gezinme izi: Apple › Ekran & LCD › iPhone 11
 *
 * Telefonda geri gitmek en sik yapilan is oldugu icin solda ayri bir
 * geri baglantisi var; izin kendisi tasarken kesilmesin diye yatay
 * kaydirilabilir.
 */
export function AdimCubugu({ adimlar }: { adimlar: Adim[] }) {
  const geriHref = adimlar.length > 1 ? adimlar[adimlar.length - 2].href : "/";

  return (
    <nav aria-label="Gezinme" className="yazdirma-gizle mb-6 flex items-center gap-3">
      <Link
        href={geriHref ?? "/"}
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-kenar text-metin-2 transition hover:border-metin hover:text-metin"
        aria-label="Geri"
      >
        <ChevronLeft className="size-4" />
      </Link>

      <ol className="kaydir-gizli flex min-w-0 items-center gap-1.5 overflow-x-auto text-sm">
        <li className="shrink-0">
          <Link href="/" className="text-metin-3 transition hover:text-metin">
            Tümü
          </Link>
        </li>

        {adimlar.map((adim, indeks) => {
          const sonuncu = indeks === adimlar.length - 1;
          return (
            <li key={adim.etiket + indeks} className="flex shrink-0 items-center gap-1.5">
              <span aria-hidden className="text-metin-3">
                ›
              </span>
              {sonuncu || !adim.href ? (
                <span className="font-medium text-metin">{adim.etiket}</span>
              ) : (
                <Link href={adim.href} className="text-metin-2 transition hover:text-metin">
                  {adim.etiket}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
