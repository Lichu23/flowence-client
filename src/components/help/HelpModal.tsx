'use client';

/**
 * HelpModal Component - Context-sensitive help documentation
 */

import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface HelpSection {
  title: string;
  content: string;
  tips?: string[];
}

const helpContent: Record<string, HelpSection[]> = {
  '/dashboard': [
    {
      title: 'Panel de Control',
      content: 'El panel muestra un resumen de las estadísticas de tu tienda actual.',
      tips: [
        'Usa el selector de tiendas en la parte superior para cambiar entre tus tiendas',
        'Las tarjetas muestran métricas en tiempo real',
        'Los productos con stock bajo aparecen resaltados en naranja'
      ]
    },
    {
      title: 'Múltiples Tiendas',
      content: 'Si tienes más de una tienda, verás un resumen global de todas tus tiendas.',
      tips: [
        'Haz clic en cualquier tienda para ver sus detalles',
        'Cada tienda tiene inventario y ventas independientes'
      ]
    }
  ],
  '/products': [
    {
      title: 'Gestión de Inventario',
      content: 'Administra todos los productos de tu tienda actual.',
      tips: [
        'Usa el escáner de código de barras para búsqueda rápida',
        'Los filtros te ayudan a encontrar productos específicos',
        'El sistema de doble stock separa el depósito del piso de ventas'
      ]
    },
    {
      title: 'Sistema de Doble Stock',
      content: 'Cada producto tiene dos tipos de stock: Depósito (almacén) y Venta (piso de ventas).',
      tips: [
        'Propietarios: Pueden gestionar ambos stocks',
        'Empleados: Solo pueden reabastecer el stock de venta desde el depósito',
        'Las ventas descuentan automáticamente del stock de venta'
      ]
    }
  ],
  '/pos': [
    {
      title: 'Punto de Venta',
      content: 'Procesa ventas rápidamente usando el escáner o búsqueda manual.',
      tips: [
        'Escanea códigos de barras para agregar productos al carrito',
        'Ajusta cantidades directamente en el carrito',
        'El sistema valida el stock antes de completar la venta',
        'Acepta pagos en efectivo o tarjeta'
      ]
    },
    {
      title: 'Métodos de Pago',
      content: 'Soporta pagos en efectivo con cálculo automático de cambio y pagos con tarjeta vía Stripe.',
      tips: [
        'Para efectivo: Ingresa el monto recibido y el sistema calcula el cambio',
        'Para tarjeta: El cliente ingresa sus datos de forma segura',
        'Todos los pagos generan un recibo automáticamente'
      ]
    }
  ],
  '/sales': [
    {
      title: 'Historial de Ventas',
      content: 'Revisa todas las ventas realizadas en tu tienda.',
      tips: [
        'Filtra por fecha para encontrar ventas específicas',
        'Cada venta muestra el método de pago utilizado',
        'Puedes ver los detalles completos de cada venta'
      ]
    }
  ],
  '/stores': [
    {
      title: 'Gestión de Tiendas',
      content: 'Administra todas tus tiendas desde un solo lugar.',
      tips: [
        'Crea nuevas tiendas con el botón "Agregar Tienda"',
        'Configura moneda, impuestos y umbrales de stock para cada tienda',
        'Cada tienda puede tener su propio logo y configuración'
      ]
    }
  ],
  '/employees': [
    {
      title: 'Gestión de Empleados',
      content: 'Invita y administra empleados para tu tienda.',
      tips: [
        'Envía invitaciones por email a nuevos empleados',
        'Los empleados solo tienen acceso a su tienda asignada',
        'Los empleados pueden procesar ventas y gestionar stock de venta'
      ]
    }
  ]
};

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState(0);

  if (!isOpen) return null;

  const sections = helpContent[pathname] || [
    {
      title: 'Ayuda General',
      content: 'Bienvenido a Flowence. Usa el menú de navegación para acceder a las diferentes secciones.',
      tips: [
        'Selecciona una tienda desde el selector en la parte superior',
        'Navega entre las secciones usando el menú',
        'Cada sección tiene su propia ayuda contextual'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-semibold">Centro de Ayuda</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-lg p-2 transition-colors"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Section Tabs */}
          {sections.length > 1 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {sections.map((section, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSection(index)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    activeSection === index
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          )}

          {/* Active Section Content */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {sections[activeSection].title}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {sections[activeSection].content}
              </p>
            </div>

            {sections[activeSection].tips && sections[activeSection].tips!.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Consejos Útiles
                </h4>
                <ul className="space-y-2">
                  {sections[activeSection].tips!.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                      <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Additional Help */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              ¿Necesitas más ayuda? Contacta a soporte en{' '}
              <a href="mailto:support@flowence.com" className="text-blue-600 hover:underline">
                support@flowence.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Help Button Component
export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-40"
        aria-label="Ayuda"
        title="Ayuda"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      <HelpModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
