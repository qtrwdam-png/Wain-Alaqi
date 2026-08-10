import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Content } from "@/lib/content";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

async function requireStaff() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) return null;
  return session.user;
}

export async function GET() {
  const content = await Content.getAll();
  return NextResponse.json({ content });
}

export async function PUT(req: Request) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  const body = await req.json();
  const { key, value } = body;
  if (!key || value === undefined) return NextResponse.json({ error: "key و value مطلوبان" }, { status: 400 });
  await Content.set(key, value);
  logger.audit(user.id, "content.update", "content", undefined, { key });
  return NextResponse.json({ ok: true });
}
