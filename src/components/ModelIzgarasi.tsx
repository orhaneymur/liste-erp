"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { paraBicimle } from "@/lib/bicim";
import { sadeMetin } from "@/lib/slug";
import type { ModelOzeti } from "@/lib/tipler";

/**
 * Model secimi (3. adim).
 *
 * Bir markanin bir kategorisinde yuzlerce model olabiliyor; filtre kutusu
 * bu yuzden burada her zaman acik. Liste duzeni kart izgarasindan daha
 * hizli taranir: goz tek sutunda asagi iner.
 */
export function ModelIzgarasi({
  markaSlug,
  kategoriSlug,
  modeller,
}: {
  markaSlug: string;
  kategoriSlug: string;
  modeller: ModelOzeti[];
}) {
  const [sorgu, setSorgu] = useState("");

  const liste = useMemo(() => {
    const sade = sadeMetin(sorgu).trim();
    if (!sade) return modeller;
    return modeller.filter((m) => sadeMetin(m.ad).includes(sade));
  }, [modeller, sorgu]);

  return (
    <section>
      {modeller.length > 8 && (
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-metin-3" />
          <input
            type="search"
            value={sorgu}
            onChange={(o) => setSorgu(o.target.value)}
            placeholder="Model ara"
            className="w-full rounded-lg border border-kenar bg-zemin py-2 pl-9 pr-3 text-sm text-metin placeholder:text-metin-3 focus:border-metin focus:outline-none"
          />
        </div>
      )}

      {liste.length === 0 ? (
        <p className="py-10 text-center text-sm text-metin-3">
          &ldquo;{sorgu}&rdquo; için model bulunamadı.
        </p>
      ) : (
        <ul className="kart divide-y divide-kenar overflow-hidden">
          {liste.map((model) => (
            <li key={model.slug}>
              <Link
                href={`/marka/${markaSlug}/${kategoriSlug}/${model.slug}`}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-zemin-2"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-metin">
                    {model.ad}
                  </span>
                  <span className="block text-xs text-metin-3">
                    {model.cesitSayisi} seçenek
                  </span>
                </span>

                {model.enUcuz !== null && (
                  <span className="shrink-0 text-right">
                    <span className="block text-xs text-metin-3">en düşük</span>
                    <span className="block text-sm font-medium text-metin">
                      {paraBicimle(model.enUcuz, model.paraBirimi)}
                    </span>
                  </span>
                )}

                <ChevronRight className="size-4 shrink-0 text-metin-3" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
