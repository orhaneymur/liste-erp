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
  const ad = await markaAdi(marka);
  return { title: ad ? `${ad} yedek parça fiyatları` : "Marka bulunamadı" };
}

export default async function MarkaSayfasi({ params }: Parametreler) {
  const { marka } = await params;
  const ad = await markaAdi(marka);
  if (!ad) notFound();

  const liste = await kategoriler(marka);

  return (
    <div>
      <AdimCubugu adimlar={[{ etiket: ad, href: `/marka/${marka}` }]} />

      <header className="mb-6 flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center">
          <MarkaLogosu marka={ad} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-metin">{ad}</h1>
          <p className="text-sm text-metin-3">Parça türü seçin</p>
        </div>
      </header>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {liste.map((kategori) => {
          const { Ikon } = kategoriGorunumu(kategori.ad);
          return (
            <li key={kategori.slug}>
              <Link
                href={`/marka/${marka}/${kategori.slug}`}
                className="kart-baglanti flex items-center gap-3 p-3.5"
              >
                <Ikon className="size-5 shrink-0 text-metin-2" strokeWidth={1.5} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-metin">
                    {kategori.ad}
                  </span>
                  <span className="block text-xs text-metin-3">
                    {kategori.modelSayisi} model · {kategori.urunSayisi} çeşit
                  </span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-metin-3" />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
