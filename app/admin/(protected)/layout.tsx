import AdminNav from '../_components/AdminNav';
import { requireAdmin } from '@/lib/admin/auth';

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen flex-col bg-cream-50 lg:flex-row">
      <AdminNav />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
