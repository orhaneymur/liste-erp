import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import { AdimCubugu } from "@/components/AdimCubugu";
import { kategoriGorunumu } from "@/components/KategoriIkonu";
import { MarkaLogosu } from "@/components/MarkaLogosu";
import { kategoriler, markaAdi } from "@/lib/veri";

type Parametreler = { params: Promise<{ marka: string }> };

export async function generateMetadata({ params }: Parametreler): Promise<Metadata> {
  const { marka } = await params;
  const ad = markaAdi(marka);
  return { title: ad ? `${ad} yedek parça fiyatları` : "Marka bulunamadı" };
}

export default async function MarkaSayfasi({ params }: Parametreler) {
  const { marka } = await params;
  const ad = markaAdi(marka);
  if (!ad) notFound();

  const liste = kategoriler(marka);

  return (
    <div>
      <AdimCubugu adimlar={[{ etiket: ad, href: `/marka/${marka}` }]} />

      {/* Marka basligi */}
      <div className="mb-6 flex items-center gap-4">
        <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white p-3 shadow-lg shadow-black/30 sm:size-20 sm:p-4">
          <MarkaLogosu marka={ad} />
        </span>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{ad}</h1>
          <p className="mt-1 text-sm text-slate-400">
            Hangi parçanın fiyatını öğrenmek istiyorsunuz?
          </p>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {liste.map((kategori, indeks) => {
          const { Ikon, renk } = kategoriGorunumu(kategori.ad);
          return (
            <li
              key={kategori.slug}
              className="animate-yukari"
              style={{ animationDelay: `${Math.min(indeks * 30, 400)}ms` }}
            >
              <Link
                href={`/marka/${marka}/${kategori.slug}`}
                className="isikli-kart cam group flex h-full flex-col gap-3 rounded-kart p-4 hover:-translate-y-1 hover:border-vurgu-400/40 hover:shadow-[0_18px_45px_-18px_rgba(59,130,246,0.6)] sm:p-5"
              >
                <span
                  className={`flex size-12 items-center justify-center rounded-xl bg-gradient-to-br ${renk} shadow-lg shadow-black/30 transition group-hover:scale-105`}
                >
                  <Ikon className="size-6 text-white" strokeWidth={1.9} />
                </span>

                <span className="flex-1">
                  <span className="block text-[15px] font-bold leading-tight text-white">
                    {kategori.ad}
                  </span>
                  <span className="mt-1 block text-xs text-slate-400">
                    {kategori.modelSayisi} model &middot; {kategori.urunSayisi} çeşit
                  </span>
                </span>

                <span className="flex items-center gap-1 text-xs font-medium text-vurgu-300 transition group-hover:gap-2">
                  Modelleri gör
                  <ChevronRight className="size-3.5" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
