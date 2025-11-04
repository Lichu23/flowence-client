"use client";

/**
 * Navbar Component - Unified navigation bar for all pages (Mobile Responsive)
 */

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { StoreSelector } from "@/components/StoreSelector";

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navLinks = [
    {
      href: "/dashboard",
      label: "Panel",
      icon: "📊",
      show: user?.role === "owner",
    },
    {
      href: "/pos",
      label: "Caja",
      icon: "🛒",
      show: user?.role === "employee",
    },
    { href: "/products", label: "Productos", icon: "📦", show: true },
    { href: "/sales", label: "Ventas", icon: "🧾", show: true },
    {
      href: "/stores",
      label: "Tiendas",
      icon: "🏪",
      show: user?.role === "owner",
    },
    {
      href: "/employees",
      label: "Empleados",
      icon: "👥",
      show: user?.role === "owner",
    },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Desktop and Mobile Top Bar */}
        <div className="flex justify-between items-center py-3 sm:py-4">
          {/* Left side - Store Selector (always visible) */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 md:flex-initial">
            <div className="min-w-0 max-w-[200px] sm:max-w-[240px] md:max-w-none">
              <StoreSelector />
            </div>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {/* Navigation Links */}
            {navLinks.map(
              (link) =>
                link.show && (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-medium transition-colors px-3 py-2 rounded-lg ${
                      pathname === link.href
                        ? "text-blue-600 font-semibold bg-blue-50"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                    onClick={(e) => {
                      if (pathname === link.href) {
                        e.preventDefault();
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                )
            )}

            {/* User Info */}
            <div className="text-sm text-gray-600 border-l border-gray-300 pl-4 hidden lg:block">
              {user?.name}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 lg:px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Mobile: Hamburger menu button only */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Alternar menú"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Store Selector removed (now inline with hamburger) */}
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="px-3 py-3 space-y-1">
            {/* Navigation Links */}
            {navLinks.map(
              (link) =>
                link.show && (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                      pathname === link.href
                        ? "text-blue-600 font-semibold bg-blue-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    onClick={(e) => {
                      if (pathname === link.href) {
                        e.preventDefault();
                      }
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="text-2xl">{link.icon}</span>
                    <span className="text-base">{link.label}</span>
                  </Link>
                )
            )}

            {/* User Info */}
            <div className="px-4 py-3 border-t border-gray-200 mt-2">
              <div className="text-sm font-medium text-gray-900">
                {user?.name}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Cerrar Sesión
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
