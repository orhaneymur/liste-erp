"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, TriangleAlert } from "lucide-react";
import { MarkaLogosu } from "./MarkaLogosu";
import { slugla } from "@/lib/slug";
import type { MarkaOzeti } from "@/lib/tipler";

export function MarkaIzgarasi({ markalar }: { markalar: MarkaOzeti[] }) {
  const [filtre, setFiltre] = useState("");

  const gorunen = useMemo(() => {
    const anahtar = slugla(filtre);
    if (!anahtar) return markalar;
    return markalar.filter((m) => m.slug.includes(anahtar));
  }, [filtre, markalar]);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white sm:text-xl">Markanızı seçin</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            Listede {markalar.length} marka var &middot; sonraki adımda kategori ve model seçeceksiniz
          </p>
        </div>

        {markalar.length > 8 && (
          <label className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
            <input
              value={filtre}
              onChange={(o) => setFiltre(o.target.value)}
              placeholder="Marka ara"
              className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 transition focus:border-vurgu-400/60 focus:bg-white/10 focus:outline-none"
              autoComplete="off"
            />
          </label>
        )}
      </div>

      {gorunen.length === 0 ? (
        <div className="cam flex flex-col items-center gap-2 rounded-kart px-6 py-12 text-center">
          <TriangleAlert className="size-6 text-altin-500" />
          <p className="text-sm text-slate-300">Bu isimde bir marka bulunamadı.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
          {gorunen.map((marka, indeks) => (
            <li
              key={marka.slug}
              className="animate-yukari"
              style={{ animationDelay: `${Math.min(indeks * 28, 420)}ms` }}
            >
              <Link
                href={`/marka/${marka.slug}`}
                className="isikli-kart cam group flex h-full flex-col items-center gap-3 rounded-kart p-4 hover:-translate-y-1 hover:border-vurgu-400/40 hover:shadow-[0_18px_45px_-18px_rgba(59,130,246,0.65)] sm:p-5"
              >
                <span className="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-2xl bg-white p-4 shadow-inner transition group-hover:scale-[1.03] sm:h-24">
                  <MarkaLogosu
                    marka={marka.ad}
                    className="max-h-12 max-w-[80%] object-contain"
                  />
                </span>

                <span className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm font-bold leading-tight text-white sm:text-[15px]">
                    {marka.ad}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {marka.modelSayisi} model &middot; {marka.kategoriSayisi} kategori
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
