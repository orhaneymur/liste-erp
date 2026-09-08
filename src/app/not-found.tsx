import Link from "next/link";
import { House, SearchX } from "lucide-react";

export default function BulunamadiSayfasi() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-vurgu-500 to-mor-600 shadow-lg shadow-vurgu-600/30">
        <SearchX className="size-8 text-white" />
      </span>
      <h1 className="mt-5 text-2xl font-black text-white">Sayfa bulunamadı</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        Aradığınız marka, kategori veya model listede yer almıyor. Yeni fiyat listesi
        yüklendiğinde eski bağlantılar değişmiş olabilir.
      </p>
      <Link
        href="/"
        className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-vurgu-500 to-mor-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-vurgu-600/25 transition hover:brightness-110"
      >
        <House className="size-4" />
        Marka seçimine dön
      </Link>
    </div>
  );
}
