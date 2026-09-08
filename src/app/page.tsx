import { MarkaIzgarasi } from "@/components/MarkaIzgarasi";
import { ayarlarOku, istatistik, markalar } from "@/lib/veri";
import { gecenSure, sayiBicimle } from "@/lib/bicim";

export default async function AnaSayfa() {
  const ayarlar = ayarlarOku();
  const liste = await markalar();
  const bilgi = await istatistik();

  return (
    <div>
      {/* Başlık — tek satır tanıtım, süsleme yok */}
      <header className="mb-8 border-b border-kenar pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-metin sm:text-3xl">
          {ayarlar.firmaAdi} fiyat listesi
        </h1>

        {ayarlar.sloganMetni && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-metin-2">
            {ayarlar.sloganMetni}
          </p>
        )}

        {liste.length > 0 && (
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-metin-3">
            <span>{sayiBicimle(bilgi.markaSayisi)} marka</span>
            <span>{sayiBicimle(bilgi.modelSayisi)} model</span>
            <span>{sayiBicimle(bilgi.urunSayisi)} parça</span>
            {bilgi.guncellenmeTarihi && (
              <span className="text-metin-3">
                güncellendi {gecenSure(bilgi.guncellenmeTarihi)}
              </span>
            )}
          </p>
        )}
      </header>

      {liste.length === 0 ? (
        <div className="kart p-10 text-center">
          <h2 className="text-base font-medium text-metin">
            {bilgi.erpHatasi ? "Liste şu an açılamadı" : "Listede yayınlanmış ürün yok"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-metin-2">
            {bilgi.erpHatasi
              ? "Fiyat bilgisine ulaşılamadı. Sayfayı birazdan yenilemeyi deneyin."
              : "Fiyatı girilmiş ürün bulunamadı. Fiyatlar girildikçe burada görünecek."}
          </p>
        </div>
      ) : (
        <MarkaIzgarasi markalar={liste} />
      )}
    </div>
  );
}
