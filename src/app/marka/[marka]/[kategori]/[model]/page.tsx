import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { AdimCubugu } from "@/components/AdimCubugu";
import { FiyatTablosu } from "@/components/FiyatTablosu";
import { kategoriGorunumu } from "@/components/KategoriIkonu";
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
  const { Ikon, renk } = kategoriGorunumu(kAd);

  return (
    <div>
      <AdimCubugu
        adimlar={[
          { etiket: mAd, href: `/marka/${marka}` },
          { etiket: kAd, href: `/marka/${marka}/${kategori}` },
          { etiket: modAd, href: `/marka/${marka}/${kategori}/${model}` },
        ]}
      />

      <header className="mb-5 flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/90 p-2.5">
          <MarkaLogosu marka={mAd} />
        </span>

        <div className="min-w-0">
          <p className="etiket">Fiyatlar</p>
          <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-metin sm:text-[28px]">
            {modAd}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${renk} px-2.5 py-1 text-[11px] font-medium text-white`}
            >
              <Ikon className="size-3.5" strokeWidth={2.1} />
              {kAd}
            </span>
            <span className="rounded-full border border-kenar bg-yuzey px-2.5 py-1 text-[11px] text-metin-2">
              {satirlar.length} seçenek
            </span>
            {bilgi.guncellenmeTarihi && (
              <span className="flex items-center gap-1.5 text-[11px] text-metin-3">
                <Clock className="size-3.5" />
                güncellendi {gecenSure(bilgi.guncellenmeTarihi)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Aynı modelin diğer parçalarına hızlı geçiş */}
      {digerKategoriler.length > 1 && (
        <div className="yazdirma-gizle kaydir-gizli mb-4 flex gap-2 overflow-x-auto pb-1">
          {digerKategoriler.map((diger) => {
            const aktif = diger.slug === kategori;
            return (
              <Link
                key={diger.slug}
                href={`/marka/${marka}/${diger.slug}/${model}`}
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  aktif
                    ? "border-mavi/45 bg-mavi/15 text-[#cfdeff]"
                    : "border-kenar bg-yuzey text-metin-2 hover:border-kenar-parlak hover:text-metin"
                }`}
              >
                {diger.ad}
                <span className="ml-1.5 font-mono text-[11px] opacity-60">{diger.adet}</span>
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
