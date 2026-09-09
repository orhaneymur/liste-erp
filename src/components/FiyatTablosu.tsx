"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy } from "lucide-react";
import { PARA_SEMBOLU, paraBicimle, tlKarsiligi } from "@/lib/bicim";
import type { Ayarlar, FiyatSatiri } from "@/lib/tipler";

/**
 * Fiyat tablosu (4. adim) — sayfanin asil isi.
 *
 * Duzen bilerek tablo: musteri fiyatlari alt alta karsilastiriyor, o
 * yuzden rakamlar mono, sag hizali ve esit genislikte. Toptan parlak ve
 * kalin, perakende daha sakin — goz once dogru sutuna gidiyor.
 *
 * En uygun satir hem sol kenarindaki gradyan seritle hem hafif mavi
 * zeminle ayrilir; gradyanin sayfadaki uc kullanim yerinden biri budur.
 *
 * Stok yalnizca Var/Yok gosterir; ERP adet vermez.
 *
 * STOKTA OLMAYANIN FIYATI GOSTERILMEZ (karar 8 Eylul 2026): satir listede
 * kalir — musteri parcanin var oldugunu bilsin — ama fiyat yerine cizgi
 * durur ve satir listenin sonuna duser. Kopyalanan metne de fiyatsiz gecer.
 *
 * Uyumlu model rozetleri TIKLANABILIR (10 Eylul 2026): yol erp.ts'te
 * onceden cozulur (uyumluCoz). Listede olmayan model gri kalir ve
 * baglanti almaz — tiklayinca bos sayfa acilmasin.
 */

type Siralama = "ucuz" | "pahali" | "ad";

const SIRALAMALAR: { deger: Siralama; etiket: string }[] = [
  { deger: "ucuz", etiket: "Önce ucuz" },
  { deger: "pahali", etiket: "Önce pahalı" },
  { deger: "ad", etiket: "A-Z" },
];

