"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search, TriangleAlert } from "lucide-react";
import { paraBicimle, sayiBicimle } from "@/lib/bicim";
import { slugla } from "@/lib/slug";
import type { ModelOzeti } from "@/lib/tipler";

export function ModelIzgarasi({
  markaSlug,
  kategoriSlug,
  modeller,
}: {
  markaSlug: string;
  kategoriSlug: string;
  modeller: ModelOzeti[];
}) {
  const [filtre, setFiltre] = useState("");

  const gorunen = useMemo(() => {
    const parcalar = slugla(filtre).split("-").filter(Boolean);
    if (!parcalar.length) return modeller;
    return modeller.filter((m) => parcalar.every((p) => m.slug.includes(p)));
  }, [filtre, modeller]);

  return (
    <div>
      <label className="relative mb-4 block">
        <Search className="absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-500" />
        <input
          value={filtre}
          onChange={(o) => setFiltre(o.target.value)}
          placeholder={`Model ara (${modeller.length} model)`}
          className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-11 pr-4 text-[15px] text-white placeholder:text-slate-500 transition focus:border-vurgu-400/60 focus:bg-white/[0.08] focus:outline-none"
          autoComplete="off"
          spellCheck={false}
          inputMode="search"
        />
      </label>

      {gorunen.length === 0 ? (
        <div className="cam flex flex-col items-center gap-2 rounded-kart px-6 py-12 text-center">
          <TriangleAlert className="size-6 text-altin-500" />
          <p className="text-sm text-slate-300">Bu isimde bir model bulunamadı.</p>
          <button
            type="button"
            onClick={() => setFiltre("")}
            className="mt-1 text-xs font-medium text-vurgu-300 underline-offset-4 hover:underline"
          >
            Aramayı temizle
          </button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {gorunen.map((model, indeks) => (
            <li
              key={model.slug}
              className="animate-yukari"
              style={{ animationDelay: `${Math.min(indeks * 18, 300)}ms` }}
            >
              <Link
                href={`/marka/${markaSlug}/${kategoriSlug}/${model.slug}`}
                className="isikli-kart cam group flex h-full items-center gap-3 rounded-2xl px-4 py-3.5 hover:-translate-y-0.5 hover:border-vurgu-400/40 hover:shadow-[0_14px_35px_-16px_rgba(59,130,246,0.6)]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-semibold text-white">
                    {model.ad}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-400">
                    {model.cesitSayisi} kalite seçeneği
                  </span>
                </span>

                <span className="flex shrink-0 flex-col items-end">
                  {model.enUcuz !== null && (
                    <span className="text-sm font-bold text-emerald-300">
                      {model.enUcuz === model.enPahali
                        ? paraBicimle(model.enUcuz, model.paraBirimi)
                        : `${sayiBicimle(model.enUcuz)} - ${paraBicimle(model.enPahali, model.paraBirimi)}`}
                    </span>
                  )}
                  <span className="text-[10px] uppercase tracking-wide text-slate-500">
                    toptan aralık
                  </span>
                </span>

                <ChevronRight className="size-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-vurgu-300" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
