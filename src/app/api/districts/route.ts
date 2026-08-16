import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/districts?cityId=... → returns active districts for that city
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cityId = searchParams.get("cityId");
  if (!cityId) return NextResponse.json({ districts: [] });

  const districts = await prisma.district.findMany({
    where: { cityId, active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json({ districts });
}
