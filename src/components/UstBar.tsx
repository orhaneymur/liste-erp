import Link from "next/link";
import { Arama } from "./Arama";

/**
 * Ust bar: firma adi ve arama. Baska hicbir sey yok — bu sayfanin tek
 * isi fiyat gostermek, gezinme adimlari zaten icerikte.
 */
export function UstBar({ firmaAdi }: { firmaAdi: string }) {
  return (
    <header className="yazdirma-gizle sticky top-0 z-40 border-b border-kenar bg-zemin/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="min-w-0 shrink">
          <span className="block truncate text-[15px] font-semibold tracking-tight text-metin">
            {firmaAdi}
          </span>
          <span className="block text-xs text-metin-3">Fiyat listesi</span>
        </Link>

        <Arama />
      </div>
    </header>
  );
}
