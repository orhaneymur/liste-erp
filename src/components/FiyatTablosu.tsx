"use client";

import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import { PARA_SEMBOLU, paraBicimle, tlKarsiligi } from "@/lib/bicim";
import type { Ayarlar, FiyatSatiri } from "@/lib/tipler";

/**
 * Fiyat tablosu (4. adim) — sayfanin asil isi.
 *
 * Duzen bilerek tablo: musteri fiyatlari alt alta karsilastiriyor, o
 * yuzden sayilar sag hizali ve esit genislikte (globals.css'te
 * tabular-nums). Kart izgarasi bu isi zorlastiriyordu.
 *
 * Ucuncu bir sutun olarak stok yalnizca Var/Yok gosterir; ERP adet
 * vermez.
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

  /** KDV secilmisse fiyata oran eklenir (ERP fiyatlari KDV haric tutar) */
  const fiyatla = (deger: number | null): number | null => {
    if (deger === null) return null;
    if (!kdvli || ayarlar.kdvDahil) return deger;
    return deger * (1 + ayarlar.kdvOrani / 100);
  };

  const liste = useMemo(() => {
    const kopya = [...satirlar];
    const anahtar = (s: FiyatSatiri) => s.toptan ?? s.perakende ?? 0;
    if (siralama === "ucuz") kopya.sort((a, b) => anahtar(a) - anahtar(b));
    else if (siralama === "pahali") kopya.sort((a, b) => anahtar(b) - anahtar(a));
    else kopya.sort((a, b) => a.kalite.localeCompare(b.kalite, "tr"));
    return kopya;
  }, [satirlar, siralama]);

  /** Listeyi WhatsApp'a yapistirilabilir duz metin olarak kopyalar */
  const kopyala = async () => {
    const satirMetni = liste.map((s) => {
      const fiyatlar = [
        toptanVar && s.toptan !== null ? `Toptan ${paraBicimle(fiyatla(s.toptan), s.paraBirimi)}` : "",
        perakendeVar && s.perakende !== null
          ? `Perakende ${paraBicimle(fiyatla(s.perakende), s.paraBirimi)}`
          : "",
      ]
        .filter(Boolean)
        .join("  ");
      return `${s.kalite}  ${fiyatlar}${s.stok === "Yok" ? "  (stokta yok)" : ""}`;
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
      <p className="kart p-8 text-center text-sm text-metin-3">
        Bu model için yayınlanmış fiyat yok.
      </p>
    );
  }

  return (
    <section>
      {/* Araç çubuğu */}
      <div className="yazdirma-gizle mb-3 flex flex-wrap items-center gap-2">
        <div className="flex rounded-lg border border-kenar p-0.5">
          {SIRALAMALAR.map(({ deger, etiket }) => (
            <button
              key={deger}
              type="button"
              onClick={() => setSiralama(deger)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                siralama === deger
                  ? "bg-metin text-white"
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
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
              kdvli
                ? "border-metin bg-metin text-white"
                : "border-kenar text-metin-2 hover:border-metin hover:text-metin"
            }`}
          >
            %{ayarlar.kdvOrani} KDV {kdvli ? "dahil" : "hariç"}
          </button>
        )}

        <button
          type="button"
          onClick={kopyala}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-kenar px-2.5 py-1.5 text-xs font-medium text-metin-2 transition hover:border-metin hover:text-metin"
        >
          {kopyalandi ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {kopyalandi ? "Kopyalandı" : "Listeyi kopyala"}
        </button>
      </div>

      {/* Tablo */}
      <div className="kart overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-kenar text-left">
              <th scope="col" className="px-4 py-2.5 text-xs font-medium text-metin-3">
                Ürün
              </th>
              {toptanVar && (
                <th scope="col" className="px-3 py-2.5 text-right text-xs font-medium text-metin-3">
                  Toptan
                </th>
              )}
              {perakendeVar && (
                <th scope="col" className="px-3 py-2.5 text-right text-xs font-medium text-metin-3">
                  Perakende
                </th>
              )}
              <th scope="col" className="px-4 py-2.5 text-right text-xs font-medium text-metin-3">
                Stok
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-kenar">
            {liste.map((satir, indeks) => {
              const toptan = fiyatla(satir.toptan);
              const perakende = fiyatla(satir.perakende);
              // Kur 0 ise null doner ve TL satiri hic yazilmaz
              const tlSayi = tlKarsiligi(
                toptan,
                satir.paraBirimi,
                ayarlar.usdKuru,
                ayarlar.eurKuru,
              );

              return (
                <tr key={satir.stokKodu ?? satir.kalite + indeks} className="align-top">
                  <td className="px-4 py-3">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-medium text-metin">{satir.kalite}</span>
                      {satir.enUcuzMu && liste.length > 1 && (
                        <span className="etiket bg-vurgu-hafif text-vurgu">en uygun</span>
                      )}
                    </span>
                    {satir.stokKodu && (
                      <span className="mt-0.5 block font-mono text-xs text-metin-3">
                        {satir.stokKodu}
                      </span>
                    )}
                    {satir.not && (
                      <span className="mt-0.5 block text-xs text-metin-2">{satir.not}</span>
                    )}
                  </td>

                  {toptanVar && (
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {toptan === null ? (
                        <span className="text-metin-3">—</span>
                      ) : (
                        <>
                          <span className="font-medium text-metin">
                            {paraBicimle(toptan, satir.paraBirimi)}
                          </span>
                          {tlSayi !== null && (
                            <span className="block text-xs text-metin-3">
                              ≈ {paraBicimle(tlSayi, "TRY")}
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  )}

                  {perakendeVar && (
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      {perakende === null ? (
                        <span className="text-metin-3">—</span>
                      ) : (
                        <span className="text-metin-2">
                          {paraBicimle(perakende, satir.paraBirimi)}
                        </span>
                      )}
                    </td>
                  )}

                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <span
                      className={`etiket ${
                        satir.stok === "Yok"
                          ? "bg-yok-hafif text-yok"
                          : "bg-var-hafif text-var"
                      }`}
                    >
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
