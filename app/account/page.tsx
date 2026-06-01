'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { User as UIUserIcon, Package, MapPin, Heart, Bell, Settings, LogOut, ChevronRight, ShoppingBag } from 'lucide-react'

export default function AccountPage() {
  const user = {
    name: 'Budi Santoso',
    email: 'budi@example.com',
    phone: '08123456789',
    joinDate: '2024-01-15',
  }

  const menuItems = [
    {
      label: 'My Orders',
      description: 'View and track your orders',
      icon: ShoppingBag,
      href: '/account/orders',
    },
    {
      label: 'Profile Settings',
      description: 'Manage your account information',
      icon: Settings,
      href: '/account/settings',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="space-y-8">
          <h1 className="text-4xl font-light">My Account</h1>

          {/* Profile Card */}
          <Card className="p-6 md:p-8 border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                  <UIUserIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{user.name}</h2>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-full border-black text-black hover:bg-black hover:text-white"
              >
                Edit Profile
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Phone</p>
                <p className="font-medium">{user.phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Member Since</p>
                <p className="font-medium">
                  {new Date(user.joinDate).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </Card>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <Icon className="w-6 h-6 text-black" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{item.label}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Logout */}
          <div className="flex">
            <Button className="rounded-full bg-red-600 hover:bg-red-700 text-white gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
