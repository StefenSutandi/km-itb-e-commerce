import { AdminSidebar } from '@/components/admin-sidebar'

export const metadata = {
  title: 'Admin Dashboard | KM ITB',
  description: 'Admin dashboard for KM ITB merchandise store',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  )
}
