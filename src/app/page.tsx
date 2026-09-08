import { Boxes, Smartphone, Sparkles, Tag, TriangleAlert, Zap } from "lucide-react";
import { MarkaIzgarasi } from "@/components/MarkaIzgarasi";
import { ayarlarOku, istatistik, markalar } from "@/lib/veri";
import { gecenSure, sayiBicimle } from "@/lib/bicim";

export default async function AnaSayfa() {
  const ayarlar = ayarlarOku();
  const liste = await markalar();
  const bilgi = await istatistik();

  const kartlar = [
    { etiket: "Marka", deger: bilgi.markaSayisi, Ikon: Tag },
    { etiket: "Model", deger: bilgi.modelSayisi, Ikon: Smartphone },
    { etiket: "Parça çeşidi", deger: bilgi.urunSayisi, Ikon: Boxes },
  ];

  return (
    <div>
      {/* ---------------- Üst tanıtım alanı ---------------- */}
      <section className="relative mb-8 overflow-hidden rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-white/[0.09] via-white/[0.04] to-transparent px-5 py-8 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-vurgu-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 size-64 rounded-full bg-mor-600/15 blur-3xl" />

        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
            </span>
            Liste güncel
            {bilgi.guncellenmeTarihi && (
              <span className="text-emerald-400/70">&middot; {gecenSure(bilgi.guncellenmeTarihi)}</span>
            )}
          </span>

          <h1 className="metin-gradyan mt-4 text-3xl font-black leading-[1.1] tracking-tight sm:text-5xl">
            Telefon yedek parça
            <br />
            fiyat listesi
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-300 sm:text-base">
            {ayarlar.sloganMetni ||
              "Marka, kategori ve model seçin; tüm kalite seçeneklerinin toptan ve perakende fiyatlarını anında görün."}
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {kartlar.map(({ etiket, deger, Ikon }) => (
              <div key={etiket} className="cam flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
                <Ikon className="size-4 text-vurgu-300" />
                <span className="text-sm">
                  <span className="font-bold text-white">{sayiBicimle(deger)}</span>
                  <span className="ml-1.5 text-slate-400">{etiket}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-altin-400" />4 adımda fiyata ulaşın
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-mor-400" />
              Toptan ve perakende ayrı gösterilir
            </span>
          </div>
        </div>
      </section>

      {/* ---------------- Marka seçimi ---------------- */}
      {liste.length === 0 ? (
        <div className="cam flex flex-col items-center gap-4 rounded-kart px-6 py-16 text-center">
          <TriangleAlert className="size-10 text-amber-400" />
          <div>
            <h2 className="text-lg font-bold text-white">
              {bilgi.erpHatasi ? "Liste şu an açılamadı" : "Listede yayınlanmış ürün yok"}
            </h2>
            <p className="mt-1 max-w-md text-sm text-slate-400">
              {bilgi.erpHatasi
                ? "Fiyat bilgisine ulaşılamadı. Sayfayı birazdan yenilemeyi deneyin."
                : "Fiyatı girilmiş ürün bulunamadı. Fiyatlar girildikçe burada görünecek."}
            </p>
          </div>
        </div>
      ) : (
        <MarkaIzgarasi markalar={liste} />
      )}
    </div>
  );
}
