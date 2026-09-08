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
  const toplamCesit = liste.reduce((t, k) => t + k.urunSayisi, 0);

  return (
    <div>
      <AdimCubugu adimlar={[{ etiket: ad, href: `/marka/${marka}` }]} />

      <header className="mb-6 flex items-center gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/90 p-2.5">
          <MarkaLogosu marka={ad} />
        </span>
        <div>
          <p className="etiket">Parça türü</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-metin">{ad}</h1>
          <p className="mt-0.5 text-sm text-metin-3">
            {liste.length} parça türü · {toplamCesit} çeşit
          </p>
        </div>
      </header>

      <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {liste.map((kategori) => {
          const { Ikon, renk } = kategoriGorunumu(kategori.ad);
          return (
            <li key={kategori.slug}>
              <Link
                href={`/marka/${marka}/${kategori.slug}`}
                className="yuzey flex items-center gap-4 rounded-kart p-4 transition duration-150 hover:border-mavi/45 hover:bg-yuzey-2"
              >
                <span
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${renk}`}
                >
                  <Ikon className="size-6 text-white" strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-medium text-metin">
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
