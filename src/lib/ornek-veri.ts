import type { Urun } from "./tipler";

/**
 * Ilk acilista gosterilecek ORNEK fiyat listesi.
 *
 * Yonetim panelinden kendi Excel'i yukledigin anda bu veriler tamamen silinir
 * ve yerine gercek liste gecer. Buradaki fiyatlar sadece "site nasil
 * gorunuyor" demek icin vardir.
 */

/** marka -> [model adi, ekran servis orijinal taban fiyati (TL)] */
const MODELLER: Record<string, [string, number][]> = {
  Apple: [
    ["iPhone XR", 3200],
    ["iPhone 11", 3600],
    ["iPhone 11 Pro", 5200],
    ["iPhone 11 Pro Max", 6100],
    ["iPhone 12", 5400],
    ["iPhone 12 Mini", 5100],
    ["iPhone 12 Pro", 6300],
    ["iPhone 12 Pro Max", 7400],
    ["iPhone 13", 6800],
    ["iPhone 13 Mini", 6400],
    ["iPhone 13 Pro", 8600],
    ["iPhone 13 Pro Max", 9700],
    ["iPhone 14", 7300],
    ["iPhone 14 Plus", 8100],
    ["iPhone 14 Pro", 11200],
    ["iPhone 14 Pro Max", 12800],
    ["iPhone 15", 9600],
    ["iPhone 15 Pro", 13400],
    ["iPhone 15 Pro Max", 15200],
    ["iPhone SE 2020", 2400],
  ],
  Samsung: [
    ["Galaxy A03", 1250],
    ["Galaxy A13", 1650],
    ["Galaxy A23", 1980],
    ["Galaxy A33", 2450],
    ["Galaxy A53", 2850],
    ["Galaxy A15", 1780],
    ["Galaxy A25", 2280],
    ["Galaxy A35", 2760],
    ["Galaxy A55", 3350],
    ["Galaxy S21", 4600],
    ["Galaxy S22", 5300],
    ["Galaxy S23", 6100],
    ["Galaxy S23 Ultra", 8200],
    ["Galaxy S24", 6900],
    ["Galaxy S24 Ultra", 9400],
    ["Galaxy Note 20", 5800],
  ],
  Xiaomi: [
    ["Redmi 10", 1050],
    ["Redmi 12", 1180],
    ["Redmi 13C", 1120],
    ["Redmi Note 10", 1450],
    ["Redmi Note 11", 1560],
    ["Redmi Note 12", 1720],
    ["Redmi Note 13", 1890],
    ["Redmi Note 13 Pro", 2240],
    ["Xiaomi 13", 4100],
    ["Xiaomi 14", 5200],
    ["Mi 11 Lite", 2300],
  ],
  Huawei: [
    ["P30 Lite", 1150],
    ["P40 Lite", 1290],
    ["Y7 Prime", 780],
    ["Y9 Prime", 880],
    ["Nova 9", 2150],
    ["Nova 11", 2650],
    ["Mate 20 Lite", 1080],
  ],
  Honor: [
    ["Honor X6", 890],
    ["Honor X7", 1020],
    ["Honor X8", 1240],
    ["Honor X9", 1580],
    ["Honor 50 Lite", 1460],
    ["Honor Magic 5 Lite", 1980],
  ],
  Oppo: [
    ["Oppo A16", 860],
    ["Oppo A54", 980],
    ["Oppo A57", 1080],
    ["Oppo A78", 1320],
    ["Oppo Reno 8", 2450],
    ["Oppo Reno 11", 2980],
  ],
  Realme: [
    ["Realme C21", 780],
    ["Realme C35", 890],
    ["Realme 9", 1580],
    ["Realme 10", 1720],
    ["Realme 11", 1940],
  ],
  Vivo: [
    ["Vivo Y17", 820],
    ["Vivo Y21", 890],
    ["Vivo Y33", 1020],
    ["Vivo Y35", 1180],
    ["Vivo V25", 2180],
  ],
  Tecno: [
    ["Tecno Spark 10", 720],
    ["Tecno Spark 20", 810],
    ["Tecno Camon 20", 1120],
  ],
  Infinix: [
    ["Infinix Hot 20", 690],
    ["Infinix Hot 30", 760],
    ["Infinix Note 30", 1080],
  ],
  "General Mobile": [
    ["GM 21", 890],
    ["GM 22", 960],
    ["GM 23", 1080],
    ["GM 24", 1180],
  ],
  Reeder: [
    ["Reeder P13 Blue Max", 780],
    ["Reeder S19 Max", 920],
  ],
  Casper: [
    ["Casper Via A3 Plus", 760],
    ["Casper Via X30", 980],
  ],
};

