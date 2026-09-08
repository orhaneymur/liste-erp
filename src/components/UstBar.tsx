import Link from "next/link";
import { Smartphone } from "lucide-react";
import { Arama } from "./Arama";

/**
 * Ust bar: amblem, firma adi ve arama.
 *
 * Amblem gradyanin uc kullanim yerinden biri (digerleri ana sayfa
 * basligi ve en uygun fiyat satiri). Kimlik isareti oldugu icin
 * gradyani hak eden yer burasi.
 */
export function UstBar({ firmaAdi }: { firmaAdi: string }) {
  return (
    <header className="yazdirma-gizle sticky top-0 z-40 border-b border-kenar bg-zemin/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-mavi to-mor shadow-lg shadow-mavi/25">
            <Smartphone className="size-5 text-white" strokeWidth={1.9} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold tracking-tight text-metin">
              {firmaAdi}
            </span>
            <span className="etiket block text-[10.5px]">Fiyat listesi</span>
          </span>
        </Link>

        <Arama />
      </div>
    </header>
  );
}
