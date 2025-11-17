export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a14]/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
              F
            </div>
            <span className="text-lg font-semibold">Flowence</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#productos" className="text-sm text-gray-300 hover:text-white transition-colors">
              Productos
            </a>
            <a href="#caracteristicas" className="text-sm text-gray-300 hover:text-white transition-colors">
              Características
            </a>
            <a href="#precios" className="text-sm text-gray-300 hover:text-white transition-colors">
              Precios
            </a>
            <a href="#recursos" className="text-sm text-gray-300 hover:text-white transition-colors">
              Recursos
            </a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#ayuda" className="hidden sm:inline text-sm text-gray-300 hover:text-white transition-colors">
              Ayuda
            </a>
            <a href="#iniciar-sesion" className="hidden sm:inline text-sm text-gray-300 hover:text-white transition-colors">
              Iniciar sesión
            </a>
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-fuchsia-700 transition-all">
              Prueba gratis
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
