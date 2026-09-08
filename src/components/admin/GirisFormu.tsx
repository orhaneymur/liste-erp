"use client";

import { useState } from "react";
import { Eye, EyeOff, KeyRound, LoaderCircle, TriangleAlert } from "lucide-react";

export function GirisFormu({ varsayilanSifre }: { varsayilanSifre: boolean }) {
  const [sifre, setSifre] = useState("");
  const [gorunur, setGorunur] = useState(false);
  const [hata, setHata] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);

  const gonder = async (olay: React.FormEvent) => {
    olay.preventDefault();
    setHata("");
    setGonderiliyor(true);
    try {
      const cevap = await fetch("/api/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre }),
      });
      if (cevap.ok) {
        // Oturum cerezi httpOnly oldugu icin paneli sunucudan tazeleyerek aciyoruz
        window.location.replace("/admin");
        return;
      }
      const veri = (await cevap.json()) as { hata?: string };
      setHata(veri.hata ?? "Giriş yapılamadı.");
      setGonderiliyor(false);
    } catch {
      setHata("Sunucuya ulaşılamadı.");
      setGonderiliyor(false);
    }
  };

  return (
    <div className="mx-auto max-w-md pt-8">
      <div className="cam animate-yukari rounded-[1.5rem] p-6 sm:p-8">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-vurgu-500 to-mor-600 shadow-lg shadow-vurgu-600/30">
          <KeyRound className="size-6 text-white" />
        </span>

        <h1 className="mt-4 text-xl font-black text-white">Yönetim paneli</h1>
        <p className="mt-1 text-sm text-slate-400">
          Fiyat listesini güncellemek için şifrenizi girin.
        </p>

        <form onSubmit={gonder} className="mt-6 space-y-3">
          <div className="relative">
            <input
              type={gorunur ? "text" : "password"}
              value={sifre}
              onChange={(o) => setSifre(o.target.value)}
              placeholder="Şifre"
              autoFocus
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-4 pr-12 text-[15px] text-white placeholder:text-slate-500 transition focus:border-vurgu-400/60 focus:bg-white/[0.08] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setGorunur((o) => !o)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:text-white"
              aria-label={gorunur ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {gorunur ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>

          {hata && (
            <p className="flex items-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
              <TriangleAlert className="size-4 shrink-0" />
              {hata}
            </p>
          )}

          <button
            type="submit"
            disabled={gonderiliyor || !sifre}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-vurgu-500 to-mor-600 py-3 text-sm font-bold text-white shadow-lg shadow-vurgu-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {gonderiliyor && <LoaderCircle className="size-4 animate-spin" />}
            Giriş yap
          </button>
        </form>

        {varsayilanSifre && (
          <div className="mt-5 rounded-xl border border-altin-400/25 bg-altin-400/10 px-3.5 py-3 text-xs leading-relaxed text-altin-400">
            <strong className="font-bold">Varsayılan şifre: admin123</strong>
            <br />
            Güvenlik için proje klasöründeki{" "}
            <code className="rounded bg-black/30 px-1 py-0.5">.env.local</code> dosyasına
            <code className="ml-1 rounded bg-black/30 px-1 py-0.5">ADMIN_SIFRE=yeni-şifre</code>{" "}
            yazıp sunucuyu yeniden başlatın.
          </div>
        )}
      </div>
    </div>
  );
}
