import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { AdimCubugu } from "@/components/AdimCubugu";
import { FiyatTablosu } from "@/components/FiyatTablosu";
import { MarkaLogosu } from "@/components/MarkaLogosu";
import {
  ayarlarOku,
  fiyatlar,
  istatistik,
  kategoriAdi,
  markaAdi,
  modelAdi,
  modelinDigerKategorileri,
} from "@/lib/veri";
import { gecenSure } from "@/lib/bicim";

type Parametreler = {
  params: Promise<{ marka: string; kategori: string; model: string }>;
};

export async function generateMetadata({ params }: Parametreler): Promise<Metadata> {
  const { marka, kategori, model } = await params;
  const mAd = await markaAdi(marka);
  const kAd = await kategoriAdi(marka, kategori);
  const modAd = await modelAdi(marka, kategori, model);
  return {
    title: mAd && kAd && modAd ? `${modAd} ${kAd} fiyatları` : "Sayfa bulunamadı",
  };
}

export default async function FiyatSayfasi({ params }: Parametreler) {
  const { marka, kategori, model } = await params;
  const mAd = await markaAdi(marka);
  const kAd = await kategoriAdi(marka, kategori);
  const modAd = await modelAdi(marka, kategori, model);
  if (!mAd || !kAd || !modAd) notFound();

  const satirlar = await fiyatlar(marka, kategori, model);
  const ayarlar = ayarlarOku();
  const bilgi = await istatistik();
  const digerKategoriler = await modelinDigerKategorileri(marka, model);

  return (
    <div>
      <AdimCubugu
        adimlar={[
          { etiket: mAd, href: `/marka/${marka}` },
          { etiket: kAd, href: `/marka/${marka}/${kategori}` },
          { etiket: modAd, href: `/marka/${marka}/${kategori}/${model}` },
        ]}
      />

      <header className="mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center">
          <MarkaLogosu marka={mAd} />
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-metin sm:text-2xl">
            {modAd}
          </h1>
          <p className="mt-0.5 text-sm text-metin-3">
            {kAd} · {satirlar.length} seçenek
            {bilgi.guncellenmeTarihi && ` · güncellendi ${gecenSure(bilgi.guncellenmeTarihi)}`}
          </p>
        </div>
      </header>

      {/* Aynı modelin diğer parçalarına hızlı geçiş */}
      {digerKategoriler.length > 1 && (
        <div className="yazdirma-gizle kaydir-gizli mb-4 flex gap-1.5 overflow-x-auto pb-1">
          {digerKategoriler.map((diger) => {
            const aktif = diger.slug === kategori;
            return (
              <Link
                key={diger.slug}
                href={`/marka/${marka}/${diger.slug}/${model}`}
                className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                  aktif
                    ? "border-metin bg-metin text-white"
                    : "border-kenar text-metin-2 hover:border-metin hover:text-metin"
                }`}
              >
                {diger.ad}
                <span className={aktif ? "ml-1.5 text-white/60" : "ml-1.5 text-metin-3"}>
                  {diger.adet}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <FiyatTablosu
        satirlar={satirlar}
        ayarlar={ayarlar}
        baslik={{ marka: mAd, kategori: kAd, model: modAd }}
      />
    </div>
  );
}
