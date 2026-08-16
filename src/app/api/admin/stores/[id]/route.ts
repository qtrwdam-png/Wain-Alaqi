import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { bustStoresCache } from "@/lib/cache-bust";

type Ctx = { params: { id: string } };

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session.user;
}

// Approve / reject / suspend / archive
export async function PATCH(req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  const body = await req.json();
  const { action, rejectionReason } = body as { action: string; rejectionReason?: string };
  const store = await prisma.store.findUnique({ where: { id: params.id } });
  if (!store) return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });

  let status = store.status;
  let verified = store.verified;
  let extra: any = {};
  switch (action) {
    case "approve": status = "APPROVED"; verified = true; extra.rejectionReason = null; break;
    case "reject": status = "REJECTED"; extra.rejectionReason = rejectionReason || "لم يحدد سبب"; break;
    case "suspend": status = "SUSPENDED"; break;
    case "archive": status = "ARCHIVED"; break;
    case "restore": status = "APPROVED"; break;
    case "feature": extra.isFeatured = true; break;
    case "unfeature": extra.isFeatured = false; break;
    default: return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  }

  const updated = await prisma.store.update({ where: { id: params.id }, data: { status, verified, ...extra } });
  logger.audit(admin.id, `store.${action}`, "store", params.id);

  // Bust stores cache so status changes appear on public pages
  bustStoresCache(updated.slug);

  // Create notification for the store owner
  const typeMap: Record<string, string> = {
    approve: "STORE_APPROVED",
    reject: "STORE_REJECTED",
    suspend: "STORE_SUSPENDED",
    restore: "STORE_RESTORED",
  };
  const type = typeMap[action];
  if (type) {
    const titleMap: Record<string, string> = {
      approve: "تمت الموافقة على متجرك ✅",
      reject: "تم رفض متجرك ❌",
      suspend: "تم إيقاف متجرك ⛔",
      restore: "تم استعادة متجرك ✅",
    };
    const msgMap: Record<string, string> = {
      approve: "تمت الموافقة على متجرك وسيظهر الآن للعامة.",
      reject: `تم رفض متجرك. ${rejectionReason ? `السبب: ${rejectionReason}` : "يرجى مراجعة البيانات وإعادة المحاولة."}`,
      suspend: "تم إيقاف متجرك مؤقتاً من قبل الإدارة.",
      restore: "تمت استعادة متجرك وهو متاح الآن للعامة.",
    };
    await prisma.notification.create({
      data: {
        userId: store.ownerId,
        type: type as any,
        title: titleMap[action],
        message: msgMap[action],
        link: "/dashboard/store",
      },
    }).catch((e) => logger.error("notification.create", { error: String(e) }));
  }

  return NextResponse.json({ ok: true, store: updated });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "لا تملك صلاحية" }, { status: 403 });
  const store = await prisma.store.findUnique({ where: { id: params.id }, select: { slug: true } });
  await prisma.store.delete({ where: { id: params.id } });
  logger.audit(admin.id, "store.delete", "store", params.id);

  // Bust stores cache so the deleted store is removed from public pages
  bustStoresCache(store?.slug);

  return NextResponse.json({ ok: true });
}
