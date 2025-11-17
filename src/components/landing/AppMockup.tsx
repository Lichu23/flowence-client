export function AppMockup() {
  return (
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-transparent to-transparent blur-3xl"></div>
      
      <div className="relative">
        {/* Main phone mockup */}
        <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-purple-500 rounded-[2.5rem] p-[3px] shadow-2xl shadow-purple-500/50">
          <div className="bg-[#0f1020] rounded-[2.4rem] p-4 sm:p-6">
            <div className="flex items-center justify-between mb-6 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span>Escaneando...</span>
              </div>
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/30 via-fuchsia-500/30 to-purple-500/30 rounded-2xl p-[2px] mb-6">
              <div className="bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 rounded-2xl p-6 sm:p-8">
                <div className="bg-white rounded-xl p-4 sm:p-6 flex items-center justify-center">
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2 6h2v12H2V6zm3 0h1v12H5V6zm2 0h1v12H7V6zm2 0h2v12H9V6zm3 0h1v12h-1V6zm2 0h2v12h-2V6zm3 0h1v12h-1V6z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="text-left mb-4">
              <h3 className="font-semibold mb-1 text-sm sm:text-base">Leche Entera 1L</h3>
              <p className="text-xs text-gray-500 mb-2">SKU: 7501234567890</p>
              <div className="flex items-end gap-2">
                <span className="text-xl sm:text-2xl font-bold text-purple-400">$24.90</span>
                <span className="text-xs sm:text-sm text-emerald-400 mb-1">En stock: 156</span>
              </div>
            </div>
            
            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg font-medium text-sm shadow-lg shadow-purple-500/30">
              Agregar al carrito
            </button>
          </div>
        </div>

        {/* Floating card - Sales Today */}
        <div className="hidden lg:block absolute -left-12 top-4 w-56">
          <div className="bg-gradient-to-br from-purple-500/50 to-fuchsia-500/50 rounded-2xl p-[2px] shadow-2xl shadow-purple-500/30">
            <div className="bg-[#0f1020] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-sm text-gray-300">Ventas Hoy</span>
                </div>
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">+23%</span>
              </div>
              <div className="text-3xl font-bold mb-4 text-purple-300">$12,480</div>
              <div className="flex gap-1 items-end h-20">
                {[40, 65, 45, 80, 55, 90, 70, 85].map((height, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-purple-600 to-fuchsia-500 rounded-t" 
                    style={{ height: `${height}%` }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating card - Inventory */}
        <div className="hidden lg:block absolute -left-8 bottom-4 w-52">
          <div className="bg-gradient-to-br from-purple-500/50 to-fuchsia-500/50 rounded-2xl p-[2px] shadow-2xl shadow-purple-500/30">
            <div className="bg-[#0f1020] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-200">Inventario</span>
              </div>
              <div className="text-3xl font-bold mb-2 text-white">1,247</div>
              <p className="text-xs text-gray-400 mb-3">Total productos</p>
              <div className="flex items-center gap-1 text-xs bg-orange-500/10 border border-orange-500/20 rounded-lg px-2 py-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                <span className="text-orange-400 font-medium">23 por reabastecer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating card - Products */}
        <div className="hidden lg:block absolute -right-8 top-4 w-48">
          <div className="bg-gradient-to-br from-purple-500/50 to-fuchsia-500/50 rounded-2xl p-[2px] shadow-2xl shadow-purple-500/30">
            <div className="bg-[#0f1020] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-200">Productos</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Bebidas', count: 234 },
                  { name: 'Snacks', count: 189 },
                  { name: 'Lácteos', count: 156 }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-purple-900/30 rounded-full w-16">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full" 
                          style={{ width: `${(item.count / 234) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-white w-8 text-right">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating card - Revenue */}
        <div className="hidden lg:block absolute -right-4 bottom-4 w-44">
          <div className="bg-gradient-to-br from-purple-500/50 to-fuchsia-500/50 rounded-2xl p-[2px] shadow-2xl shadow-purple-500/30">
            <div className="bg-[#0f1020] rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
                  <span className="text-purple-400 text-lg">$</span>
                </div>
                <span className="text-sm font-medium text-gray-200">Ingresos</span>
              </div>
              <div className="relative w-24 h-24 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-purple-900/30" />
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="16" 
                    fill="none" 
                    stroke="url(#gradient)" 
                    strokeWidth="3" 
                    strokeDasharray="75, 100" 
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">75%</span>
                </div>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">Meta</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
