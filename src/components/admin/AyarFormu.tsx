"use client";

import { useEffect, useState } from "react";
import { Check, LoaderCircle, Save, SlidersHorizontal, TriangleAlert } from "lucide-react";
import { bekleyenBildirim, yenileVeBildir } from "@/lib/tarayici";
import type { Ayarlar } from "@/lib/tipler";

const KAYIT_ANAHTARI = "fl_ayar_kaydedildi";

const girdiSinifi =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-vurgu-400/60 focus:bg-white/[0.08] focus:outline-none";

function Alan({
  etiket,
  ipucu,
  children,
}: {
  etiket: string;
  ipucu?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">
        {etiket}
      </span>
      {children}
      {ipucu && <span className="mt-1 block text-[11px] text-slate-500">{ipucu}</span>}
    </label>
  );
}

function Anahtar({
  etiket,
  aciklama,
  degeri,
  degistir,
}: {
  etiket: string;
  aciklama: string;
  degeri: boolean;
  degistir: (yeni: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => degistir(!degeri)}
      aria-pressed={degeri}
      className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
        degeri
          ? "border-vurgu-400/40 bg-vurgu-500/10"
          : "border-white/10 bg-white/[0.03] hover:border-white/20"
      }`}
    >
      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
          degeri ? "border-vurgu-400 bg-vurgu-500 text-white" : "border-white/20 bg-transparent"
        }`}
      >
        {degeri && <Check className="size-3.5" strokeWidth={3} />}
      </span>
      <span>
        <span className="block text-sm font-semibold text-white">{etiket}</span>
        <span className="mt-0.5 block text-xs text-slate-400">{aciklama}</span>
      </span>
    </button>
  );
}

