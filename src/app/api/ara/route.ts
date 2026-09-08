import { NextResponse } from "next/server";
import { modelAra } from "@/lib/veri";

export const dynamic = "force-dynamic";

export async function GET(istek: Request) {
  const { searchParams } = new URL(istek.url);
  const sorgu = searchParams.get("q") ?? "";
  return NextResponse.json({ sonuclar: modelAra(sorgu) });
}
