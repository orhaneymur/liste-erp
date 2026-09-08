"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Search, X } from "lucide-react";
import type { AramaSonucu } from "@/lib/veri";

/**
 * Model arama. Marka ve kategori adimlarini atlayip dogrudan modele
 * gitmek icin — telefondan bakan tamirci genelde model adini biliyor.
 * Ctrl+K ile acilir, Esc ile kapanir.
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
    }, 200);

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
        className="yuzey flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-metin-2 transition hover:border-kenar-parlak hover:bg-yuzey-2 hover:text-metin"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">Model ara</span>
        <kbd className="ml-1 hidden rounded border border-kenar px-1.5 py-px font-mono text-[10px] text-metin-3 sm:inline">
          Ctrl K
        </kbd>
      </button>

      {acik && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={kapat} role="presentation">
          <div
            className="mx-auto mt-[11vh] w-[92%] max-w-xl overflow-hidden rounded-2xl border border-kenar bg-zemin-2 shadow-2xl"
            onClick={(o) => o.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-kenar px-4">
              <Search className="size-4 shrink-0 text-metin-3" />
              <input
                ref={girdiRef}
                type="search"
                value={sorgu}
                onChange={(o) => setSorgu(o.target.value)}
                placeholder="Model adı yazın — iPhone 11, A53, Redmi Note 12…"
                className="w-full bg-transparent py-4 text-sm text-metin placeholder:text-metin-3 focus:outline-none"
              />
              {yukleniyor && <LoaderCircle className="size-4 shrink-0 animate-spin text-metin-3" />}
              <button
                type="button"
                onClick={kapat}
                aria-label="Kapat"
                className="shrink-0 text-metin-3 transition hover:text-metin"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {sorgu.trim().length < 2 ? (
                <p className="px-4 py-10 text-center text-sm text-metin-3">
                  Aramak için en az iki harf yazın.
                </p>
              ) : sonuclar.length === 0 && !yukleniyor ? (
                <p className="px-4 py-10 text-center text-sm text-metin-3">
                  &ldquo;{sorgu}&rdquo; için model bulunamadı.
                </p>
              ) : (
                <ul className="divide-y divide-kenar">
                  {sonuclar.map((sonuc) =>
                    sonuc.kategoriler.map((kategori) => (
                      <li key={`${sonuc.markaSlug}-${sonuc.modelSlug}-${kategori.slug}`}>
                        <Link
                          href={`/marka/${sonuc.markaSlug}/${kategori.slug}/${sonuc.modelSlug}`}
                          onClick={kapat}
                          className="flex items-center gap-3 px-4 py-3 transition hover:bg-yuzey"
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-metin">
                              {sonuc.marka} {sonuc.model}
                            </span>
                            <span className="block text-xs text-metin-3">
                              {kategori.ad} · {kategori.adet} seçenek
                            </span>
                          </span>
                        </Link>
                      </li>
                    )),
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
