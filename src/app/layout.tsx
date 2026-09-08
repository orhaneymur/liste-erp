import type { Metadata, Viewport } from "next";
import "./globals.css";
import { UstBar } from "@/components/UstBar";
import { AltBilgi } from "@/components/AltBilgi";
import { ayarlarOku } from "@/lib/veri";

/*
 * Sayfalar ONBELLEGE ALINIR ve 60 saniyede bir tazelenir.
 *
 * Eskiden burada "force-dynamic" vardi: Excel her an yuklenebildigi icin
 * her istek sifirdan uretiliyordu. Artik veri ERP'den geliyor ve zaten
 * 60 saniyede bir tazeleniyor; her ziyaretcide sayfayi yeniden uretmenin
 * anlami yok. Ilk bayt 1,4 saniyeden ~20 milisaniyeye bu sayede indi.
 */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const ayarlar = ayarlarOku();
  return {
    title: {
      default: `${ayarlar.firmaAdi} — Fiyat Listesi`,
      template: `%s | ${ayarlar.firmaAdi}`,
    },
    description:
      ayarlar.sloganMetni ||
      "Güncel toptan ve perakende yedek parça fiyatları. Marka, kategori ve model seçerek fiyatları görüntüleyin.",
    // Liste müşteriye özel bir link; arama motorlarına açılmaz.
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const ayarlar = ayarlarOku();

  return (
    <html lang="tr">
      <body className="min-h-dvh antialiased">
        <div className="flex min-h-dvh flex-col">
          <UstBar firmaAdi={ayarlar.firmaAdi} />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-8 sm:px-6">
            {children}
          </main>
          <AltBilgi ayarlar={ayarlar} />
        </div>
      </body>
    </html>
  );
}
