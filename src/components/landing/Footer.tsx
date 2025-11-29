'use client';

import { useAuth } from '@/contexts/AuthContext';

export function Footer() {
  const { isAuthenticated } = useAuth();

  // Don't show footer on authenticated pages
  if (isAuthenticated) {
    return null;
  }

  // Show footer on landing page
  return (
    <footer id="ayuda" className="py-12 px-4 sm:px-6 lg:px-8 border-t border-crisp">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold text-foreground mb-4">Productos</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-foreground hover-contrast transition-colors">POS</a></li>
              <li><a href="#" className="hover:text-foreground hover-contrast transition-colors">Inventario</a></li>
              <li><a href="#" className="hover:text-foreground hover-contrast transition-colors">Reportes</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-foreground hover-contrast transition-colors">Nosotros</a></li>
              <li><a href="#" className="hover:text-foreground hover-contrast transition-colors">Contacto</a></li>
              <li><a href="#" className="hover:text-foreground hover-contrast transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Soporte</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li><a href="#" className="hover:text-foreground hover-contrast transition-colors">Ayuda</a></li>
              <li><a href="#" className="hover:text-foreground hover-contrast transition-colors">Documentación</a></li>
              <li><a href="#" className="hover:text-foreground hover-contrast transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
                F
              </div>
              <span className="font-semibold text-foreground">Flowence</span>
            </div>
            <p className="text-sm text-muted">
              Gestiona tu negocio en minutos
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-crisp text-center text-sm text-muted">
          <p>© 2025 Flowence. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