export function FiyatTablosu({
  satirlar,
  ayarlar,
  baslik,
}: {
  satirlar: FiyatSatiri[];
  ayarlar: Ayarlar;
  baslik: { marka: string; kategori: string; model: string };
}) {
  const [siralama, setSiralama] = useState<Siralama>("ucuz");
  const [kdvli, setKdvli] = useState(ayarlar.kdvDahil);
  const [kopyalandi, setKopyalandi] = useState(false);

  const toptanVar = ayarlar.toptanGoster;
  const perakendeVar = ayarlar.perakendeGoster;

  /** KDV secilmisse oran eklenir (ERP fiyatlari KDV haric tutar) */
  const fiyatla = (deger: number | null): number | null => {
    if (deger === null) return null;
    if (!kdvli || ayarlar.kdvDahil) return deger;
    return deger * (1 + ayarlar.kdvOrani / 100);
  };

  const liste = useMemo(() => {
    const kopya = [...satirlar];
    const anahtar = (s: FiyatSatiri) => s.toptan ?? s.perakende ?? 0;
    const yokMu = (s: FiyatSatiri) => (s.stok === "Yok" ? 1 : 0);

    kopya.sort((a, b) => {
      // Fiyati gorunmeyen satirlar arada durmasin, sona dussun
      const stokFarki = yokMu(a) - yokMu(b);
      if (stokFarki !== 0) return stokFarki;

      if (siralama === "ucuz") return anahtar(a) - anahtar(b);
      if (siralama === "pahali") return anahtar(b) - anahtar(a);
      return a.kalite.localeCompare(b.kalite, "tr");
    });
    return kopya;
  }, [satirlar, siralama]);

  /** Listeyi WhatsApp'a yapistirilabilir duz metin olarak kopyalar */
  const kopyala = async () => {
    const satirMetni = liste.map((s) => {
      // Stokta olmayanin fiyati kopyalanan metne de girmez
      if (s.stok === "Yok") return `${s.kalite}  (stokta yok)`;

      const fiyatlar = [
        toptanVar && s.toptan !== null
          ? `Toptan ${paraBicimle(fiyatla(s.toptan), s.paraBirimi)}`
          : "",
        perakendeVar && s.perakende !== null
          ? `Perakende ${paraBicimle(fiyatla(s.perakende), s.paraBirimi)}`
          : "",
      ]
        .filter(Boolean)
        .join("  ");
      return `${s.kalite}  ${fiyatlar}`;
    });

    const metin = [
      `${baslik.marka} ${baslik.model} — ${baslik.kategori}`,
      ...satirMetni,
      kdvli ? `Fiyatlara %${ayarlar.kdvOrani} KDV dahildir.` : "Fiyatlara KDV dahil değildir.",
    ].join("\n");

    try {
      await navigator.clipboard.writeText(metin);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      /* pano izni yoksa sessizce gec */
    }
  };

  if (!satirlar.length) {
    return (
      <p className="yuzey rounded-kart p-10 text-center text-sm text-metin-3">
        Bu model için yayınlanmış fiyat yok.
      </p>
    );
  }

  return (
    <section>
      {/* Araç çubuğu */}
      <div className="yazdirma-gizle mb-3 flex flex-wrap items-center gap-2">
        <div className="yuzey flex rounded-lg p-1">
          {SIRALAMALAR.map(({ deger, etiket }) => (
            <button
              key={deger}
              type="button"
              onClick={() => setSiralama(deger)}
              aria-pressed={siralama === deger}
              className={`rounded-md px-2.5 py-1 text-xs transition ${
                siralama === deger
                  ? "bg-yuzey-2 font-medium text-metin shadow-[inset_0_1px_0_var(--color-kenar-parlak)]"
                  : "text-metin-2 hover:text-metin"
              }`}
            >
              {etiket}
            </button>
          ))}
        </div>

        {!ayarlar.kdvDahil && (
          <button
            type="button"
            onClick={() => setKdvli((v) => !v)}
            aria-pressed={kdvli}
            className={`rounded-lg border px-2.5 py-1.5 text-xs transition ${
              kdvli
                ? "border-mavi/50 bg-mavi/15 text-[#bcd3ff]"
                : "border-kenar bg-yuzey text-metin-2 hover:border-kenar-parlak hover:text-metin"
            }`}
          >
            %{ayarlar.kdvOrani} KDV {kdvli ? "dahil" : "hariç"}
          </button>
        )}

        <button
          type="button"
          onClick={kopyala}
          className="yuzey ml-auto flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-metin-2 transition hover:border-kenar-parlak hover:text-metin"
        >
          {kopyalandi ? <Check className="size-3.5 text-var" /> : <Copy className="size-3.5" />}
          {kopyalandi ? "Kopyalandı" : "Listeyi kopyala"}
        </button>
      </div>

      {/* Tablo */}
      <div className="yuzey overflow-x-auto rounded-kart">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kenar">
              <th scope="col" className="etiket px-4 py-3 text-left text-[10.5px]">
                Ürün
              </th>
              {toptanVar && (
                <th scope="col" className="etiket px-3 py-3 text-right text-[10.5px]">
                  Toptan
                </th>
              )}
              {perakendeVar && (
                <th scope="col" className="etiket px-3 py-3 text-right text-[10.5px]">
                  Perakende
                </th>
              )}
              <th scope="col" className="etiket px-4 py-3 text-right text-[10.5px]">
                Stok
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-kenar">
            {liste.map((satir, indeks) => {
              const toptan = fiyatla(satir.toptan);
              const perakende = fiyatla(satir.perakende);
              // Kur 0 ise null döner ve TL satırı hiç yazılmaz
              const tlSayi = tlKarsiligi(
                toptan,
                satir.paraBirimi,
                ayarlar.usdKuru,
                ayarlar.eurKuru,
              );
              const stokYok = satir.stok === "Yok";
              const enUygun = satir.enUcuzMu && !stokYok && liste.length > 1;

              return (
                <tr
                  key={satir.stokKodu ?? satir.kalite + indeks}
                  className={`align-top transition ${
                    enUygun ? "bg-mavi/5" : "hover:bg-white/[0.022]"
                  }`}
                >
                  <td className="relative px-4 py-3.5">
                    {enUygun && (
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-mavi to-mor"
                      />
                    )}
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[14.5px] font-medium text-metin">{satir.kalite}</span>
                      {/*
                       * Kalite rozeti yalnizca stok adinda GECMEYEN bilgi icin
                       * ("A Kalite", "Servis Orjinal"). Stok adi zaten
                       * "... CITASIZ BLACK" iceriyorsa tekrar yazilmaz.
                       */}
                      {satir.kaliteRozeti && (
                        <span className="rounded border border-kenar bg-yuzey px-1.5 py-0.5 text-[10px] font-medium text-metin-2">
                          {satir.kaliteRozeti}
                        </span>
                      )}
                      {enUygun && (
                        <span className="etiket rounded border border-mavi/30 bg-mavi/15 px-1.5 py-0.5 text-[9.5px] text-[#bcd3ff]">
                          en uygun
                        </span>
                      )}
                    </span>
                    {satir.stokKodu && (
                      <span className="mt-1 block font-mono text-[11.5px] text-metin-3">
                        {satir.stokKodu}
                      </span>
                    )}
                    {/*
                     * Muadil modeller: ayni parca baska modellere de uyuyorsa
                     * musterinin musterisi bunu satirda gorsun — aksi halde
                     * "bu benim modelime uyar mi" diye sormak zorunda kaliyor.
                     */}
                    {satir.uyumluBaglantilar && (
                      <span className="mt-1.5 flex flex-wrap items-center gap-1">
                        <span className="text-[10px] uppercase tracking-wide text-metin-3">
                          uyumlu
                        </span>
                        {satir.uyumluBaglantilar.map(({ ad, yol }) =>
                          yol ? (
                            <Link
                              key={ad}
                              href={yol}
                              className="rounded border border-kenar bg-yuzey px-1.5 py-0.5 text-[10.5px] text-metin-2 transition hover:border-mavi/50 hover:bg-mavi/12 hover:text-[#bcd3ff]"
                            >
                              {ad}
                            </Link>
                          ) : (
                            /* Listede olmayan model: yazi olarak durur */
                            <span
                              key={ad}
                              className="rounded bg-yuzey px-1.5 py-0.5 text-[10.5px] text-metin-3"
                            >
                              {ad}
                            </span>
                          ),
                        )}
                      </span>
                    )}
                    {satir.not && (
                      <span className="mt-1 block text-xs text-metin-2">{satir.not}</span>
                    )}
                  </td>

                  {toptanVar && (
                    <td className="whitespace-nowrap px-3 py-3.5 text-right">
                      {stokYok || toptan === null ? (
                        <span className="text-metin-3">—</span>
                      ) : (
                        <>
                          <span className="rakam font-mono text-[15.5px] font-semibold tracking-tight text-metin">
                            {paraBicimle(toptan, satir.paraBirimi)}
                          </span>
                          {tlSayi !== null && (
                            <span className="rakam mt-0.5 block font-mono text-[11.5px] text-metin-3">
                              ≈ {paraBicimle(tlSayi, "TRY")}
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  )}

                  {perakendeVar && (
                    <td className="whitespace-nowrap px-3 py-3.5 text-right">
                      {stokYok || perakende === null ? (
                        <span className="text-metin-3">—</span>
                      ) : (
                        <span className="rakam font-mono text-sm text-metin-2">
                          {paraBicimle(perakende, satir.paraBirimi)}
                        </span>
                      )}
                    </td>
                  )}

                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 text-xs font-medium ${
                        satir.stok === "Yok" ? "bg-yok/12 text-yok" : "bg-var/12 text-var"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {satir.stok}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-metin-3">
        Fiyatlar {PARA_SEMBOLU[liste[0]?.paraBirimi ?? "USD"]} cinsindendir
        {kdvli ? `, %${ayarlar.kdvOrani} KDV dahildir` : ", KDV hariçtir"}.
      </p>
    </section>
  );
}
