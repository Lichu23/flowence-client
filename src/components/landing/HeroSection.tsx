export function HeroSection() {
  return (
    <section className="pt-5 lg:pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block px-4 py-2 bg-purple-900/30 border border-purple-500/30 rounded-full text-sm text-purple-300 mb-8">
          PLATAFORMA POS Y GESTIÓN
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-foreground">
          Empieza a vender<br />en <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">minutos</span>
        </h1>
        <p className="text-lg text-muted max-w-3xl mx-auto mb-10 leading-relaxed">
          Flowence permite que cualquier supermercado o almacén empiece a vender, controlar inventario y gestionar su negocio en minutos, sin equipos costosos, sin instalaciones complejas y sin fricción.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button className="btn-primary w-full sm:w-auto px-6 py-3">
            Ver demostración
          </button>
          <button className="btn-secondary w-full sm:w-auto px-6 py-3 flex items-center justify-center gap-2">
            Solicitar cotización
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-subtle">
          Solo abrir la app, escanear y trabajar. Sin fricción.
        </p>
      </div>
    </section>
  )
}
