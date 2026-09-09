import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { UstBar } from "@/components/UstBar";
import { AltBilgi } from "@/components/AltBilgi";
import { WhatsappDugmesi } from "@/components/WhatsappDugmesi";
import { ayarlarOku } from "@/lib/veri";

/*
 * Yazi tipleri derleme sirasinda imaja gomulur (next/font). Google'a
 * calisma aninda istek GITMEZ; ziyaretcinin tarayicisi disaridan hicbir
 * sey indirmez.
 *
 * latin-ext alt kumesi Turkce karakterler icin sart: onsuz ı ğ ş ç ö ü
 * yedek yazi tipine duser ve satirlar birbirini tutmaz.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--yazi-sans",
  display: "swap",
});

/** Fiyatlar, stok kodlari ve sayaclar — katalog hissini bu veriyor */
const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--yazi-mono",
  display: "swap",
});

/*
 * Sayfalar onbellege alinir, 60 saniyede bir tazelenir.
 *
 * Eskiden "force-dynamic" vardi: Excel her an yuklenebildigi icin her
 * istek sifirdan uretiliyordu. Artik veri ERP'den geliyor ve zaten 60
 * saniyede bir tazeleniyor. Ilk bayt 1,4 saniyeden ~20 milisaniyeye bu
 * sayede indi.
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
      "Güncel toptan ve perakende yedek parça fiyatları. Marka, parça türü ve model seçerek fiyatları görüntüleyin.",
    // Liste müşteriye özel bir link; arama motorlarına açılmaz.
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#070b14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const ayarlar = ayarlarOku();

  return (
    <html lang="tr" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh antialiased">
        <div className="hale" aria-hidden />
        <div className="relative flex min-h-dvh flex-col">
          <UstBar firmaAdi={ayarlar.firmaAdi} />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-16 pt-7 sm:px-6">
            {children}
          </main>
          <AltBilgi ayarlar={ayarlar} />
        </div>
        <WhatsappDugmesi numara={ayarlar.whatsapp} />
      </body>
    </html>
  );
}
