import Link from "next/link";
import { Smartphone } from "lucide-react";
import { Arama } from "./Arama";

export function UstBar({ firmaAdi }: { firmaAdi: string }) {
  return (
    <header className="yazdirma-gizle sticky top-0 z-40 border-b border-white/[0.07] bg-zemin/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-2.5">
          <span className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-vurgu-500 to-mor-600 shadow-lg shadow-vurgu-600/30 transition group-hover:shadow-vurgu-500/50">
            <Smartphone className="size-5 text-white" strokeWidth={2.2} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold leading-tight text-white">
              {firmaAdi}
            </span>
            <span className="block text-[11px] leading-tight text-slate-400">Fiyat Listesi</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Arama />
        </div>
      </div>
    </header>
  );
}
