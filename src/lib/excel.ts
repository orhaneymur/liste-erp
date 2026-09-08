import ExcelJS from "exceljs";
import { sadeMetin, temizle } from "./slug";
import type { ParaBirimi, Urun } from "./tipler";

/* ------------------------------------------------------------------ */
/* Kolon tanimlari                                                     */
/* ------------------------------------------------------------------ */

type Alan =
  | "marka"
  | "kategori"
  | "model"
  | "kalite"
  | "stokKodu"
  | "toptan"
  | "perakende"
  | "paraBirimi"
  | "stok"
  | "not";

/** Excel basliklari farkli yazilmis olsa da tanimak icin esanlamli liste */
const BASLIK_ESLESMELERI: { alan: Alan; anahtarlar: string[] }[] = [
  { alan: "marka", anahtarlar: ["marka", "brand", "markasi"] },
  {
    alan: "kategori",
    anahtarlar: ["kategori", "parca turu", "parca tipi", "urun grubu", "grup", "category", "parca"],
  },
  { alan: "model", anahtarlar: ["model", "telefon modeli", "cihaz", "cihaz modeli"] },
  {
    alan: "kalite",
    anahtarlar: [
      "kalite",
      "cesit",
      "kalite cesit",
      "kalite/cesit",
      "urun",
      "urun adi",
      "tip",
      "variant",
      "kalite aciklama",
    ],
  },
  { alan: "stokKodu", anahtarlar: ["stok kodu", "stokkodu", "kod", "barkod", "sku", "urun kodu"] },
  {
    alan: "toptan",
    anahtarlar: ["toptan", "toptan fiyat", "toptan fiyati", "toptan satis", "wholesale", "bayi fiyati", "bayi"],
  },
  {
    alan: "perakende",
    anahtarlar: [
      "perakende",
      "perakende fiyat",
      "perakende fiyati",
      "liste fiyati",
      "satis fiyati",
      "retail",
      "musteri fiyati",
    ],
  },
  { alan: "paraBirimi", anahtarlar: ["para birimi", "parabirimi", "doviz", "currency", "kur"] },
  { alan: "stok", anahtarlar: ["stok", "stok durumu", "durum", "adet", "mevcut"] },
  { alan: "not", anahtarlar: ["not", "notlar", "aciklama", "description", "ek bilgi"] },
];

const ZORUNLU_ALANLAR: Alan[] = ["marka", "kategori", "model", "kalite"];

export const KOLON_BASLIKLARI = [
  "Marka",
  "Kategori",
  "Model",
  "Kalite / Çeşit",
  "Stok Kodu",
  "Toptan Fiyat",
  "Perakende Fiyat",
  "Para Birimi",
  "Stok Durumu",
  "Not",
];

/* ------------------------------------------------------------------ */
/* Yardimcilar                                                         */
/* ------------------------------------------------------------------ */

