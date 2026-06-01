'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logoutAction } from '@/app/actions/auth'
import type { Session } from 'next-auth'

interface NavbarClientProps {
  session: Session | null
}

export function NavbarClient({ session }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Katalog' },
    { href: '/about', label: 'Tentang' },
  ]

  const isLoggedIn = !!session?.user
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN'
  const isProfileCompleted = session?.user?.profileCompleted

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
          <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">KM</span>
          </div>
          <span className="hidden sm:inline">KM ITB</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-700 hover:text-black transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="ghost" className="hidden md:flex gap-2 text-sm font-medium">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              )}
              
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                    0
                  </span>
                </Button>
              </Link>

              <Link href={isProfileCompleted ? "/account" : "/complete-profile"}>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
              
              <form action={logoutAction} className="hidden md:block">
                <Button variant="ghost" size="icon" type="submit" title="Logout" className="rounded-full hover:bg-gray-100 text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="w-5 h-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button className="font-medium bg-blue-900 hover:bg-blue-800 text-white">Daftar</Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-full ml-1"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-gray-700 hover:text-black font-medium"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {!isLoggedIn ? (
              <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full">Masuk</Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-blue-900 hover:bg-blue-800">Daftar</Button>
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-100 space-y-2">
                {isAdmin && (
                  <Link href="/admin" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <form action={logoutAction}>
                  <Button variant="ghost" type="submit" className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
