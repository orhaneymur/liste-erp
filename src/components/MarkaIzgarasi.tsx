"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { MarkaLogosu } from "./MarkaLogosu";
import { sadeMetin } from "@/lib/slug";
import type { MarkaOzeti } from "@/lib/tipler";

/**
 * Marka secimi (1. adim).
 *
 * Marka sayisi az oldugu surece filtre kutusu gizli durur; on ustunde
 * marka varsa aramak yazmaktan hizli olur.
 */
export function MarkaIzgarasi({ markalar }: { markalar: MarkaOzeti[] }) {
  const [sorgu, setSorgu] = useState("");
  const filtreGoster = markalar.length > 10;

  const liste = useMemo(() => {
    const sade = sadeMetin(sorgu).trim();
    if (!sade) return markalar;
    return markalar.filter((m) => sadeMetin(m.ad).includes(sade));
  }, [markalar, sorgu]);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-sm font-medium text-metin-2">Marka seçin</h2>

        {filtreGoster && (
          <div className="relative w-44 sm:w-56">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-metin-3" />
            <input
              type="search"
              value={sorgu}
              onChange={(o) => setSorgu(o.target.value)}
              placeholder="Marka ara"
              className="w-full rounded-lg border border-kenar bg-zemin py-1.5 pl-8 pr-2.5 text-sm text-metin placeholder:text-metin-3 focus:border-metin focus:outline-none"
            />
          </div>
        )}
      </div>

      {liste.length === 0 ? (
        <p className="py-10 text-center text-sm text-metin-3">
          &ldquo;{sorgu}&rdquo; için marka bulunamadı.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {liste.map((marka) => (
            <li key={marka.slug}>
              <Link
                href={`/marka/${marka.slug}`}
                className="kart-baglanti flex h-full items-center gap-3 p-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center">
                  <MarkaLogosu marka={marka.ad} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-metin">
                    {marka.ad}
                  </span>
                  <span className="block text-xs text-metin-3">
                    {marka.modelSayisi} model
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
