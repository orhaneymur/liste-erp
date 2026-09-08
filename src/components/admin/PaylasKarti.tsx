"use client";

import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Link2, MessageCircle } from "lucide-react";

/** Musteriye gonderilecek linki gosterir ve kopyalatir */
export function PaylasKarti() {
  const [adres, setAdres] = useState("");
  const [kopyalandi, setKopyalandi] = useState(false);

  useEffect(() => {
    setAdres(window.location.origin);
  }, []);

  const kopyala = async () => {
    try {
      await navigator.clipboard.writeText(adres);
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2000);
    } catch {
      /* pano izni yok */
    }
  };

  const whatsappMetni = encodeURIComponent(
    `Merhaba, güncel yedek parça fiyat listemiz: ${adres}`,
  );

  return (
    <section className="cam rounded-[1.5rem] p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white">
        <Link2 className="size-5 text-mor-400" />
        Müşteriye gönderilecek link
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Bu linki paylaş; müşteri marka, kategori ve model seçerek fiyatları görür.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={adres}
          onFocus={(o) => o.currentTarget.select()}
          aria-label="Site adresi"
          className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 font-mono text-sm text-vurgu-200 focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={kopyala}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-vurgu-400/50 sm:flex-none"
          >
            {kopyalandi ? (
              <Check className="size-4 text-emerald-400" />
            ) : (
              <Copy className="size-4" />
            )}
            {kopyalandi ? "Kopyalandı" : "Kopyala"}
          </button>
          <a
            href={`https://wa.me/?text=${whatsappMetni}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-500/15 px-4 py-2.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/25"
          >
            <MessageCircle className="size-4" />
            WhatsApp
          </a>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-slate-300 transition hover:text-white"
            title="Siteyi yeni sekmede aç"
            aria-label="Siteyi yeni sekmede aç"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Yukarıdaki adres, site senin bilgisayarında çalışırken yereldir. Müşterilerin
        erişebilmesi için siteyi bir sunucuya yayınlaman gerekir (README dosyasındaki
        &quot;Müşteriye link gönderme&quot; bölümü).
      </p>
    </section>
  );
}
