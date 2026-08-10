import { requireStoreOwner, getCurrentUser, getOwnedStore } from "@/lib/auth-guard";
import { StoreSidebar } from "@/components/store-sidebar";
import { redirect } from "next/navigation";

export default async function StoreDashboardLayout({ children }: { children: React.ReactNode }) {
  await requireStoreOwner();
  const user = await getCurrentUser();
  const store = user ? await getOwnedStore(user.id) : null;

  return (
    <div className="container-app py-6 sm:py-8">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <StoreSidebar store={store} />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
