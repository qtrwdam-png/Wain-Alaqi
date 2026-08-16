import { NextResponse } from "next/server";
import { getCities } from "@/lib/cached-queries";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const cities = await getCities();
    return NextResponse.json({ cities });
  } catch (error) {
    console.error("[/api/cities] DB error:", error);
    return NextResponse.json({ cities: [] }, { status: 200 });
  }
}
