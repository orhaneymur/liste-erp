import crypto from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE_ADI = "fl_oturum";
const GECERLILIK_SURESI = 1000 * 60 * 60 * 24 * 30; // 30 gun

/** .env.local icindeki ADMIN_SIFRE yoksa varsayilan sifre kullanilir */
export function adminSifresi(): string {
  return process.env.ADMIN_SIFRE || "admin123";
}

export function varsayilanSifreMi(): boolean {
  return !process.env.ADMIN_SIFRE;
}

function gizliAnahtar(): string {
  return process.env.OTURUM_ANAHTARI || `${adminSifresi()}::fiyat-liste-imza`;
}

function imzala(veri: string): string {
  return crypto.createHmac("sha256", gizliAnahtar()).update(veri).digest("hex");
}

export function jetonUret(): string {
  const bitis = Date.now() + GECERLILIK_SURESI;
  return `${bitis}.${imzala(String(bitis))}`;
}

export function jetonGecerliMi(jeton: string | undefined): boolean {
  if (!jeton) return false;
  const [bitisMetni, imza] = jeton.split(".");
  if (!bitisMetni || !imza) return false;

  const bitis = Number(bitisMetni);
  if (!Number.isFinite(bitis) || bitis < Date.now()) return false;

  const beklenen = imzala(bitisMetni);
  if (beklenen.length !== imza.length) return false;
  return crypto.timingSafeEqual(Buffer.from(beklenen), Buffer.from(imza));
}

export function sifreDogruMu(girilen: string): boolean {
  const dogru = adminSifresi();
  const a = Buffer.from(dogru);
  const b = Buffer.from(girilen ?? "");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** Sunucu tarafinda oturum kontrolu */
export async function oturumVarMi(): Promise<boolean> {
  const cerezler = await cookies();
  return jetonGecerliMi(cerezler.get(COOKIE_ADI)?.value);
}
