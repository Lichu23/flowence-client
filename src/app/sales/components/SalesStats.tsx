/**
 * SalesStats Component
 * Displays sales statistics cards
 */

interface SalesStatsProps {
  totalSales: number;
  stats: {
    totalRevenue: number;
    totalSales: number;
    completedSales: number;
    cashSales: number;
    cardSales: number;
  };
  formatCurrency: (value: number) => string;
  hasFilters: boolean;
}

export function SalesStats({ totalSales, stats, formatCurrency, hasFilters }: SalesStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <div className="glass-card p-3 sm:p-4">
        <p className="text-xs text-foreground-muted mb-1">Total Ventas</p>
        <p className="text-xl sm:text-2xl font-bold text-foreground">
          {totalSales}
        </p>
        {hasFilters && (
          <p className="text-xs text-primary mt-1">
            ({stats.totalSales} en página)
          </p>
        )}
      </div>
      <div className="glass-card p-3 sm:p-4">
        <p className="text-xs text-foreground-muted mb-1">Ingresos Totales</p>
        <p className="text-xl sm:text-2xl font-bold text-success">
          {formatCurrency(stats.totalRevenue)}
        </p>
      </div>
      <div className="glass-card p-3 sm:p-4">
        <p className="text-xs text-foreground-muted mb-1">Efectivo</p>
        <p className="text-xl sm:text-2xl font-bold text-foreground">
          {stats.cashSales}
        </p>
      </div>
      <div className="glass-card p-3 sm:p-4">
        <p className="text-xs text-foreground-muted mb-1">Tarjeta</p>
        <p className="text-xl sm:text-2xl font-bold text-foreground">
          {stats.cardSales}
        </p>
      </div>
    </div>
  );
}
