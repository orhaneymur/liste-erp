import type { Metadata } from "next";
import { Boxes, Clock, FileSpreadsheet, Layers, Smartphone, Tag } from "lucide-react";
import { AyarFormu } from "@/components/admin/AyarFormu";
import { CikisButonu } from "@/components/admin/CikisButonu";
import { GirisFormu } from "@/components/admin/GirisFormu";
import { PaylasKarti } from "@/components/admin/PaylasKarti";
import { YuklemeFormu } from "@/components/admin/YuklemeFormu";
import { oturumVarMi, varsayilanSifreMi } from "@/lib/oturum";
import { ayarlarOku, istatistik } from "@/lib/veri";
import { sayiBicimle, tarihBicimle } from "@/lib/bicim";

export const metadata: Metadata = {
  title: "Yönetim paneli",
  robots: { index: false, follow: false },
};

export default async function AdminSayfasi() {
  if (!(await oturumVarMi())) {
    return <GirisFormu varsayilanSifre={varsayilanSifreMi()} />;
  }

  const bilgi = istatistik();
  const ayarlar = ayarlarOku();

  const kartlar = [
    { etiket: "Marka", deger: bilgi.markaSayisi, Ikon: Tag, renk: "text-vurgu-300" },
    { etiket: "Kategori", deger: bilgi.kategoriSayisi, Ikon: Layers, renk: "text-mor-400" },
    { etiket: "Model", deger: bilgi.modelSayisi, Ikon: Smartphone, renk: "text-emerald-300" },
    { etiket: "Ürün satırı", deger: bilgi.urunSayisi, Ikon: Boxes, renk: "text-altin-400" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Yönetim paneli</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
            <Clock className="size-3.5" />
            Son güncelleme: {tarihBicimle(bilgi.guncellenmeTarihi)}
            {bilgi.kaynakDosya && (
              <span className="flex items-center gap-1.5 text-slate-500">
                <FileSpreadsheet className="size-3.5" />
                {bilgi.kaynakDosya}
              </span>
            )}
          </p>
        </div>
        <CikisButonu />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {kartlar.map(({ etiket, deger, Ikon, renk }) => (
          <div key={etiket} className="cam rounded-2xl px-4 py-3.5">
            <Ikon className={`size-4 ${renk}`} />
            <p className="mt-2 text-2xl font-black leading-none text-white">
              {sayiBicimle(deger)}
            </p>
            <p className="mt-1 text-xs text-slate-400">{etiket}</p>
          </div>
        ))}
      </div>

      <YuklemeFormu />
      <PaylasKarti />
      <AyarFormu ayarlar={ayarlar} />
    </div>
  );
}
