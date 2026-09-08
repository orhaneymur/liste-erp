import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proje klasorunu sabitler (ust klasorlerdeki lock dosyalari karisiklik yapmasin)
  turbopack: {
    root: process.cwd(),
  },

  // exceljs sadece sunucu tarafinda kullanilir, istemci paketine dahil edilmesin
  serverExternalPackages: ["exceljs"],
};

export default nextConfig;
