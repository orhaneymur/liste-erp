"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Search, TriangleAlert, X } from "lucide-react";
import { MarkaLogosu } from "./MarkaLogosu";
import { paraBicimle } from "@/lib/bicim";
import type { AramaSonucu } from "@/lib/veri";

/**
 * Ust bardaki model arama kutusu.
 * Marka/kategori adimlarini atlayip dogrudan modele gitmek icin kullanilir.
 */
export function Arama() {
  const [acik, setAcik] = useState(false);
  const [sorgu, setSorgu] = useState("");
  const [sonuclar, setSonuclar] = useState<AramaSonucu[]>([]);
  const [yukleniyor, setYukleniyor] = useState(false);
  const girdiRef = useRef<HTMLInputElement>(null);

  const kapat = useCallback(() => {
    setAcik(false);
    setSorgu("");
    setSonuclar([]);
  }, []);

  // Klavye kisayollari: Ctrl+K ac, Esc kapat
  useEffect(() => {
    const dinleyici = (olay: KeyboardEvent) => {
      if ((olay.ctrlKey || olay.metaKey) && olay.key.toLowerCase() === "k") {
        olay.preventDefault();
        setAcik(true);
      }
      if (olay.key === "Escape") kapat();
    };
    window.addEventListener("keydown", dinleyici);
    return () => window.removeEventListener("keydown", dinleyici);
  }, [kapat]);

  useEffect(() => {
    if (acik) {
      document.body.style.overflow = "hidden";
      girdiRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [acik]);

  // Yazarken (gecikmeli) arama
  useEffect(() => {
    if (sorgu.trim().length < 2) {
      setSonuclar([]);
      setYukleniyor(false);
      return;
    }
    setYukleniyor(true);
    const iptal = new AbortController();
    const zamanlayici = setTimeout(async () => {
      try {
        const cevap = await fetch(`/api/ara?q=${encodeURIComponent(sorgu)}`, {
          signal: iptal.signal,
        });
        const veri = (await cevap.json()) as { sonuclar: AramaSonucu[] };
        setSonuclar(veri.sonuclar ?? []);
      } catch {
        /* istek iptal edildi */
      } finally {
        setYukleniyor(false);
      }
    }, 220);

    return () => {
      clearTimeout(zamanlayici);
      iptal.abort();
    };
  }, [sorgu]);

  return (
    <>
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition hover:border-vurgu-400/50 hover:bg-white/10 hover:text-white sm:px-4"
        aria-label="Model ara"
      >
        <Search className="size-4 shrink-0 text-slate-400 transition group-hover:text-vurgu-300" />
        <span className="hidden sm:inline">Model ara...</span>
        <kbd className="ml-2 hidden rounded border border-white/15 bg-black/30 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:inline">
          Ctrl K
        </kbd>
      </button>

      {acik && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6">
          <button
            type="button"
            aria-label="Aramayı kapat"
            onClick={kapat}
            className="animate-suzul absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />

          <div className="animate-suzul cam-koyu relative mt-2 w-full max-w-2xl overflow-hidden rounded-3xl shadow-2xl shadow-black/60 sm:mt-10">
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <Search className="size-5 shrink-0 text-vurgu-400" />
              <input
                ref={girdiRef}
                value={sorgu}
                onChange={(o) => setSorgu(o.target.value)}
                placeholder="iPhone 11, Galaxy A53, Redmi Note 12..."
                className="w-full bg-transparent text-base text-white placeholder:text-slate-500 focus:outline-none"
                autoComplete="off"
                spellCheck={false}
              />
              {yukleniyor && (
                <LoaderCircle className="size-4 shrink-0 animate-spin text-slate-400" />
              )}
              <button
                type="button"
                onClick={kapat}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Kapat"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[65dvh] overflow-y-auto overscroll-contain">
              {sorgu.trim().length < 2 && (
                <p className="px-5 py-8 text-center text-sm text-slate-500">
                  Aradığınız modelin en az 2 harfini yazın.
                </p>
              )}

              {sorgu.trim().length >= 2 && !yukleniyor && sonuclar.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                  <TriangleAlert className="size-6 text-altin-500" />
                  <p className="text-sm text-slate-400">
                    <span className="font-semibold text-white">&quot;{sorgu}&quot;</span> için sonuç
                    bulunamadı.
                  </p>
                  <p className="text-xs text-slate-500">
                    Marka listesinden adım adım da ilerleyebilirsiniz.
                  </p>
                </div>
              )}

              <ul className="divide-y divide-white/5">
                {sonuclar.map((sonuc) => (
                  <li key={`${sonuc.markaSlug}-${sonuc.modelSlug}`} className="px-3 py-3 sm:px-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
                        <MarkaLogosu marka={sonuc.marka} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{sonuc.model}</p>
                        <p className="truncate text-xs text-slate-400">
                          {sonuc.marka} &middot; {sonuc.cesitSayisi} çeşit
                          {sonuc.enUcuz !== null && (
                            <> &middot; {paraBicimle(sonuc.enUcuz)}&apos;den başlıyor</>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="kaydir-gizli mt-2 flex gap-1.5 overflow-x-auto pl-13">
                      {sonuc.kategoriler.map((kategori) => (
                        <Link
                          key={kategori.slug}
                          href={`/marka/${sonuc.markaSlug}/${kategori.slug}/${sonuc.modelSlug}`}
                          onClick={kapat}
                          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300 transition hover:border-vurgu-400/60 hover:bg-vurgu-500/15 hover:text-white"
                        >
                          {kategori.ad}
                          <span className="ml-1 text-slate-500">{kategori.adet}</span>
                        </Link>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
