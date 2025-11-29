export function StepsSection() {
  const steps = [
    {
      number: '01',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Abre la app',
      description: 'Sin instalaciones complejas. Solo registra tu negocio y empieza.'
    },
    {
      number: '02',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      ),
      title: 'Escanea productos',
      description: 'Agrega tu inventario escaneando códigos de barras en segundos.'
    },
    {
      number: '03',
      icon: (
        <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      title: 'Empieza a vender',
      description: 'Procesa ventas, acepta pagos y genera reportes automáticamente.'
    }
  ]

  return (
    <section id="como-funciona" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Tan simple como 1, 2, 3
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Sin equipos costosos. Sin capacitación compleja. Sin fricción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-purple-500 opacity-30" style={{ top: '4rem', left: '16.666%', right: '16.666%' }}></div>

          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-2xl font-bold mx-auto shadow-purple-lg">
                  {step.number}
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-900/30 border border-purple-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
