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
 * Logolar bilerek buyuk (48px): musteri markayi okuyarak degil gorerek
 * seciyor. Filtre kutusu ancak on ustunde marka varsa cikar.
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
        <p className="etiket">Marka seçin</p>

        {filtreGoster && (
          <div className="relative w-44 sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-metin-3" />
            <input
              type="search"
              value={sorgu}
              onChange={(o) => setSorgu(o.target.value)}
              placeholder="Marka ara"
              className="yuzey w-full rounded-lg py-2 pl-9 pr-3 text-sm text-metin placeholder:text-metin-3 focus:border-mavi/50 focus:outline-none"
            />
          </div>
        )}
      </div>

      {liste.length === 0 ? (
        <p className="py-12 text-center text-sm text-metin-3">
          &ldquo;{sorgu}&rdquo; için marka bulunamadı.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {liste.map((marka) => (
            <li key={marka.slug}>
              <Link
                href={`/marka/${marka.slug}`}
                className="yuzey flex h-full items-center gap-3.5 rounded-kart p-3.5 transition duration-150 hover:-translate-y-0.5 hover:border-mavi/45 hover:bg-yuzey-2"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/90 p-2">
                  <MarkaLogosu marka={marka.ad} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-medium text-metin">
                    {marka.ad}
                  </span>
                  <span className="block text-xs text-metin-3">{marka.modelSayisi} model</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
