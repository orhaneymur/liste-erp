"use client";

import { useEffect, useRef, useState } from "react";
import {
  CircleCheck,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import { bekleyenBildirim, yenileVeBildir } from "@/lib/tarayici";

const RAPOR_ANAHTARI = "fl_yukleme_raporu";
const KABUL_EDILEN = ".xlsx,.csv";

interface Sonuc {
  eklenen: number;
  okunanSatir: number;
  atlanan: number;
  uyarilar: string[];
  istatistik: {
    markaSayisi: number;
    modelSayisi: number;
    kategoriSayisi: number;
    urunSayisi: number;
  };
}

export function YuklemeFormu() {
  const girdiRef = useRef<HTMLInputElement>(null);
  const [dosya, setDosya] = useState<File | null>(null);
  const [uzerinde, setUzerinde] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState("");
  const [sonuc, setSonuc] = useState<Sonuc | null>(null);

  // Yukleme sonrasi sayfa yenilendiginde raporu geri getir
  useEffect(() => {
    const rapor = bekleyenBildirim<Sonuc>(RAPOR_ANAHTARI);
    if (rapor) setSonuc(rapor);
  }, []);

  const dosyaSec = (secilen: File | null | undefined) => {
    setHata("");
    setSonuc(null);
    if (!secilen) return;

    const uzanti = secilen.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "csv"].includes(uzanti ?? "")) {
      setHata(
        uzanti === "xls"
          ? 'Eski .xls biçimi desteklenmiyor. Excel\'de "Farklı Kaydet" > .xlsx seçip tekrar deneyin.'
          : "Sadece .xlsx veya .csv dosyası yükleyebilirsiniz.",
      );
      return;
    }
    setDosya(secilen);
  };

  const yukle = async () => {
    if (!dosya) return;
    setYukleniyor(true);
    setHata("");
    setSonuc(null);

    try {
      const form = new FormData();
      form.append("dosya", dosya);
      const cevap = await fetch("/api/yukle", { method: "POST", body: form });
      const veri = (await cevap.json()) as Sonuc & { hata?: string };

      if (!cevap.ok) {
        setHata(veri.hata ?? "Yükleme başarısız oldu.");
        setYukleniyor(false);
        return;
      }

      // Ozet kartlarinin kesin guncellenmesi icin sayfayi tazele, raporu tasi
      yenileVeBildir(RAPOR_ANAHTARI, veri);
    } catch {
      setHata("Sunucuya ulaşılamadı. Sunucunun çalıştığını kontrol edin.");
      setYukleniyor(false);
    }
  };

  return (
    <section className="cam rounded-[1.5rem] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <FileSpreadsheet className="size-5 text-emerald-400" />
            Excel ile fiyat güncelle
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Dosyayı yüklediğin an site güncellenir. Müşteriye gönderdiğin link aynı kalır.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="/api/sablon"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-vurgu-400/50 hover:text-white"
          >
            <Download className="size-3.5" />
            Boş şablon indir
          </a>
          <a
            href="/api/aktar"
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-slate-200 transition hover:border-vurgu-400/50 hover:text-white"
          >
            <Download className="size-3.5" />
            Mevcut listeyi indir
          </a>
        </div>
      </div>

      {/* Surukle-birak alani */}
      <div
        onDragOver={(o) => {
          o.preventDefault();
          setUzerinde(true);
        }}
        onDragLeave={() => setUzerinde(false)}
        onDrop={(o) => {
          o.preventDefault();
          setUzerinde(false);
          dosyaSec(o.dataTransfer.files?.[0]);
        }}
        className={`mt-5 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
          uzerinde
            ? "border-vurgu-400 bg-vurgu-500/10"
            : "border-white/15 bg-black/20 hover:border-white/25"
        }`}
      >
        <input
          ref={girdiRef}
          type="file"
          accept={KABUL_EDILEN}
          onChange={(o) => dosyaSec(o.target.files?.[0])}
          className="hidden"
          id="excel-dosyasi"
        />

        {dosya ? (
          <div className="flex flex-col items-center gap-3">
            <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white">
              <FileSpreadsheet className="size-4 text-emerald-400" />
              <span className="max-w-[16rem] truncate font-medium">{dosya.name}</span>
              <span className="text-xs text-slate-500">{(dosya.size / 1024).toFixed(0)} KB</span>
              <button
                type="button"
                onClick={() => {
                  setDosya(null);
                  if (girdiRef.current) girdiRef.current.value = "";
                }}
                className="ml-1 rounded p-0.5 text-slate-500 transition hover:text-rose-400"
                aria-label="Dosyayı kaldır"
              >
                <X className="size-4" />
              </button>
            </span>

            <button
              type="button"
              onClick={yukle}
              disabled={yukleniyor}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {yukleniyor ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <Upload className="size-4" />
              )}
              {yukleniyor ? "Yükleniyor..." : "Yükle ve yayına al"}
            </button>
          </div>
        ) : (
          <>
            <Upload className="mx-auto size-8 text-slate-500" />
            <p className="mt-3 text-sm text-slate-300">
              Excel dosyasını buraya sürükleyin
              <span className="mx-1.5 text-slate-600">veya</span>
              <label
                htmlFor="excel-dosyasi"
                className="cursor-pointer font-semibold text-vurgu-300 underline-offset-4 hover:underline"
              >
                bilgisayardan seçin
              </label>
            </p>
            <p className="mt-1.5 text-xs text-slate-500">.xlsx veya .csv &middot; en fazla 25 MB</p>
          </>
        )}
      </div>

      {hata && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-500/10 px-3.5 py-3 text-sm text-rose-300">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          {hata}
        </p>
      )}

      {sonuc && (
        <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3.5">
          <p className="flex items-center gap-2 text-sm font-bold text-emerald-300">
            <CircleCheck className="size-4" />
            Liste güncellendi
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-1.5 text-xs text-emerald-200/90 sm:grid-cols-4">
            <li>
              <strong className="text-white">{sonuc.eklenen}</strong> ürün yayında
            </li>
            <li>
              <strong className="text-white">{sonuc.istatistik.markaSayisi}</strong> marka
            </li>
            <li>
              <strong className="text-white">{sonuc.istatistik.modelSayisi}</strong> model
            </li>
            <li>
              <strong className="text-white">{sonuc.istatistik.kategoriSayisi}</strong> kategori
            </li>
          </ul>

          {sonuc.atlanan > 0 && (
            <p className="mt-2.5 text-xs text-altin-400">
              {sonuc.atlanan} satır eksik bilgi nedeniyle atlandı.
            </p>
          )}
          {sonuc.uyarilar?.length > 0 && (
            <ul className="mt-1.5 space-y-0.5 text-[11px] text-slate-400">
              {sonuc.uyarilar.slice(0, 6).map((uyari, i) => (
                <li key={i}>&middot; {uyari}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-4 flex gap-2.5 rounded-xl border border-white/[0.07] bg-black/20 px-3.5 py-3">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-altin-400" />
        <p className="text-xs leading-relaxed text-slate-400">
          Her yükleme önceki listenin{" "}
          <strong className="text-slate-200">tamamını değiştirir</strong>. Yani yüklediğin dosyada
          olmayan ürünler siteden kalkar. Önceki liste otomatik olarak{" "}
          <code className="rounded bg-white/5 px-1">veri/yedekler</code> klasörüne yedeklenir.
        </p>
      </div>
    </section>
  );
}
