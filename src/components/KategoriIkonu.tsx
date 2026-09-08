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
 * Kategori adindaki anahtar kelimeye gore ikon secer.
 *
 * Onceki surumde her kategorinin ayri bir gradyan rengi vardi; on farkli
 * renkli kutu sayfayi kalabaliklastiriyordu. Artik tek renk, ince cizgi
 * ikon: kategoriyi ayirt etmeye yetiyor, dikkati fiyattan calmiyor.
 */
const ESLESMELER: { anahtarlar: string[]; ikon: typeof Smartphone }[] = [
  { anahtarlar: ["ekran", "lcd", "oled", "dokunmatik", "display", "cam"], ikon: Smartphone },
  { anahtarlar: ["batarya", "pil", "battery"], ikon: BatteryCharging },
  { anahtarlar: ["sarj", "soket", "usb", "flex", "charging", "bord"], ikon: Usb },
  { anahtarlar: ["kamera", "lens", "camera"], ikon: Camera },
  { anahtarlar: ["hoparlor", "buzzer", "zil", "speaker"], ikon: Volume2 },
  { anahtarlar: ["mikrofon", "mic"], ikon: Mic },
  { anahtarlar: ["kulaklik", "ear"], ikon: Speaker },
  { anahtarlar: ["kasa", "kapak", "cita", "cover", "frame"], ikon: Layers },
  { anahtarlar: ["titresim", "vibra"], ikon: Vibrate },
  { anahtarlar: ["parmak", "finger", "yuz", "face"], ikon: Fingerprint },
  { anahtarlar: ["anakart", "entegre", "cip", "elektronik", "board"], ikon: Cpu },
  { anahtarlar: ["tamir", "gerec", "alet", "aparat"], ikon: Wrench },
  { anahtarlar: ["aksesuar", "koruma", "kilif"], ikon: ShieldCheck },
];

/** Kategori adina uygun ikonu dondurur; eslesme yoksa genel kutu ikonu */
export function kategoriGorunumu(kategoriAdi: string): { Ikon: typeof Smartphone } {
  const sade = sadeMetin(kategoriAdi);
  const eslesme = ESLESMELER.find((e) => e.anahtarlar.some((a) => sade.includes(a)));
  return { Ikon: eslesme?.ikon ?? Package };
}