/** Basligi karsilastirilabilir hale getirir: "Toptan Fiyatı" -> "toptan fiyati" */
function baslikNormalize(metin: string): string {
  return sadeMetin(temizle(metin))
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** ExcelJS hucre degerini duz metne cevirir (formul, rich text, tarih dahil) */
function hucreMetni(deger: unknown): string {
  if (deger === null || deger === undefined) return "";
  if (typeof deger === "string" || typeof deger === "number" || typeof deger === "boolean") {
    return String(deger);
  }
  if (deger instanceof Date) return deger.toISOString();
  if (typeof deger === "object") {
    const nesne = deger as Record<string, unknown>;
    if ("richText" in nesne && Array.isArray(nesne.richText)) {
      return nesne.richText.map((p: { text?: string }) => p.text ?? "").join("");
    }
    if ("text" in nesne) return hucreMetni(nesne.text);
    if ("result" in nesne) return hucreMetni(nesne.result);
    if ("hyperlink" in nesne) return hucreMetni(nesne.hyperlink);
  }
  return "";
}

/**
 * Fiyat hucresini sayiya cevirir.
 * "1.250,50 TL" | "1250,50" | "1,250.50" | 1250.5  ->  1250.5
 */
export function fiyatCoz(deger: unknown): number | null {
  if (typeof deger === "number") return Number.isFinite(deger) ? deger : null;

  let metin = hucreMetni(deger);
  metin = metin.replace(/[^\d.,-]/g, "").trim();
  if (!metin) return null;

  const noktaVar = metin.includes(".");
  const virgulVar = metin.includes(",");

  if (noktaVar && virgulVar) {
    // Son gorulen ayirici ondalik ayiricidir
    if (metin.lastIndexOf(",") > metin.lastIndexOf(".")) {
      metin = metin.replace(/\./g, "").replace(",", ".");
    } else {
      metin = metin.replace(/,/g, "");
    }
  } else if (virgulVar) {
    // Turkce yazim: virgul ondalik ayiricidir ("1.500" degil "1,50")
    metin = metin.replace(/,/g, ".");
  } else if (noktaVar) {
    // "1.500" -> binlik ayirici, "1.5" -> ondalik
    const parcalar = metin.split(".");
    const sonParca = parcalar[parcalar.length - 1];
    if (parcalar.length > 1 && sonParca.length === 3 && parcalar[0].length <= 3) {
      metin = parcalar.join("");
    }
  }

  const sayi = Number(metin);
  return Number.isFinite(sayi) ? sayi : null;
}

export function paraBirimiCoz(deger: unknown, varsayilan: ParaBirimi = "TRY"): ParaBirimi {
  const metin = hucreMetni(deger).toUpperCase();
  if (!metin) return varsayilan;
  if (metin.includes("USD") || metin.includes("$") || metin.includes("DOLAR")) return "USD";
  if (metin.includes("EUR") || metin.includes("\u20AC") || metin.includes("EURO")) return "EUR";
  return "TRY";
}

/* ------------------------------------------------------------------ */
/* Excel / CSV okuma                                                   */
/* ------------------------------------------------------------------ */

export interface OkumaSonucu {
  urunler: Urun[];
  toplamSatir: number;
  atlananSatir: number;
  hatalar: string[];
  uyarilar: string[];
  bulunanKolonlar: string[];
  eksikKolonlar: string[];
}

function satirlariUrunlereCevir(
  satirlar: unknown[][],
  sonuc: OkumaSonucu,
): void {
  if (!satirlar.length) {
    sonuc.hatalar.push("Dosyada hiç satır bulunamadı.");
    return;
  }

  // Baslik satirini bul (ilk 10 satirda "marka" iceren satir)
  let baslikIndeksi = -1;
  for (let i = 0; i < Math.min(10, satirlar.length); i++) {
    const normalize = satirlar[i].map((h) => baslikNormalize(hucreMetni(h)));
    if (normalize.some((h) => h === "marka" || h === "brand")) {
      baslikIndeksi = i;
      break;
    }
  }
  if (baslikIndeksi === -1) baslikIndeksi = 0;

  // Kolon eslestirme
  const basliklar = satirlar[baslikIndeksi].map((h) => baslikNormalize(hucreMetni(h)));
  const kolonlar: Partial<Record<Alan, number>> = {};

  basliklar.forEach((baslik, indeks) => {
    if (!baslik) return;
    for (const { alan, anahtarlar } of BASLIK_ESLESMELERI) {
      if (kolonlar[alan] !== undefined) continue;
      if (anahtarlar.includes(baslik) || anahtarlar.some((a) => baslik.startsWith(a + " "))) {
        kolonlar[alan] = indeks;
        return;
      }
    }
  });

  sonuc.bulunanKolonlar = Object.keys(kolonlar);
  sonuc.eksikKolonlar = ZORUNLU_ALANLAR.filter((a) => kolonlar[a] === undefined);

  if (sonuc.eksikKolonlar.length) {
    sonuc.hatalar.push(
      `Şu zorunlu kolonlar bulunamadı: ${sonuc.eksikKolonlar.join(", ")}. ` +
        `Şablonu indirip aynı başlık isimlerini kullanın.`,
    );
    return;
  }
  if (kolonlar.toptan === undefined && kolonlar.perakende === undefined) {
    sonuc.hatalar.push(
      "Dosyada ne 'Toptan Fiyat' ne de 'Perakende Fiyat' kolonu var. En az biri gerekli.",
    );
    return;
  }

  const al = (satir: unknown[], alan: Alan): unknown => {
    const indeks = kolonlar[alan];
    return indeks === undefined ? "" : satir[indeks];
  };

  let sira = 0;
  for (let i = baslikIndeksi + 1; i < satirlar.length; i++) {
    const satir = satirlar[i];
    if (!satir || satir.every((h) => temizle(hucreMetni(h)) === "")) continue;
    sonuc.toplamSatir++;

    const marka = temizle(hucreMetni(al(satir, "marka")));
    const kategori = temizle(hucreMetni(al(satir, "kategori")));
    const model = temizle(hucreMetni(al(satir, "model")));
    const kalite = temizle(hucreMetni(al(satir, "kalite"))) || "Standart";

    if (!marka || !kategori || !model) {
      sonuc.atlananSatir++;
      if (sonuc.uyarilar.length < 12) {
        sonuc.uyarilar.push(
          `Satır ${i + 1}: marka / kategori / model boş olduğu için atlandı.`,
        );
      }
      continue;
    }

    const toptan = fiyatCoz(al(satir, "toptan"));
    const perakende = fiyatCoz(al(satir, "perakende"));

    if (toptan === null && perakende === null) {
      sonuc.atlananSatir++;
      if (sonuc.uyarilar.length < 12) {
        sonuc.uyarilar.push(
          `Satır ${i + 1}: "${model} - ${kalite}" fiyatı boş olduğu için atlandı.`,
        );
      }
      continue;
    }

    sonuc.urunler.push({
      marka,
      kategori,
      model,
      kalite,
      stokKodu: temizle(hucreMetni(al(satir, "stokKodu"))) || undefined,
      toptan,
      perakende,
      paraBirimi: paraBirimiCoz(al(satir, "paraBirimi")),
      stok: temizle(hucreMetni(al(satir, "stok"))) || undefined,
      not: temizle(hucreMetni(al(satir, "not"))) || undefined,
      sira: sira++,
    });
  }

  if (!sonuc.urunler.length && !sonuc.hatalar.length) {
    sonuc.hatalar.push("Dosyada geçerli fiyat satırı bulunamadı.");
  }
}

/** Basit CSV ayristirici (tirnak icindeki ayiricilari korur) */
function csvAyristir(icerik: string): unknown[][] {
  const temizIcerik = icerik.replace(/^\uFEFF/, "");
  const ilkSatir = temizIcerik.split(/\r?\n/)[0] ?? "";
  const ayirici =
    (ilkSatir.match(/;/g)?.length ?? 0) > (ilkSatir.match(/,/g)?.length ?? 0) ? ";" : ",";

  const satirlar: unknown[][] = [];
  let hucre = "";
  let satir: string[] = [];
  let tirnakIcinde = false;

  for (let i = 0; i < temizIcerik.length; i++) {
    const karakter = temizIcerik[i];
    if (tirnakIcinde) {
      if (karakter === '"') {
        if (temizIcerik[i + 1] === '"') {
          hucre += '"';
          i++;
        } else {
          tirnakIcinde = false;
        }
      } else {
        hucre += karakter;
      }
      continue;
    }
    if (karakter === '"') {
      tirnakIcinde = true;
    } else if (karakter === ayirici) {
      satir.push(hucre);
      hucre = "";
    } else if (karakter === "\n") {
      satir.push(hucre);
      satirlar.push(satir);
      satir = [];
      hucre = "";
    } else if (karakter !== "\r") {
      hucre += karakter;
    }
  }
  if (hucre !== "" || satir.length) {
    satir.push(hucre);
    satirlar.push(satir);
  }
  return satirlar;
}

/** Yuklenen Excel (.xlsx) veya CSV dosyasini urun listesine cevirir */
export async function dosyayiOku(
  govde: ArrayBuffer,
  dosyaAdi: string,
): Promise<OkumaSonucu> {
  const sonuc: OkumaSonucu = {
    urunler: [],
    toplamSatir: 0,
    atlananSatir: 0,
    hatalar: [],
    uyarilar: [],
    bulunanKolonlar: [],
    eksikKolonlar: [],
  };

  const uzanti = dosyaAdi.split(".").pop()?.toLowerCase() ?? "";

  try {
    if (uzanti === "csv" || uzanti === "txt") {
      const metin = new TextDecoder("utf-8").decode(govde);
      satirlariUrunlereCevir(csvAyristir(metin), sonuc);
      return sonuc;
    }

    if (uzanti === "xls") {
      sonuc.hatalar.push(
        "Eski .xls biçimi desteklenmiyor. Excel'de \"Farklı Kaydet\" ile .xlsx seçip tekrar deneyin.",
      );
      return sonuc;
    }

    const kitap = new ExcelJS.Workbook();
    await kitap.xlsx.load(govde);

    // Icinde veri olan ilk sayfayi sec (talimat sayfalarini atla)
    const sayfalar = kitap.worksheets.filter((s) => s.rowCount > 1);
    const sayfa =
      sayfalar.find((s) => {
        const ilk = s.getRow(1).values;
        return Array.isArray(ilk) && ilk.some((h) => baslikNormalize(hucreMetni(h)) === "marka");
      }) ?? sayfalar[0];

    if (!sayfa) {
      sonuc.hatalar.push("Excel dosyasında veri içeren sayfa bulunamadı.");
      return sonuc;
    }

    const satirlar: unknown[][] = [];
    sayfa.eachRow({ includeEmpty: false }, (satir) => {
      const degerler = satir.values as unknown[];
      // ExcelJS 1'den baslar, ilk elemani at
      satirlar.push(Array.isArray(degerler) ? degerler.slice(1) : []);
    });

    satirlariUrunlereCevir(satirlar, sonuc);
    if (sayfalar.length > 1 && sayfa.name) {
      sonuc.uyarilar.push(`"${sayfa.name}" sayfası okundu.`);
    }
    return sonuc;
  } catch {
    // ExcelJS'in ham hata metni kullaniciya bir sey anlatmiyor, yerine yol gosteriyoruz
    sonuc.hatalar.push(
      "Dosya açılamadı. Excel dosyası bozuk olabilir veya gerçekte .xlsx değildir. " +
        'Excel\'de dosyayı açıp "Farklı Kaydet → Excel Çalışma Kitabı (.xlsx)" ile ' +
        "yeniden kaydedip tekrar deneyin.",
    );
    return sonuc;
  }
}

/* ------------------------------------------------------------------ */
/* Excel yazma - sablon ve disa aktarma                                */
/* ------------------------------------------------------------------ */

const KOLON_GENISLIKLERI = [16, 20, 24, 30, 18, 15, 17, 13, 14, 28];

function sayfayiBicimlendir(sayfa: ExcelJS.Worksheet) {
  sayfa.columns = KOLON_BASLIKLARI.map((baslik, i) => ({
    header: baslik,
    width: KOLON_GENISLIKLERI[i],
  }));

  const baslikSatiri = sayfa.getRow(1);
  baslikSatiri.height = 26;
  baslikSatiri.eachCell((hucre) => {
    hucre.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    hucre.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0F172A" } };
    hucre.alignment = { vertical: "middle", horizontal: "center" };
    hucre.border = {
      bottom: { style: "thin", color: { argb: "FF334155" } },
    };
  });
  baslikSatiri.commit();

  sayfa.views = [{ state: "frozen", ySplit: 1 }];
  sayfa.autoFilter = { from: "A1", to: "J1" };

  // Fiyat kolonlari sayi bicimi
  sayfa.getColumn(6).numFmt = "#,##0.00";
  sayfa.getColumn(7).numFmt = "#,##0.00";

  // Para birimi ve stok icin acilir liste (1000 satir)
  for (let satir = 2; satir <= 1000; satir++) {
    sayfa.getCell(`H${satir}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"TRY,USD,EUR"'],
    };
    sayfa.getCell(`I${satir}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"Var,Sınırlı,Yok,Siparişe Bağlı"'],
    };
  }
}

const ORNEK_SATIRLAR: (string | number)[][] = [
  ["Apple", "Ekran", "iPhone 11", "Servis Orijinal (Kutulu)", "APL-EKR-IP11-SRV", 3600, 4750, "TRY", "Var", "Kutulu"],
  ["Apple", "Ekran", "iPhone 11", "1. Kalite OLED (Hard)", "APL-EKR-IP11-OLH", 1945, 2570, "TRY", "Var", ""],
  ["Apple", "Ekran", "iPhone 11", "2. Kalite Incell GX", "APL-EKR-IP11-GX", 1150, 1520, "TRY", "Sınırlı", "4 adet kaldı"],
  ["Apple", "Batarya", "iPhone 11", "Servis Orijinal (Kutulu)", "APL-BAT-IP11-SRV", 685, 905, "TRY", "Var", ""],
  ["Apple", "Batarya", "iPhone 11", "1. Kalite Yüksek Kapasite", "APL-BAT-IP11-YKP", 425, 560, "TRY", "Var", ""],
  ["Samsung", "Ekran", "Galaxy A53", "Servis Orijinal (Kutulu)", "SAM-EKR-A53-SRV", 2850, 3765, "TRY", "Var", ""],
  ["Samsung", "Ekran", "Galaxy A53", "1. Kalite OLED (Hard)", "SAM-EKR-A53-OLH", 1540, 2035, "TRY", "Var", ""],
  ["Xiaomi", "Şarj Soketi", "Redmi Note 12", "Orijinal Sökme", "XIA-SRJ-RN12-ORJ", 140, 185, "TRY", "Var", ""],
];

/** Musterinin doldurup yukleyecegi bos sablon dosyasini uretir */
export async function sablonUret(): Promise<Buffer> {
  const kitap = new ExcelJS.Workbook();
  kitap.creator = "Fiyat Liste";
  kitap.created = new Date();

  const sayfa = kitap.addWorksheet("Fiyat Listesi", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sayfayiBicimlendir(sayfa);

  ORNEK_SATIRLAR.forEach((satir) => sayfa.addRow(satir));
  sayfa.getRows(2, ORNEK_SATIRLAR.length)?.forEach((satir) => {
    satir.eachCell((hucre) => {
      hucre.font = { color: { argb: "FF64748B" }, italic: true };
    });
  });

  /* --- Talimat sayfasi --- */
  const yardim = kitap.addWorksheet("NASIL DOLDURULUR");
  yardim.columns = [{ width: 22 }, { width: 90 }];

  const satirEkle = (baslik: string, aciklama: string, kalin = false) => {
    const satir = yardim.addRow([baslik, aciklama]);
    satir.getCell(1).font = { bold: true, color: { argb: "FF0F172A" } };
    satir.getCell(2).alignment = { wrapText: true, vertical: "top" };
    if (kalin) {
      satir.getCell(1).font = { bold: true, size: 13, color: { argb: "FF2563EB" } };
    }
    satir.commit();
  };

  satirEkle(
    "FİYAT LİSTESİ",
    "Bu dosyayı doldurup yönetim panelinden yükleyin. Yükleme biter bitmez site güncellenir.",
    true,
  );
  yardim.addRow([]);
  satirEkle("Marka", "Zorunlu. Örn: Apple, Samsung, Xiaomi. Aynı marka her satırda aynı yazılmalı.");
  satirEkle("Kategori", "Zorunlu. Parça türü. Örn: Ekran, Batarya, Şarj Soketi, Arka Kapak, Kamera.");
  satirEkle("Model", "Zorunlu. Örn: iPhone 11, Galaxy A53, Redmi Note 12.");
  satirEkle(
    "Kalite / Çeşit",
    "Zorunlu. Müşteriye gösterilecek çeşit adı. Örn: Servis Orijinal, 1. Kalite OLED, 2. Kalite TFT.",
  );
  satirEkle("Stok Kodu", "İsteğe bağlı. Kendi ürün kodunuz veya barkodunuz.");
  satirEkle(
    "Toptan Fiyat",
    "Sayı olarak yazın (örn: 1250 veya 1250,50). Para birimi sembolü yazmanıza gerek yok.",
  );
  satirEkle("Perakende Fiyat", "Sayı olarak yazın. Toptan veya perakendeden en az biri dolu olmalı.");
  satirEkle("Para Birimi", "TRY / USD / EUR. Boş bırakılırsa TRY kabul edilir.");
  satirEkle("Stok Durumu", "Var / Sınırlı / Yok / Siparişe Bağlı. Boş bırakılabilir.");
  satirEkle("Not", "Müşteriye gösterilecek kısa açıklama. İsteğe bağlı.");
  yardim.addRow([]);
  satirEkle("ÖNEMLİ", "Başlık satırını (1. satır) silmeyin ve isimlerini değiştirmeyin.");
  satirEkle("ÖNEMLİ", "Gri renkli örnek satırları silip kendi verinizi yazın.");
  satirEkle(
    "ÖNEMLİ",
    "Her yükleme önceki listenin TAMAMINI değiştirir. Bu yüzden eksik marka bırakmayın; en doğrusu panelden \"Mevcut listeyi indir\" ile çalışmaktır.",
  );

  const govde = await kitap.xlsx.writeBuffer();
  return Buffer.from(govde);
}

/** Sitede yayindaki listeyi Excel olarak disa aktarir */
export async function disaAktar(urunler: Urun[]): Promise<Buffer> {
  const kitap = new ExcelJS.Workbook();
  kitap.creator = "Fiyat Liste";
  kitap.created = new Date();

  const sayfa = kitap.addWorksheet("Fiyat Listesi", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sayfayiBicimlendir(sayfa);

  for (const u of urunler) {
    sayfa.addRow([
      u.marka,
      u.kategori,
      u.model,
      u.kalite,
      u.stokKodu ?? "",
      u.toptan ?? "",
      u.perakende ?? "",
      u.paraBirimi,
      u.stok ?? "",
      u.not ?? "",
    ]);
  }

  const govde = await kitap.xlsx.writeBuffer();
  return Buffer.from(govde);
}
