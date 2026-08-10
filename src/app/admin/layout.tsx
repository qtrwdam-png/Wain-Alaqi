// Shared shell for all /admin/* routes. The guard + sidebar live in the
// (authed) route group so that /admin/login can render without auth.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
