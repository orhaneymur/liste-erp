import { MarkaIzgarasi } from "@/components/MarkaIzgarasi";
import { ayarlarOku, istatistik, markalar } from "@/lib/veri";
import { sayiBicimle } from "@/lib/bicim";

export default async function AnaSayfa() {
  const ayarlar = ayarlarOku();
  const liste = await markalar();
  const bilgi = await istatistik();

  return (
    <div>
      <header className="mb-8">
        <p className="etiket">Marka seçin</p>

        {/* Gradyanın üç kullanım yerinden biri — yalnızca ana başlık */}
        <h1 className="baslik-gradyan mt-2 text-[27px] font-semibold leading-tight tracking-tight text-balance sm:text-[32px]">
          {ayarlar.firmaAdi} fiyat listesi
        </h1>

        {ayarlar.sloganMetni && (
          <p className="mt-2.5 max-w-[58ch] text-[14.5px] leading-relaxed text-metin-2">
            {ayarlar.sloganMetni}
          </p>
        )}

        {liste.length > 0 && (
          <div className="yuzey mt-6 flex flex-wrap overflow-hidden rounded-kart">
            <Sayac deger={sayiBicimle(bilgi.markaSayisi)} etiket="marka" />
            <Sayac deger={sayiBicimle(bilgi.modelSayisi)} etiket="model" />
            <Sayac deger={sayiBicimle(bilgi.urunSayisi)} etiket="parça" />
            <div className="flex-1 basis-[130px] border-r border-kenar px-[18px] py-[15px] last:border-r-0">
              <span className="flex items-center gap-1.5 font-mono text-[15px] font-semibold text-var">
                <span className="size-1.5 rounded-full bg-current" />
                canlı
              </span>
              <span className="text-xs text-metin-3">stoktan güncellenir</span>
            </div>
          </div>
        )}
      </header>

      {liste.length === 0 ? (
        <div className="yuzey rounded-kart p-12 text-center">
          <h2 className="text-base font-medium text-metin">
            {bilgi.erpHatasi ? "Liste şu an açılamadı" : "Listede yayınlanmış ürün yok"}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-metin-2">
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

function Sayac({ deger, etiket }: { deger: string; etiket: string }) {
  return (
    <div className="flex-1 basis-[130px] border-r border-kenar px-[18px] py-[15px] last:border-r-0">
      <span className="rakam block font-mono text-[21px] font-semibold tracking-tight text-metin">
        {deger}
      </span>
      <span className="text-xs text-metin-3">{etiket}</span>
    </div>
  );
}
