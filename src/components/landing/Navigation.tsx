import Link from "next/link";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover-contrast">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <span className="text-lg font-semibold text-foreground">Flowence</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#productos"
              className="text-sm text-foreground-muted hover:text-foreground hover-contrast transition-colors"
            >
              Productos
            </Link>
            <Link
              href="#caracteristicas"
              className="text-sm text-foreground-muted hover:text-foreground hover-contrast transition-colors"
            >
              CaracterísticasT
            </Link>
            <Link
              href="#precios"
              className="text-sm text-foreground-muted hover:text-foreground hover-contrast transition-colors"
            >
              Precios
            </Link>
            <Link
              href="#recursos"
              className="text-sm text-foreground-muted hover:text-foreground hover-contrast transition-colors"
            >
              Recursos
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="#ayuda"
              className="hidden sm:inline text-sm text-foreground-muted hover:text-foreground hover-contrast transition-colors"
            >
              Ayuda
            </Link>
            <Link
              href="/login"
              className="hidden sm:inline text-sm text-foreground-muted hover:text-foreground hover-contrast transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="btn-primary text-sm"
            >
              Prueba gratis
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
