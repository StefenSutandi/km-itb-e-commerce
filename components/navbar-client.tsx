"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu, X, ShoppingBag, User, LogOut } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import type { Session } from "next-auth";

export function NavbarClient({ session }: { session: Session | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPERADMIN";
  const links = [
    { href: "/#layanan", label: "Unit usaha" },
    { href: "/products", label: "Katalog toko" },
    { href: "/#tentang", label: "Tentang KKP" },
    { href: "/#bantuan", label: "Bantuan" },
  ];
  return (
    <header className="kkp-nav">
      <div className="kkp-nav-inner">
        <Link href="/" className="kkp-wordmark" aria-label="KKP ITB beranda">
          <span className="kkp-mark">
            K<span />
          </span>
          KKP ITB
          <span className="brand-divider" />
          <small>Koperasi kita.</small>
        </Link>
        <nav className="kkp-desktop-links" aria-label="Navigasi utama">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="kkp-nav-actions">
          {session?.user ? (
            <>
              <Link href="/cart" aria-label="Keranjang belanja">
                <ShoppingBag size={17} />
              </Link>
              <Link
                href={
                  session.user.profileCompleted
                    ? "/account"
                    : "/complete-profile"
                }
                aria-label="Akun saya"
              >
                <User size={17} />
              </Link>
              {isAdmin && (
                <Link href="/admin" className="kkp-login">
                  Admin
                </Link>
              )}
              <form action={logoutAction}>
                <button type="submit" aria-label="Keluar">
                  <LogOut size={16} />
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="kkp-login">
              Masuk <ArrowUpRight size={13} />
            </Link>
          )}
          <button
            className="kkp-menu-toggle"
            type="button"
            aria-label={isOpen ? "Tutup navigasi" : "Buka navigasi"}
            aria-expanded={isOpen}
            aria-controls="kkp-mobile-menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <nav
          id="kkp-mobile-menu"
          className="kkp-mobile-links"
          aria-label="Navigasi seluler"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
            >
              {link.label}
              <ArrowUpRight size={14} />
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
