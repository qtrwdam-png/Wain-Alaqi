import { NextResponse } from "next/server";
import { getCategories } from "@/lib/cached-queries";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[/api/categories] DB error:", error);
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