/** Kategoriler: taban fiyata gore carpan + o kategorinin kalite secenekleri */
const KATEGORILER: {
  ad: string;
  oran: number;
  kod: string;
  kaliteler: [string, number, string][]; // [kalite adi, carpan, kisa kod]
}[] = [
  {
    ad: "Ekran",
    oran: 1,
    kod: "EKR",
    kaliteler: [
      ["Servis Orijinal (Kutulu)", 1, "SRV"],
      ["Çıkma Orijinal (Sökme)", 0.78, "ORJ"],
      ["1. Kalite OLED (Hard)", 0.54, "OLH"],
      ["2. Kalite OLED (Soft)", 0.44, "OLS"],
      ["2. Kalite Incell GX", 0.32, "GX"],
      ["Ekonomik TFT", 0.24, "TFT"],
    ],
  },
  {
    ad: "Batarya",
    oran: 0.19,
    kod: "BAT",
    kaliteler: [
      ["Servis Orijinal (Kutulu)", 1, "SRV"],
      ["Çıkma Orijinal", 0.74, "ORJ"],
      ["1. Kalite Yüksek Kapasite", 0.62, "YKP"],
      ["2. Kalite", 0.46, "AKL"],
      ["Ekonomik", 0.34, "EKO"],
    ],
  },
  {
    ad: "Şarj Soketi",
    oran: 0.08,
    kod: "SRJ",
    kaliteler: [
      ["Orijinal Sökme", 1, "ORJ"],
      ["1. Kalite", 0.62, "K1"],
      ["2. Kalite", 0.44, "K2"],
    ],
  },
  {
    ad: "Arka Kapak",
    oran: 0.14,
    kod: "KPK",
    kaliteler: [
      ["Orijinal Kalite", 1, "ORJ"],
      ["1. Kalite", 0.66, "K1"],
      ["2. Kalite", 0.46, "K2"],
    ],
  },
  {
    ad: "Kamera",
    oran: 0.16,
    kod: "KAM",
    kaliteler: [
      ["Orijinal Sökme (Arka)", 1, "ORJ"],
      ["1. Kalite (Arka)", 0.58, "K1"],
      ["Orijinal Sökme (Ön)", 0.42, "ORJ-ON"],
    ],
  },
  {
    ad: "Hoparlör / Buzzer",
    oran: 0.07,
    kod: "HOP",
    kaliteler: [
      ["Orijinal Sökme", 1, "ORJ"],
      ["1. Kalite", 0.56, "K1"],
    ],
  },
  {
    ad: "Ön Cam (Glass)",
    oran: 0.06,
    kod: "CAM",
    kaliteler: [
      ["OCA Kaplamalı", 1, "OCA"],
      ["Standart", 0.68, "STD"],
    ],
  },
  {
    ad: "Kasa",
    oran: 0.13,
    kod: "KSA",
    kaliteler: [
      ["Orijinal Kalite", 1, "ORJ"],
      ["1. Kalite", 0.6, "K1"],
    ],
  },
  {
    ad: "Titreşim Motoru",
    oran: 0.05,
    kod: "TTR",
    kaliteler: [
      ["Orijinal Sökme", 1, "ORJ"],
      ["1. Kalite", 0.6, "K1"],
    ],
  },
];

const STOK_DURUMLARI = ["Var", "Var", "Var", "Var", "Sınırlı", "Var", "Var", "Yok"];

function besliYuvarla(sayi: number): number {
  return Math.max(5, Math.round(sayi / 5) * 5);
}

function markaKodu(marka: string): string {
  return marka
    .replace(/[^A-Za-z ]/g, "")
    .split(" ")
    .map((k) => k.slice(0, 3).toUpperCase())
    .join("")
    .slice(0, 4);
}

function modelKodu(model: string): string {
  return model
    .replace(/[^A-Za-z0-9 ]/g, "")
    .split(" ")
    .map((k) => (/^\d/.test(k) ? k : k.slice(0, 2)))
    .join("")
    .toUpperCase()
    .slice(0, 8);
}

/** Ornek urun listesini uretir */
export function ornekUrunler(): Urun[] {
  const urunler: Urun[] = [];
  let sira = 0;

  for (const [marka, modeller] of Object.entries(MODELLER)) {
    for (const [model, taban] of modeller) {
      for (const kategori of KATEGORILER) {
        const kategoriTaban = taban * kategori.oran;
        for (const [kalite, carpan, kaliteKodu] of kategori.kaliteler) {
          const toptan = besliYuvarla(kategoriTaban * carpan);
          const perakende = besliYuvarla(toptan * 1.32);
          urunler.push({
            marka,
            kategori: kategori.ad,
            model,
            kalite,
            stokKodu: `${markaKodu(marka)}-${kategori.kod}-${modelKodu(model)}-${kaliteKodu}`,
            toptan,
            perakende,
            paraBirimi: "TRY",
            stok: STOK_DURUMLARI[sira % STOK_DURUMLARI.length],
            not: "",
            sira: sira++,
          });
        }
      }
    }
  }

  return urunler;
}
