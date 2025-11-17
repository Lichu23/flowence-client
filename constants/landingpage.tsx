export const features = [
  {
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
    title: "Punto de Venta",
    description:
      "Sistema POS completo con escaneo de códigos de barras, gestión de carrito y procesamiento de pagos en efectivo o tarjeta.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
    title: "Control de Inventario",
    description:
      "Seguimiento en tiempo real de tu stock, categorías de productos y alertas automáticas de bajo inventario.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    title: "Gestión de Usuarios",
    description:
      "Sistema multi-rol con permisos personalizados para propietarios, gerentes y empleados.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    title: "Reportes y Analíticas",
    description:
      "Reportes detallados de ventas, inventario y rendimiento del negocio con exportación a CSV y PDF.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    title: "Seguridad Avanzada",
    description:
      "Autenticación JWT, encriptación de datos y registros de auditoría completos para todas las transacciones.",
  },
  {
    icon: (
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
    title: "Multi-Plataforma",
    description:
      "Funciona en cualquier dispositivo con modo offline. Progressive Web App instalable en tablets y móviles.",
  },
];

export const pricingPlans = [
  {
    name: "Básico",
    description: "Perfecto para pequeños negocios",
    price: "$29",
    priceSubtext: "/mes",
    features: [
      "Hasta 500 productos",
      "1 usuario",
      "POS básico",
      "Reportes mensuales",
      "Soporte por email",
    ],
    buttonText: "Empezar ahora",
    isPopular: false,
  },
  {
    name: "Profesional",
    description: "Ideal para negocios en crecimiento",
    price: "$79",
    priceSubtext: "/mes",
    features: [
      "Productos ilimitados",
      "Hasta 5 usuarios",
      "POS avanzado",
      "Reportes en tiempo real",
      "Soporte prioritario",
      "Múltiples sucursales",
    ],
    buttonText: "Empezar ahora",
    isPopular: true,
  },
  {
    name: "Enterprise",
    description: "Para cadenas de supermercados",
    price: "Personalizado",
    features: [
      "Todo lo de Profesional",
      "Usuarios ilimitados",
      "API personalizada",
      "Soporte dedicado 24/7",
      "Capacitación personalizada",
      "Integraciones personalizadas",
    ],
    buttonText: "Contactar ventas",
    isPopular: false,
  },
];
