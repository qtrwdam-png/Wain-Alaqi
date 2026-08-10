import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !["ADMIN", "CONTENT_MANAGER"].includes(session.user.role)) {
    return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  }
  const body = await req.json();
  const { id, status } = body;
  if (!id || !status) return NextResponse.json({ error: "id و status مطلوبان" }, { status: 400 });
  const updated = await prisma.searchRequest.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true, request: updated });
}
