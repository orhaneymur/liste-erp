import {
  BatteryCharging,
  Camera,
  Cpu,
  Fingerprint,
  Layers,
  Mic,
  Package,
  ShieldCheck,
  Smartphone,
  Speaker,
  Usb,
  Vibrate,
  Volume2,
  Wrench,
} from "lucide-react";
import { sadeMetin } from "@/lib/slug";

/**
 * Kategori adindaki anahtar kelimeye gore ikon ve renk secer.
 *
 * Renkler bilerek korundu — parca turunu bir bakista ayirt ettiriyor.
 * Doygunluk bir tik dusuruldu ki koyu zeminde bagirmasin.
 */
const ESLESMELER: { anahtarlar: string[]; ikon: typeof Smartphone; renk: string }[] = [
  {
    anahtarlar: ["ekran", "lcd", "oled", "display"],
    ikon: Smartphone,
    renk: "from-blue-500 to-blue-700",
  },
  {
    anahtarlar: ["dokunmatik", "cam", "touch", "glass"],
    ikon: Layers,
    renk: "from-cyan-500 to-cyan-700",
  },
  {
    anahtarlar: ["batarya", "pil", "battery"],
    ikon: BatteryCharging,
    renk: "from-emerald-500 to-emerald-700",
  },
  {
    anahtarlar: ["sarj", "soket", "usb", "flex", "bord", "charging"],
    ikon: Usb,
    renk: "from-amber-500 to-amber-700",
  },
  { anahtarlar: ["kamera", "lens", "camera"], ikon: Camera, renk: "from-violet-500 to-violet-700" },
  {
    anahtarlar: ["hoparlor", "buzzer", "zil", "speaker"],
    ikon: Volume2,
    renk: "from-pink-500 to-pink-700",
  },
  { anahtarlar: ["mikrofon", "mic"], ikon: Mic, renk: "from-fuchsia-500 to-fuchsia-700" },
  { anahtarlar: ["kulaklik", "ear"], ikon: Speaker, renk: "from-teal-500 to-teal-700" },
  {
    anahtarlar: ["kasa", "kapak", "cita", "cover", "frame"],
    ikon: Layers,
    renk: "from-indigo-500 to-indigo-700",
  },
  { anahtarlar: ["titresim", "vibra"], ikon: Vibrate, renk: "from-rose-500 to-rose-700" },
  {
    anahtarlar: ["parmak", "finger", "yuz", "face"],
    ikon: Fingerprint,
    renk: "from-sky-500 to-sky-700",
  },
  {
    anahtarlar: ["anakart", "entegre", "cip", "elektronik", "board"],
    ikon: Cpu,
    renk: "from-slate-500 to-slate-700",
  },
  {
    anahtarlar: ["tamir", "gerec", "alet", "aparat"],
    ikon: Wrench,
    renk: "from-orange-500 to-orange-700",
  },
  {
    anahtarlar: ["aksesuar", "koruma", "kilif"],
    ikon: ShieldCheck,
    renk: "from-lime-500 to-lime-700",
  },
];

/** Kategori adina uygun ikon ve gradyan; eslesme yoksa genel kutu ikonu */
export function kategoriGorunumu(kategoriAdi: string): {
  Ikon: typeof Smartphone;
  renk: string;
} {
  const sade = sadeMetin(kategoriAdi);
  const eslesme = ESLESMELER.find((e) => e.anahtarlar.some((a) => sade.includes(a)));
  return {
    Ikon: eslesme?.ikon ?? Package,
    renk: eslesme?.renk ?? "from-slate-500 to-slate-700",
  };
}
