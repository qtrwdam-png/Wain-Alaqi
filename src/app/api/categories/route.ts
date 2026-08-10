import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const categories = await prisma.category.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("[/api/categories] DB error:", error);
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
