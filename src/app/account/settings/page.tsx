import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-guard";
import { AccountSettingsForm } from "@/components/account-settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "إعدادات الحساب" };

export default async function AccountSettingsPage() {
  // Server-side auth guard: unauthenticated visitors are redirected to the
  // login page with a return path — no client "loading" flicker.
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login?from=/account/settings");

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  if (!user) redirect("/login?from=/account/settings");

  return <AccountSettingsForm profile={user} />;
}
