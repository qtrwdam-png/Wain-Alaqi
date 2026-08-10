import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchRequestSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export async function GET() {
  const requests = await prisma.searchRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = searchRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const { query, notes, phone, email } = parsed.data;

    // merge duplicate requests by query (case-insensitive)
    const existing = await prisma.searchRequest.findFirst({
      where: { query: { equals: query, mode: "insensitive" }, status: { in: ["NEW", "SEARCHING"] } },
    });
    if (existing) {
      const updated = await prisma.searchRequest.update({
        where: { id: existing.id },
        data: { count: { increment: 1 } },
      });
      return NextResponse.json({ ok: true, id: updated.id, merged: true });
    }

    const created = await prisma.searchRequest.create({
      data: { query, notes, phone, email: email || null, status: "NEW" },
    });
    logger.info("search_request.created", { id: created.id, query });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
