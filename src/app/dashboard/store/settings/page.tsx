import { prisma } from "@/lib/prisma";
import { getCurrentUser, getOwnedStore } from "@/lib/auth-guard";
import { StoreSettingsForm } from "@/components/store-settings-form";

export const dynamic = "force-dynamic";

export default async function StoreSettingsPage() {
  const user = await getCurrentUser();
  const store = user ? await getOwnedStore(user.id) : null;
  if (!store) return <p className="card p-6">ليس لديك متجر.</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-extrabold text-gray-900">إعدادات المتجر</h1>
      <StoreSettingsForm store={store} />
    </div>
  );
}
