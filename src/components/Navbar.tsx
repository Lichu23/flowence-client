"use client";

/**
 * Navbar Component - Unified navigation bar with distinct auth/non-auth states
 *
 * Non-authenticated: Shows landing page navigation (Características, Cómo funciona, Precios, Ayuda)
 * Authenticated: Shows app navigation (Dashboard/Caja, Productos, Ventas, Tiendas, Empleados)
 */

import { StoreSelector } from "@/components/StoreSelector";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Package,
  Receipt,
  ShoppingCart,
  Store,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface NavLink {
  href: string;
  label: string;
  icon?: LucideIcon;
  show?: boolean;
  scroll?: boolean;
}

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);
  const scrollYRef = useRef(0);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Prevent body scroll when mobile menu is open (iOS-safe)
  useEffect(() => {
    if (mobileMenuOpen) {
      // Save current scroll position
      scrollYRef.current = window.scrollY;

      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      return () => {
        // Restore body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';

        // Restore scroll position
        window.scrollTo(0, scrollYRef.current);
      };
    }
  }, [mobileMenuOpen]);

  // Focus trap and ESC key handler
  useEffect(() => {
    if (!mobileMenuOpen || !menuRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC to close
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        hamburgerButtonRef.current?.focus();
        return;
      }

      // Tab trap logic
      if (e.key === 'Tab') {
        const focusableElements = menuRef.current?.querySelectorAll(
          'a[href], button:not([disabled])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        // Shift+Tab on first element → focus last
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
        // Tab on last element → focus first
        else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Focus management: focus first menu item when opened
  useEffect(() => {
    if (mobileMenuOpen && menuRef.current) {
      const firstLink = menuRef.current.querySelector('a[href], button') as HTMLElement;
      firstLink?.focus();
    } else if (!mobileMenuOpen && hamburgerButtonRef.current) {
      // Return focus to hamburger button when menu closes
      hamburgerButtonRef.current.focus();
    }
  }, [mobileMenuOpen]);

  // Non-authenticated navigation (landing page)
  const landingNavLinks: NavLink[] = [
    { href: "/#caracteristicas", label: "Características", scroll: true },
    { href: "/#como-funciona", label: "Cómo funciona", scroll: true },
    { href: "/#precios", label: "Precios", scroll: true },
    { href: "/#ayuda", label: "Ayuda", scroll: true },
  ];

  // Authenticated navigation (app)
  const appNavLinks: NavLink[] = [
    {
      href: "/dashboard",
      label: "Panel",
      icon: LayoutDashboard,
      show: user?.role === "owner",
    },
    {
      href: "/pos",
      label: "Caja",
      icon: ShoppingCart,
      show: user?.role === "employee",
    },
    { href: "/products", label: "Productos", icon: Package, show: true },
    { href: "/sales", label: "Ventas", icon: Receipt, show: true },
    {
      href: "/stores",
      label: "Tiendas",
      icon: Store,
      show: user?.role === "owner",
    },
    {
      href: "/employees",
      label: "Empleados",
      icon: Users,
      show: user?.role === "owner",
    },
  ];

  return (
    <header className="glass-bg-5 border-b border-crisp-light sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        {/* Desktop and Mobile Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo/Brand or Store Selector */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 md:flex-initial">
            {isAuthenticated ? (
              <div className="min-w-0 max-w-[200px] sm:max-w-[240px] md:max-w-none">
                <StoreSelector />
              </div>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  F
                </div>
                <span className="font-semibold text-foreground hidden sm:inline">
                  Flowence
                </span>
              </Link>
            )}
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3 lg:gap-4">
            {isAuthenticated ? (
              <>
                {/* Authenticated Navigation Links */}
                {appNavLinks.map(
                  (link) =>
                    link.show && (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`nav-link ${
                          pathname === link.href ? "nav-link-active" : ""
                        }`}
                        onClick={(e) => {
                          if (pathname === link.href) {
                            e.preventDefault();
                          }
                        }}
                        aria-label={link.label}
                        aria-current={
                          pathname === link.href ? "page" : undefined
                        }
                      >
                        <span className="text-sm">{link.label}</span>
                      </Link>
                    )
                )}

                {/* User Info */}
                <div
                  className="text-sm text-apca-muted border-l  pl-4 hidden lg:block"
                  aria-label="Usuario actual"
                >
                  {user?.name}
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="btn-secondary px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm text-error hover:border-error/50"
                  type="button"
                  aria-label="Cerrar sesión"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                {/* Non-authenticated Navigation Links */}
                {landingNavLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm lg:text-base font-medium text-apca-muted hover:text-foreground hover-contrast transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ))}

                {/* Auth CTAs */}
                <Link
                  href="/login"
                  className="text-sm lg:text-base font-medium text-apca-muted hover:text-foreground hover-contrast transition-colors duration-200"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Prueba gratis
                </Link>
              </>
            )}
          </div>

          {/* Mobile: Hamburger menu button only */}
          <div className="flex items-center md:hidden">
            <button
              ref={hamburgerButtonRef}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover-contrast active-contrast focus-contrast flex-shrink-0"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              type="button"
            >
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6 text-apca-pass"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6 text-apca-pass"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="md:hidden h-dvh border-t border-crisp-light bg-black animate-slide-up fixed inset-0 top-16 z-40 overscroll-contain"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación móvil"
        >
          <nav className="px-3 h-full py-3 space-y-1 overflow-y-auto">
            {isAuthenticated ? (
              <>
                {/* Authenticated Mobile Navigation */}
                {appNavLinks.map(
                  (link) =>
                    link.show && (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`nav-link text-icon-pair-md ${
                          pathname === link.href ? "nav-link-active" : ""
                        }`}
                        onClick={(e) => {
                          if (pathname === link.href) {
                            e.preventDefault();
                          }
                          setMobileMenuOpen(false);
                        }}
                      >
                        {link.icon && (
                          <link.icon className="w-6 h-6" aria-hidden="true" />
                        )}
                        <span className="text-base">{link.label}</span>
                      </Link>
                    )
                )}

                {/* User Info */}
                <div className="px-4 py-3 border-t mt-2">
                  <div className="text-sm font-medium text-apca-pass">
                    {user?.name}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full btn-secondary px-3 py-2 md:px-4 md:py-2 text-sm md:text-base text-error hover:border-error/50 text-icon-pair-md justify-center"
                >
                  <svg
                    className="w-4 h-4 md:w-5 md:h-5"
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
              </>
            ) : (
              <>
                {/* Non-authenticated Mobile Navigation */}
                {landingNavLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-3 rounded-lg text-base font-medium text-apca-muted hover:bg-purple-900/20 hover:text-foreground transition-colors duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}

                {/* Auth CTAs */}
                <div className="pt-4 border-t border-crisp-light space-y-2">
                  <Link
                    href="/login"
                    className="block px-4 py-3 rounded-lg text-base font-medium text-apca-muted hover:bg-purple-900/20 hover:text-foreground transition-colors duration-200 text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register"
                    className="block btn-primary px-4 py-3 text-base text-center w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Prueba gratis
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
