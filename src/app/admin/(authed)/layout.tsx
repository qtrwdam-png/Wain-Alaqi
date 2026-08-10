import { requireStaff } from "@/lib/auth-guard";
import { AdminSidebar } from "@/components/admin-sidebar";

export default async function AuthedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireStaff();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-app py-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <AdminSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
