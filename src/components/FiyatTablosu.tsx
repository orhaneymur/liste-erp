"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  Check,
  Copy,
  Info,
  Link2,
  Percent,
  Printer,
  Share2,
  Star,
} from "lucide-react";
import { PARA_SEMBOLU, paraBicimle, sayiBicimle, tlKarsiligi } from "@/lib/bicim";
import { sadeMetin } from "@/lib/slug";
import type { Ayarlar, FiyatSatiri } from "@/lib/tipler";

type Siralama = "fiyat-artan" | "fiyat-azalan" | "ada-gore";

/**
 * Kalite adindan seviye cikarir: renk seridi her zaman, metin etiketi ise
 * yalnizca kalite adi seviyeyi zaten soylemiyorsa gosterilir.
 * "Servis Orijinal (Kutulu)" -> serit altin, etiket yok (isimde "Orijinal" var)
 * "Standart" -> serit gri + "Ekonomik" etiketi
 */
function kaliteSeviyesi(
  kalite: string,
): { etiket: string; sinif: string; serit: string } | null {
  const k = sadeMetin(kalite);

  const seviye = (() => {
    if (k.includes("servis") || k.includes("orijinal") || k.includes("orjinal")) {
      return {
        etiket: "Orijinal",
        sinif: "border-altin-400/30 bg-altin-400/10 text-altin-400",
        serit: "bg-altin-400",
      };
    }
    if (k.includes("1. kalite") || k.includes("1.kalite") || k.includes("hard") || k.includes("yuksek")) {
      return {
        etiket: "1. Kalite",
        sinif: "border-vurgu-400/30 bg-vurgu-400/10 text-vurgu-300",
        serit: "bg-vurgu-400",
      };
    }
    if (k.includes("2. kalite") || k.includes("2.kalite") || k.includes("soft") || k.includes("incell")) {
      return {
        etiket: "2. Kalite",
        sinif: "border-mor-400/30 bg-mor-400/10 text-mor-400",
        serit: "bg-mor-400",
      };
    }
    if (k.includes("ekonomik") || k.includes("tft") || k.includes("standart")) {
      return {
        etiket: "Ekonomik",
        sinif: "border-white/10 bg-white/5 text-slate-300",
        serit: "bg-slate-500",
      };
    }
    return null;
  })();

  if (!seviye) return null;
  // Kalite adi seviyeyi zaten iceriyorsa metni tekrarlamiyoruz
  if (k.includes(sadeMetin(seviye.etiket))) return { ...seviye, etiket: "" };
  return seviye;
}

function stokRengi(stok?: string): string {
  const s = sadeMetin(stok ?? "");
  if (!s) return "";
  if (s.startsWith("yok") || s.includes("tuken")) {
    return "bg-rose-500/15 text-rose-300 border-rose-400/25";
  }
  if (s.includes("sinirli") || s.includes("siparis")) {
    return "bg-altin-400/15 text-altin-400 border-altin-400/25";
  }
  return "bg-emerald-500/15 text-emerald-300 border-emerald-400/25";
}

