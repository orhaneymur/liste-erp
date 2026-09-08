import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ArkaPlan } from "@/components/ArkaPlan";
import { UstBar } from "@/components/UstBar";
import { AltBilgi } from "@/components/AltBilgi";
import { ayarlarOku } from "@/lib/veri";

// Fiyat listesi Excel yuklemesiyle degistigi icin sayfalar her istekte taze uretilir
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const ayarlar = ayarlarOku();
  return {
    title: {
      default: `${ayarlar.firmaAdi} | Güncel Fiyat Listesi`,
      template: `%s | ${ayarlar.firmaAdi}`,
    },
    description:
      ayarlar.sloganMetni ||
      "Telefon yedek parça toptan ve perakende fiyat listesi. Marka, kategori ve model seçerek güncel fiyatları görüntüleyin.",
    openGraph: {
      title: `${ayarlar.firmaAdi} | Güncel Fiyat Listesi`,
      description: ayarlar.sloganMetni,
      type: "website",
      locale: "tr_TR",
    },
    robots: { index: false, follow: false },
  };
}

export const viewport: Viewport = {
  themeColor: "#05070f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const ayarlar = ayarlarOku();

  return (
    <html lang="tr">
      <body className="min-h-dvh antialiased">
        <ArkaPlan />
        <div className="relative flex min-h-dvh flex-col">
          <UstBar firmaAdi={ayarlar.firmaAdi} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
            {children}
          </main>
          <AltBilgi ayarlar={ayarlar} />
        </div>
      </body>
    </html>
  );
}
