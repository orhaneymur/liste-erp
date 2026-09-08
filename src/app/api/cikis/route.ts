import { NextResponse } from "next/server";
import { COOKIE_ADI } from "@/lib/oturum";

export const dynamic = "force-dynamic";

export async function POST() {
  const cevap = NextResponse.json({ tamam: true });
  cevap.cookies.set({ name: COOKIE_ADI, value: "", path: "/", maxAge: 0 });
  return cevap;
}
