// Shared shell for all /admin/* routes. The guard + sidebar live in the
// (authed) route group. The staff login lives on a separate unguessable
// route (/fayizadminlogin) so direct visits to /admin/login return 404.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
