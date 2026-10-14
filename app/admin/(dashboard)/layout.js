import AdminGuard from '@/components/admin/AdminGuard';

// Session and admin-role check in the browser (static site); RLS enforces the same rule on every query.
export default function DashboardLayout({ children }) {
  return <AdminGuard>{children}</AdminGuard>;
}
