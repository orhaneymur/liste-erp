import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker imaji icin: kendi sunucusunu ve yalnizca kullanilan
  // bagimliliklari tasiyan tek klasorluk cikti uretir.
  output: "standalone",

  // Proje klasorunu sabitler (ust klasorlerdeki lock dosyalari karisiklik yapmasin)
  turbopack: {
    root: process.cwd(),
  },

  // exceljs sadece sunucu tarafinda kullanilir, istemci paketine dahil edilmesin
  serverExternalPackages: ["exceljs"],
};

export default nextConfig;
