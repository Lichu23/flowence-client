/**
 * ErrorMessage Component - Reusable error display
 */

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
}

export function ErrorMessage({ 
  title = 'Error',
  message, 
  onRetry,
  className = '',
  variant = 'error'
}: ErrorMessageProps) {
  const variantStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      title: 'text-red-800',
      text: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'text-orange-600',
      title: 'text-orange-800',
      text: 'text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      title: 'text-blue-800',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.bg} border ${styles.border} rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <svg 
          className={`w-5 h-5 ${styles.icon} flex-shrink-0 mt-0.5`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${styles.title} mb-1`}>{title}</h3>
          <p className={`text-sm ${styles.text}`}>{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 px-4 py-2 text-sm font-medium text-white ${styles.button} rounded-lg transition-colors`}
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
