"use client";

import { useState } from "react";
import { LoaderCircle, LogOut } from "lucide-react";

export function CikisButonu() {
  const [cikiliyor, setCikiliyor] = useState(false);

  const cik = async () => {
    setCikiliyor(true);
    await fetch("/api/cikis", { method: "POST" });
    // Oturum cerezi httpOnly; sayfayi sunucudan yeniden yukleyerek giris ekranina donuyoruz
    window.location.replace("/admin");
  };

  return (
    <button
      type="button"
      onClick={cik}
      disabled={cikiliyor}
      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:border-rose-400/40 hover:text-rose-300 disabled:opacity-50"
    >
      {cikiliyor ? (
        <LoaderCircle className="size-3.5 animate-spin" />
      ) : (
        <LogOut className="size-3.5" />
      )}
      Çıkış yap
    </button>
  );
}
