import { NextResponse } from "next/server";
import { COOKIE_ADI, jetonUret, sifreDogruMu } from "@/lib/oturum";

export const dynamic = "force-dynamic";

export async function POST(istek: Request) {
  let sifre = "";
  try {
    const govde = (await istek.json()) as { sifre?: string };
    sifre = govde.sifre ?? "";
  } catch {
    return NextResponse.json({ hata: "Geçersiz istek." }, { status: 400 });
  }

  if (!sifreDogruMu(sifre)) {
    // Kaba kuvvet denemelerini yavaslatmak icin kucuk bir gecikme
    await new Promise((coz) => setTimeout(coz, 600));
    return NextResponse.json({ hata: "Şifre yanlış." }, { status: 401 });
  }

  const cevap = NextResponse.json({ tamam: true });
  cevap.cookies.set({
    name: COOKIE_ADI,
    value: jetonUret(),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return cevap;
}
