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
import { tarihBicimle } from "@/lib/bicim";

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

      {/* ---------------- Baslik ---------------- */}
      <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent px-4 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white p-2.5 shadow-lg shadow-black/30 sm:size-16 sm:p-3">
            <MarkaLogosu marka={mAd} />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`flex items-center gap-1.5 rounded-full bg-gradient-to-r ${renk} px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white`}
              >
                <Ikon className="size-3.5" strokeWidth={2.2} />
                {kAd}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300">
                {satirlar.length} kalite seçeneği
              </span>
            </div>

            <h1 className="mt-2 text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
              {modAd}
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="size-3.5" />
              Son güncelleme: {tarihBicimle(bilgi.guncellenmeTarihi)}
            </p>
          </div>
        </div>

        {/* Ayni modelin diger parcalari icin hizli gecis */}
        {digerKategoriler.length > 1 && (
          <div className="yazdirma-gizle mt-4 border-t border-white/[0.07] pt-3.5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {modAd} için diğer parçalar
            </p>
            <div className="kaydir-gizli flex gap-2 overflow-x-auto pb-1">
              {digerKategoriler.map((diger) => {
                const aktif = diger.slug === kategori;
                return (
                  <Link
                    key={diger.slug}
                    href={`/marka/${marka}/${diger.slug}/${model}`}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      aktif
                        ? "border-vurgu-400/50 bg-vurgu-500/20 text-white"
                        : "border-white/10 bg-white/5 text-slate-300 hover:border-vurgu-400/40 hover:text-white"
                    }`}
                  >
                    {diger.ad}
                    <span className="ml-1.5 text-slate-500">{diger.adet}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <FiyatTablosu
        satirlar={satirlar}
        ayarlar={ayarlar}
        baslik={{ marka: mAd, kategori: kAd, model: modAd }}
      />
    </div>
  );
}
