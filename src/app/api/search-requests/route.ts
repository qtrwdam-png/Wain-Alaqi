import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { searchRequestSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";

export async function GET() {
  const requests = await prisma.searchRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ requests });
}

export async function POST(req: Request) {
  try {
    // Attach the request to the logged-in user when available. Anonymous
    // visitors still work — their requests are saved with userId = null.
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;

    const body = await req.json();
    const parsed = searchRequestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const { query, notes, phone, email } = parsed.data;

    // Merge duplicate requests by query (case-insensitive) only for the
    // same user scope, so users don't inflate each other's request counts.
    const existing = await prisma.searchRequest.findFirst({
      where: {
        query: { equals: query, mode: "insensitive" },
        status: { in: ["NEW", "SEARCHING"] },
        userId: userId ?? undefined,
      },
    });
    if (existing) {
      const updated = await prisma.searchRequest.update({
        where: { id: existing.id },
        data: { count: { increment: 1 }, ...(userId ? { userId } : {}) },
      });
      return NextResponse.json({ ok: true, id: updated.id, merged: true });
    }

    const created = await prisma.searchRequest.create({
      data: { query, notes, phone, email: email || null, userId, status: "NEW" },
    });
    logger.info("search_request.created", { id: created.id, query, userId });
    return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
  } catch (e) {
    logger.error("search_request.create_failed", { error: String(e) });
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
