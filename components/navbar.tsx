'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, ShoppingBag, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
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
        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-gray-100"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-accent text-black text-xs rounded-full flex items-center justify-center">
                0
              </span>
            </Button>
          </Link>

          <Link href="/account">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100"
            >
              <User className="w-5 h-5" />
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-full"
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
          </div>
        </div>
      )}
    </nav>
  )
}
