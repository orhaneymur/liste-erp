import {
  BatteryCharging,
  Camera,
  Cpu,
  Fingerprint,
  Layers,
  Mic,
  Monitor,
  Package,
  ScanFace,
  ShieldCheck,
  Smartphone,
  Speaker,
  Usb,
  Vibrate,
  Volume2,
  Wrench,
} from "lucide-react";
import { slugla } from "@/lib/slug";

/** Kategori adindaki anahtar kelimeye gore ikon ve renk secer */
const ESLESMELER: { anahtarlar: string[]; ikon: typeof Smartphone; renk: string }[] = [
  { anahtarlar: ["ekran", "lcd", "oled", "dokunmatik", "display"], ikon: Smartphone, renk: "from-sky-500 to-blue-600" },
  { anahtarlar: ["batarya", "pil", "battery"], ikon: BatteryCharging, renk: "from-emerald-500 to-green-600" },
  { anahtarlar: ["sarj", "soket", "usb", "flex", "charging"], ikon: Usb, renk: "from-amber-500 to-orange-600" },
  { anahtarlar: ["kamera", "lens", "camera"], ikon: Camera, renk: "from-violet-500 to-purple-600" },
  { anahtarlar: ["hoparlor", "buzzer", "zil", "speaker"], ikon: Volume2, renk: "from-pink-500 to-rose-600" },
  { anahtarlar: ["mikrofon", "mic"], ikon: Mic, renk: "from-fuchsia-500 to-pink-600" },
  { anahtarlar: ["ic kulaklik", "kulaklik", "ear"], ikon: Speaker, renk: "from-cyan-500 to-teal-600" },
  { anahtarlar: ["arka kapak", "kapak", "batarya kapagi", "cover"], ikon: Layers, renk: "from-indigo-500 to-blue-700" },
  { anahtarlar: ["kasa", "cerceve", "frame", "housing"], ikon: Package, renk: "from-slate-400 to-slate-600" },
  { anahtarlar: ["cam", "glass", "on cam", "lens cam"], ikon: ShieldCheck, renk: "from-teal-400 to-cyan-600" },
  { anahtarlar: ["anakart", "entegre", "ic", "board"], ikon: Cpu, renk: "from-red-500 to-rose-700" },
  { anahtarlar: ["parmak izi", "touch id", "sensor"], ikon: Fingerprint, renk: "from-lime-500 to-emerald-600" },
  { anahtarlar: ["yuz", "face id"], ikon: ScanFace, renk: "from-purple-500 to-indigo-700" },
  { anahtarlar: ["titresim", "motor", "vibrasyon"], ikon: Vibrate, renk: "from-orange-500 to-red-600" },
  { anahtarlar: ["monitor", "tablet"], ikon: Monitor, renk: "from-blue-500 to-indigo-600" },
];

export function kategoriGorunumu(kategoriAdi: string) {
  const slug = slugla(kategoriAdi).replace(/-/g, " ");
  for (const eslesme of ESLESMELER) {
    if (eslesme.anahtarlar.some((a) => slug.includes(a))) {
      return { Ikon: eslesme.ikon, renk: eslesme.renk };
    }
  }
  return { Ikon: Wrench, renk: "from-slate-500 to-slate-700" };
}

export function KategoriIkonu({
  kategoriAdi,
  className = "size-6",
}: {
  kategoriAdi: string;
  className?: string;
}) {
  const { Ikon } = kategoriGorunumu(kategoriAdi);
  return <Ikon className={className} strokeWidth={1.9} />;
}
