/**
 * Marka logolarini hazirlar.
 *
 * "simple-icons" paketindeki GERCEK marka logolarini (resmi SVG yollari)
 * public/logolar/ klasorune tek tek SVG dosyasi olarak yazar.
 * Paketin icinde bulunmayan markalar icin okunabilir bir monogram (harf) logosu uretir.
 *
 * Kullanim:  npm run logolar
 * (npm install sonrasinda otomatik calisir)
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const kokDizin = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hedefDizin = path.join(kokDizin, "public", "logolar");

/**
 * dosya  -> public/logolar/<dosya>.svg
 * slug   -> simple-icons paketindeki marka anahtari (yoksa monogram uretilir)
 * ad     -> monogram uretilirse kullanilacak marka adi
 * renk   -> monogram/logolar icin marka rengi
 */
const MARKALAR = [
  { dosya: "apple", slug: "apple", ad: "Apple", renk: "#111111" },
  { dosya: "samsung", slug: "samsung", ad: "Samsung", renk: "#1428A0" },
  { dosya: "xiaomi", slug: "xiaomi", ad: "Xiaomi", renk: "#FF6900" },
  { dosya: "redmi", slug: "xiaomi", ad: "Redmi", renk: "#FF6900" },
  { dosya: "huawei", slug: "huawei", ad: "Huawei", renk: "#FF0000" },
  { dosya: "honor", slug: "honor", ad: "Honor", renk: "#0077FF" },
  { dosya: "oppo", slug: "oppo", ad: "Oppo", renk: "#046A38" },
  { dosya: "realme", slug: "realme", ad: "Realme", renk: "#FFC915" },
  { dosya: "vivo", slug: "vivo", ad: "Vivo", renk: "#415FFF" },
  { dosya: "oneplus", slug: "oneplus", ad: "OnePlus", renk: "#F5010C" },
  { dosya: "google", slug: "google", ad: "Google Pixel", renk: "#4285F4" },
  { dosya: "nokia", slug: "nokia", ad: "Nokia", renk: "#124191" },
  { dosya: "motorola", slug: "motorola", ad: "Motorola", renk: "#5C92FA" },
  { dosya: "asus", slug: "asus", ad: "Asus", renk: "#00539B" },
  { dosya: "lenovo", slug: "lenovo", ad: "Lenovo", renk: "#E2231A" },
  { dosya: "sony", slug: "sony", ad: "Sony", renk: "#000000" },
  { dosya: "lg", slug: "lg", ad: "LG", renk: "#A50034" },
  { dosya: "htc", slug: "htc", ad: "HTC", renk: "#B2CD00" },
  { dosya: "zte", slug: "zte", ad: "ZTE", renk: "#0055A5" },
  { dosya: "tcl", slug: "tcl", ad: "TCL", renk: "#E60012" },
  { dosya: "alcatel", slug: "alcatel", ad: "Alcatel", renk: "#0092CF" },
  { dosya: "tecno", slug: "tecno", ad: "Tecno", renk: "#1B3D8C" },
  { dosya: "infinix", slug: "infinix", ad: "Infinix", renk: "#00A5A0" },
  { dosya: "vestel", slug: "vestel", ad: "Vestel", renk: "#E30613" },
  { dosya: "meizu", slug: "meizu", ad: "Meizu", renk: "#0055A5" },
  { dosya: "reeder", slug: null, ad: "Reeder", renk: "#E4002B" },
  { dosya: "casper", slug: null, ad: "Casper", renk: "#0B3C8C" },
  { dosya: "general-mobile", slug: null, ad: "General Mobile", renk: "#2B3A8F" },
  { dosya: "poco", slug: null, ad: "Poco", renk: "#FFD100" },
  { dosya: "diger", slug: null, ad: "Diger", renk: "#64748B" },
];

/** simple-icons anahtar formati: apple -> siApple, general-mobile -> siGeneralMobile */
function iconAnahtari(slug) {
  return (
    "si" +
    slug
      .split(/[^a-z0-9]/i)
      .filter(Boolean)
      .map((p) => p[0].toUpperCase() + p.slice(1))
      .join("")
  );
}

/** Marka adindan en fazla 2 harflik monogram uretir: "General Mobile" -> "GM" */
function monogram(ad) {
  const kelimeler = ad.replace(/[^A-Za-z0-9 ]/g, "").trim().split(/\s+/);
  if (kelimeler.length > 1) {
    return (kelimeler[0][0] + kelimeler[1][0]).toUpperCase();
  }
  return kelimeler[0].slice(0, 2).toUpperCase();
}

function monogramSvg(ad, renk) {
  const harf = monogram(ad);
  const fontBoyutu = harf.length > 1 ? 9 : 12;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="${ad}">
  <title>${ad}</title>
  <rect width="24" height="24" rx="6" fill="${renk}"/>
  <text x="12" y="12" fill="#ffffff" font-family="Inter, Segoe UI, Arial, sans-serif" font-size="${fontBoyutu}" font-weight="700" text-anchor="middle" dominant-baseline="central">${harf}</text>
</svg>
`;
}

function markaSvg(icon, renk) {
  const hex = renk || `#${icon.hex}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="${icon.title}">
  <title>${icon.title}</title>
  <path d="${icon.path}" fill="${hex}"/>
</svg>
`;
}

async function main() {
  await mkdir(hedefDizin, { recursive: true });

  let simpleIcons = {};
  try {
    simpleIcons = await import("simple-icons");
  } catch {
    console.warn('! "simple-icons" paketi bulunamadi, tum logolar monogram olarak uretilecek.');
  }

  const gercek = [];
  const uretilen = [];

  for (const marka of MARKALAR) {
    const icon = marka.slug ? simpleIcons[iconAnahtari(marka.slug)] : null;
    const svg = icon ? markaSvg(icon, marka.renk) : monogramSvg(marka.ad, marka.renk);
    await writeFile(path.join(hedefDizin, `${marka.dosya}.svg`), svg, "utf8");
    (icon ? gercek : uretilen).push(marka.dosya);
  }

  console.log(`+ ${gercek.length} gercek marka logosu yazildi: ${gercek.join(", ")}`);
  if (uretilen.length) {
    console.log(`+ ${uretilen.length} monogram logo uretildi: ${uretilen.join(", ")}`);
  }
  console.log(`> Klasor: ${path.relative(kokDizin, hedefDizin)}`);
}

main().catch((hata) => {
  console.error("Logo hazirlama basarisiz:", hata);
  process.exitCode = 1;
});