export function FiyatTablosu({
  satirlar,
  ayarlar,
  baslik,
}: {
  satirlar: FiyatSatiri[];
  ayarlar: Ayarlar;
  baslik: { marka: string; kategori: string; model: string };
}) {
  const [siralama, setSiralama] = useState<Siralama>("fiyat-azalan");
  const [kdvEkle, setKdvEkle] = useState(false);
  const [kopyalandi, setKopyalandi] = useState<"liste" | "link" | null>(null);

  const kdvCarpani = kdvEkle && !ayarlar.kdvDahil ? 1 + ayarlar.kdvOrani / 100 : 1;

  const sirali = useMemo(() => {
    const kopya = [...satirlar];
    if (siralama === "ada-gore") {
      kopya.sort((a, b) => a.kalite.localeCompare(b.kalite, "tr"));
    } else {
      const yon = siralama === "fiyat-artan" ? 1 : -1;
      kopya.sort(
        (a, b) => yon * ((a.toptan ?? a.perakende ?? 0) - (b.toptan ?? b.perakende ?? 0)),
      );
    }
    return kopya;
  }, [satirlar, siralama]);

  const fiyatla = (deger: number | null) => (deger === null ? null : deger * kdvCarpani);

  /** Listeyi WhatsApp'a yapistirilabilir duz metne cevirir */
  const metinOlustur = () => {
    const satirMetni = sirali
      .map((s) => {
        const parcalar = [`- ${s.kalite}`];
        if (ayarlar.toptanGoster && s.toptan !== null) {
          parcalar.push(`Toptan: ${paraBicimle(fiyatla(s.toptan), s.paraBirimi)}`);
        }
        if (ayarlar.perakendeGoster && s.perakende !== null) {
          parcalar.push(`Perakende: ${paraBicimle(fiyatla(s.perakende), s.paraBirimi)}`);
        }
        if (s.stok) parcalar.push(`Stok: ${s.stok}`);
        return parcalar.join(" | ");
      })
      .join("\n");

    const kdvNotu =
      kdvEkle && !ayarlar.kdvDahil ? `Fiyatlara %${ayarlar.kdvOrani} KDV dahildir.` : "";

    return `${baslik.marka} ${baslik.model} - ${baslik.kategori}\n${satirMetni}\n\n${kdvNotu}`.trim();
  };

  const panoyaYaz = async (tur: "liste" | "link") => {
    const icerik = tur === "liste" ? metinOlustur() : window.location.href;
    try {
      await navigator.clipboard.writeText(icerik);
      setKopyalandi(tur);
      setTimeout(() => setKopyalandi(null), 2000);
    } catch {
      /* pano izni yok */
    }
  };

  const paylas = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${baslik.marka} ${baslik.model} ${baslik.kategori} fiyatları`,
          text: metinOlustur(),
          url: window.location.href,
        });
        return;
      } catch {
        /* kullanici vazgecti */
      }
    }
    void panoyaYaz("link");
  };

  const siralamaSecenekleri: { deger: Siralama; etiket: string }[] = [
    { deger: "fiyat-azalan", etiket: "En pahalı" },
    { deger: "fiyat-artan", etiket: "En ucuz" },
    { deger: "ada-gore", etiket: "A-Z" },
  ];

  return (
    <div>
      {/* ------------ Arac cubugu ------------ */}
      <div className="yazdirma-gizle mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          <ArrowDownUp className="ml-2 mr-0.5 size-3.5 text-slate-500" />
          {siralamaSecenekleri.map((secenek) => (
            <button
              key={secenek.deger}
              type="button"
              onClick={() => setSiralama(secenek.deger)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                siralama === secenek.deger
                  ? "bg-gradient-to-r from-vurgu-500 to-mor-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {secenek.etiket}
            </button>
          ))}
        </div>

        {!ayarlar.kdvDahil && (
          <button
            type="button"
            onClick={() => setKdvEkle((o) => !o)}
            aria-pressed={kdvEkle}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-medium transition ${
              kdvEkle
                ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
            }`}
          >
            <Percent className="size-3.5" />%{ayarlar.kdvOrani} KDV
            {kdvEkle ? " dahil" : " hariç"}
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => panoyaYaz("liste")}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-white/25 hover:text-white"
            title="Fiyat listesini metin olarak kopyala"
          >
            {kopyalandi === "liste" ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {kopyalandi === "liste" ? "Kopyalandı" : "Listeyi kopyala"}
          </button>

          <button
            type="button"
            onClick={paylas}
            className="flex size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/25 hover:text-white"
            title="Bağlantıyı paylaş"
            aria-label="Bağlantıyı paylaş"
          >
            {kopyalandi === "link" ? (
              <Check className="size-4 text-emerald-400" />
            ) : (
              <>
                <Share2 className="size-4 sm:hidden" />
                <Link2 className="hidden size-4 sm:block" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="hidden size-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/25 hover:text-white sm:flex"
            title="Yazdır"
            aria-label="Yazdır"
          >
            <Printer className="size-4" />
          </button>
        </div>
      </div>

      {/* ------------ Masaustu baslik satiri ------------ */}
      <div className="mb-2 hidden items-center gap-4 px-5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 md:flex">
        <span className="flex-1">Kalite / Çeşit</span>
        {ayarlar.toptanGoster && <span className="w-32 text-right">Toptan</span>}
        {ayarlar.perakendeGoster && <span className="w-32 text-right">Perakende</span>}
        <span className="w-24 text-right">Stok</span>
      </div>

      {/* ------------ Satirlar ------------ */}
      <ul className="space-y-2.5">
        {sirali.map((satir, indeks) => {
          const toptan = fiyatla(satir.toptan);
          const perakende = fiyatla(satir.perakende);
          const toptanTl = tlKarsiligi(toptan, satir.paraBirimi, ayarlar.usdKuru, ayarlar.eurKuru);
          const perakendeTl = tlKarsiligi(
            perakende,
            satir.paraBirimi,
            ayarlar.usdKuru,
            ayarlar.eurKuru,
          );
          const seviye = kaliteSeviyesi(satir.kalite);

          return (
            <li
              key={`${satir.stokKodu ?? ""}-${satir.kalite}-${indeks}`}
              className="animate-yukari"
              style={{ animationDelay: `${Math.min(indeks * 22, 300)}ms` }}
            >
              <div
                className={`cam relative overflow-hidden rounded-2xl px-4 py-3.5 transition hover:border-white/20 sm:px-5 ${
                  satir.enUcuzMu ? "border-emerald-400/25" : ""
                }`}
              >
                {/* Kalite seviyesini renkle belli eden sol serit */}
                {seviye && (
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-0 w-1 ${seviye.serit}`}
                  />
                )}

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                  {/* Kalite bilgisi */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[15px] font-bold leading-tight text-white">
                        {satir.kalite}
                      </span>
                      {seviye?.etiket && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${seviye.sinif}`}
                        >
                          {seviye.etiket}
                        </span>
                      )}
                      {satir.paraBirimi !== "TRY" && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          {satir.paraBirimi}
                        </span>
                      )}
                      {satir.enUcuzMu && sirali.length > 1 && (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                          <Star className="size-2.5" />
                          EN UYGUN
                        </span>
                      )}
                    </div>

                    {(satir.stokKodu || satir.not) && (
                      <p className="mt-1 truncate text-xs text-slate-500">
                        {satir.stokKodu && <span className="font-mono">{satir.stokKodu}</span>}
                        {satir.stokKodu && satir.not && " \u00B7 "}
                        {satir.not}
                      </p>
                    )}
                  </div>

                  {/* Fiyatlar */}
                  <div className="flex items-end gap-4 md:gap-4">
                    {ayarlar.toptanGoster && (
                      <div className="flex-1 md:w-32 md:flex-none md:text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:hidden">
                          Toptan
                        </p>
                        <p className="text-lg font-black leading-tight text-vurgu-300 md:text-[17px]">
                          {toptan === null ? "-" : paraBicimle(toptan, satir.paraBirimi)}
                        </p>
                        {toptanTl !== null && (
                          <p className="text-[11px] text-slate-500">
                            ~ {sayiBicimle(toptanTl, 0)} {PARA_SEMBOLU.TRY}
                          </p>
                        )}
                      </div>
                    )}

                    {ayarlar.perakendeGoster && (
                      <div className="flex-1 md:w-32 md:flex-none md:text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 md:hidden">
                          Perakende
                        </p>
                        <p className="text-lg font-black leading-tight text-emerald-300 md:text-[17px]">
                          {perakende === null ? "-" : paraBicimle(perakende, satir.paraBirimi)}
                        </p>
                        {perakendeTl !== null && (
                          <p className="text-[11px] text-slate-500">
                            ~ {sayiBicimle(perakendeTl, 0)} {PARA_SEMBOLU.TRY}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="md:w-24 md:text-right">
                      {satir.stok ? (
                        <span
                          className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-semibold ${stokRengi(
                            satir.stok,
                          )}`}
                        >
                          {satir.stok}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-600">-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* ------------ Bilgi notu ------------ */}
      <div className="cam mt-5 flex gap-3 rounded-2xl px-4 py-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-vurgu-400" />
        <p className="text-xs leading-relaxed text-slate-400">
          {ayarlar.kdvDahil
            ? `Fiyatlara %${ayarlar.kdvOrani} KDV dahildir.`
            : kdvEkle
              ? `Gösterilen fiyatlara %${ayarlar.kdvOrani} KDV eklenmiştir.`
              : `Fiyatlar KDV hariçtir. KDV dahil görmek için yukarıdaki %${ayarlar.kdvOrani} KDV düğmesine basın.`}{" "}
          {ayarlar.uyariMetni}
        </p>
      </div>
    </div>
  );
}