export function AyarFormu({ ayarlar }: { ayarlar: Ayarlar }) {
  const [form, setForm] = useState<Ayarlar>(ayarlar);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [durum, setDurum] = useState<"bos" | "tamam" | "hata">("bos");
  const [hataMetni, setHataMetni] = useState("");

  // Kaydettikten sonra sayfa yenilendiginde onay mesajini geri getir
  useEffect(() => {
    if (bekleyenBildirim<boolean>(KAYIT_ANAHTARI)) {
      setDurum("tamam");
      const zamanlayici = setTimeout(() => setDurum("bos"), 2500);
      return () => clearTimeout(zamanlayici);
    }
  }, []);

  const guncelle = <A extends keyof Ayarlar>(alan: A, deger: Ayarlar[A]) => {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
    setDurum("bos");
  };

  const kaydet = async (olay: React.FormEvent) => {
    olay.preventDefault();
    setKaydediliyor(true);
    setDurum("bos");
    try {
      const cevap = await fetch("/api/ayarlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (cevap.ok) {
        // Firma adi ust bar ve sayfa basliginda da gecerli olsun diye tazeliyoruz
        yenileVeBildir(KAYIT_ANAHTARI, true);
        return;
      }
      const veri = (await cevap.json()) as { hata?: string };
      setHataMetni(veri.hata ?? "Kaydedilemedi.");
      setDurum("hata");
      setKaydediliyor(false);
    } catch {
      setHataMetni("Sunucuya ulaşılamadı.");
      setDurum("hata");
      setKaydediliyor(false);
    }
  };

  return (
    <form onSubmit={kaydet} className="cam rounded-[1.5rem] p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-lg font-bold text-white">
        <SlidersHorizontal className="size-5 text-vurgu-400" />
        Site ayarları
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        Müşterinin gördüğü firma bilgileri ve fiyat gösterim kuralları.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Alan etiket="Firma adı">
          <input
            className={girdiSinifi}
            value={form.firmaAdi}
            onChange={(o) => guncelle("firmaAdi", o.target.value)}
            placeholder="Örnek Telefon Parça"
          />
        </Alan>

        <Alan etiket="Slogan / kısa açıklama">
          <input
            className={girdiSinifi}
            value={form.sloganMetni}
            onChange={(o) => guncelle("sloganMetni", o.target.value)}
            placeholder="Güncel toptan ve perakende parça fiyatları"
          />
        </Alan>

        <Alan etiket="Telefon">
          <input
            className={girdiSinifi}
            value={form.telefon}
            onChange={(o) => guncelle("telefon", o.target.value)}
            placeholder="0212 000 00 00"
            inputMode="tel"
          />
        </Alan>

        <Alan etiket="WhatsApp numarası" ipucu="Alt bilgide WhatsApp bağlantısı oluşturur.">
          <input
            className={girdiSinifi}
            value={form.whatsapp}
            onChange={(o) => guncelle("whatsapp", o.target.value)}
            placeholder="0555 000 00 00"
            inputMode="tel"
          />
        </Alan>

        <Alan etiket="E-posta">
          <input
            className={girdiSinifi}
            value={form.eposta}
            onChange={(o) => guncelle("eposta", o.target.value)}
            placeholder="bilgi@firma.com"
            inputMode="email"
          />
        </Alan>

        <Alan etiket="Adres">
          <input
            className={girdiSinifi}
            value={form.adres}
            onChange={(o) => guncelle("adres", o.target.value)}
            placeholder="İlçe / İl"
          />
        </Alan>
      </div>

      <div className="mt-4">
        <Alan etiket="Müşteriye gösterilecek uyarı metni">
          <textarea
            className={`${girdiSinifi} min-h-20 resize-y`}
            value={form.uyariMetni}
            onChange={(o) => guncelle("uyariMetni", o.target.value)}
          />
        </Alan>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Anahtar
          etiket="Toptan fiyatı göster"
          aciklama="Kapatırsan müşteri sadece perakende görür."
          degeri={form.toptanGoster}
          degistir={(d) => guncelle("toptanGoster", d)}
        />
        <Anahtar
          etiket="Perakende fiyatı göster"
          aciklama="Kapatırsan müşteri sadece toptan görür."
          degeri={form.perakendeGoster}
          degistir={(d) => guncelle("perakendeGoster", d)}
        />
        <Anahtar
          etiket="Fiyatlara KDV dahil"
          aciklama="Excel'deki fiyatlar KDV dahilse işaretle."
          degeri={form.kdvDahil}
          degistir={(d) => guncelle("kdvDahil", d)}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Alan etiket="KDV oranı (%)">
          <input
            type="number"
            min={0}
            max={100}
            className={girdiSinifi}
            value={form.kdvOrani}
            onChange={(o) => guncelle("kdvOrani", Number(o.target.value))}
          />
        </Alan>
        <Alan etiket="Dolar kuru" ipucu="0 ise TL karşılığı gösterilmez.">
          <input
            type="number"
            min={0}
            step="0.01"
            className={girdiSinifi}
            value={form.usdKuru}
            onChange={(o) => guncelle("usdKuru", Number(o.target.value))}
          />
        </Alan>
        <Alan etiket="Euro kuru" ipucu="Sadece EUR fiyatlı ürünler için.">
          <input
            type="number"
            min={0}
            step="0.01"
            className={girdiSinifi}
            value={form.eurKuru}
            onChange={(o) => guncelle("eurKuru", Number(o.target.value))}
          />
        </Alan>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={kaydediliyor}
          className="flex items-center gap-2 rounded-full bg-gradient-to-r from-vurgu-500 to-mor-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-vurgu-600/25 transition hover:brightness-110 disabled:opacity-50"
        >
          {kaydediliyor ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Ayarları kaydet
        </button>

        {durum === "tamam" && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-400">
            <Check className="size-4" />
            Kaydedildi
          </span>
        )}
        {durum === "hata" && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-rose-400">
            <TriangleAlert className="size-4" />
            {hataMetni}
          </span>
        )}
      </div>
    </form>
  );
}
