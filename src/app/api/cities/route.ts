import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const cities = await prisma.city.findMany({ where: { active: true }, orderBy: { name: "asc" } });
    return NextResponse.json({ cities });
  } catch (error) {
    console.error("[/api/cities] DB error:", error);
    return NextResponse.json({ cities: [] }, { status: 200 });
  }
}
