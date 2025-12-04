/**
 * SalesFilters Component
 * Search bar and filter dropdowns for sales
 */

interface SalesFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  method: "cash" | "card" | "mixed" | "";
  onMethodChange: (value: "cash" | "card" | "mixed" | "") => void;
  status: "completed" | "refunded" | "cancelled" | "pending" | "";
  onStatusChange: (value: "completed" | "refunded" | "cancelled" | "pending" | "") => void;
}

export function SalesFilters({
  searchTerm,
  onSearchChange,
  onSearch,
  method,
  onMethodChange,
  status,
  onStatusChange,
}: SalesFiltersProps) {
  return (
    <div className="glass-card p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Search */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">
            Buscar por Ticket/Código
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder="Número de recibo o código de barras"
              className="input-field flex-1 text-sm sm:text-base"
            />
            <button
              onClick={onSearch}
              className="px-3 py-2 md:px-6 md:py-3 text-sm md:text-base font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg md:rounded-xl shadow-purple hover:from-purple-700 hover:to-fuchsia-700 hover:shadow-purple-lg hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
            >
              Buscar
            </button>
          </div>
        </div>

        {/* Method Filter */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Método de Pago
          </label>
          <select
            value={method}
            onChange={(e) => onMethodChange(e.target.value as "cash" | "card" | "mixed" | "")}
            className="input-field w-full text-sm sm:text-base"
          >
            <option value="">Todos</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="mixed">Mixto</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">
            Estado
          </label>
          <select
            value={status}
            onChange={(e) =>
              onStatusChange(
                e.target.value as "completed" | "refunded" | "cancelled" | "pending" | ""
              )
            }
            className="input-field w-full text-sm sm:text-base"
          >
            <option value="">Todos</option>
            <option value="completed">Completado</option>
            <option value="refunded">Reintegrado</option>
            <option value="cancelled">Cancelado</option>
            <option value="pending">Pendiente</option>
          </select>
        </div>
      </div>
    </div>
  );
}
