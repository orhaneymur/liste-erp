import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdimCubugu } from "@/components/AdimCubugu";
import { kategoriGorunumu } from "@/components/KategoriIkonu";
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
  const { Ikon } = kategoriGorunumu(kAd);

  return (
    <div>
      <AdimCubugu
        adimlar={[
          { etiket: mAd, href: `/marka/${marka}` },
          { etiket: kAd, href: `/marka/${marka}/${kategori}` },
        ]}
      />

      <header className="mb-5 flex items-center gap-3">
        <Ikon className="size-6 shrink-0 text-metin-2" strokeWidth={1.5} />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-metin">
            {mAd} {kAd}
          </h1>
          <p className="text-sm text-metin-3">{liste.length} model</p>
        </div>
      </header>

      <ModelIzgarasi markaSlug={marka} kategoriSlug={kategori} modeller={liste} />
    </div>
  );
}
