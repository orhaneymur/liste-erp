import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdimCubugu } from "@/components/AdimCubugu";
import { kategoriGorunumu } from "@/components/KategoriIkonu";
import { MarkaLogosu } from "@/components/MarkaLogosu";
import { ModelIzgarasi } from "@/components/ModelIzgarasi";
import { kategoriAdi, markaAdi, modeller } from "@/lib/veri";

type Parametreler = { params: Promise<{ marka: string; kategori: string }> };

export async function generateMetadata({ params }: Parametreler): Promise<Metadata> {
  const { marka, kategori } = await params;
  const mAd = await markaAdi(marka);
  const kAd = await kategoriAdi(marka, kategori);
  return { title: mAd && kAd ? `${mAd} ${kAd} fiyatları` : "Sayfa bulunamadı" };
}

export default async function KategoriSayfasi({ params }: Parametreler) {
  const { marka, kategori } = await params;
  const mAd = await markaAdi(marka);
  const kAd = await kategoriAdi(marka, kategori);
  if (!mAd || !kAd) notFound();

  const liste = await modeller(marka, kategori);
  const { Ikon, renk } = kategoriGorunumu(kAd);

  return (
    <div>
      <AdimCubugu
        adimlar={[
          { etiket: mAd, href: `/marka/${marka}` },
          { etiket: kAd, href: `/marka/${marka}/${kategori}` },
        ]}
      />

      <header className="mb-6 flex items-center gap-4">
        <span
          className={`relative flex size-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${renk}`}
        >
          <Ikon className="size-7 text-white" strokeWidth={1.7} />
          <span className="absolute -bottom-1.5 -right-1.5 flex size-7 items-center justify-center rounded-lg bg-white/90 p-1">
            <MarkaLogosu marka={mAd} />
          </span>
        </span>
        <div>
          <p className="etiket">Model</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-metin">
            {mAd} {kAd}
          </h1>
          <p className="mt-0.5 text-sm text-metin-3">{liste.length} model</p>
        </div>
      </header>

      <ModelIzgarasi markaSlug={marka} kategoriSlug={kategori} modeller={liste} />
    </div>
  );
}
