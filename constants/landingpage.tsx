// PERFORMANCE: Lightweight feature data structure
// Icons are rendered dynamically by LandingIcon component to reduce bundle size
export const features = [
  {
    iconType: 'cart' as const,
    title: "Punto de Venta",
    description:
      "Sistema POS completo con escaneo de códigos de barras, gestión de carrito y procesamiento de pagos en efectivo o tarjeta.",
  },
  {
    iconType: 'inventory' as const,
    title: "Control de Inventario",
    description:
      "Seguimiento en tiempo real de tu stock, categorías de productos y alertas automáticas de bajo inventario.",
  },
  {
    iconType: 'users' as const,
    title: "Gestión de Usuarios",
    description:
      "Sistema multi-rol con permisos personalizados para propietarios, gerentes y empleados.",
  },
  {
    iconType: 'analytics' as const,
    title: "Reportes y Analíticas",
    description:
      "Reportes detallados de ventas, inventario y rendimiento del negocio con exportación a CSV y PDF.",
  },
  {
    iconType: 'security' as const,
    title: "Seguridad Avanzada",
    description:
      "Autenticación JWT, encriptación de datos y registros de auditoría completos para todas las transacciones.",
  },
  {
    iconType: 'mobile' as const,
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
