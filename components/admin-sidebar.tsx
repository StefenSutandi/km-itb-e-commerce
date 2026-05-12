'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, BarChart3, LogOut } from 'lucide-react'

const menuItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col border-r border-gray-800">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-6 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive
                  ? 'bg-accent text-black'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white font-medium transition-colors">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}
