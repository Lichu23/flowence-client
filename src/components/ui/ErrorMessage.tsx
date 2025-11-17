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
      bg: 'bg-error/10',
      border: 'border-error/30',
      icon: 'text-error',
      title: 'text-foreground',
      text: 'text-foreground-muted',
      button: 'btn-primary'
    },
    warning: {
      bg: 'bg-warning/10',
      border: 'border-warning/30',
      icon: 'text-warning',
      title: 'text-foreground',
      text: 'text-foreground-muted',
      button: 'btn-primary'
    },
    info: {
      bg: 'bg-info/10',
      border: 'border-info/30',
      icon: 'text-info',
      title: 'text-foreground',
      text: 'text-foreground-muted',
      button: 'btn-primary'
    }
  };

  const styles = variantStyles[variant];

  return (
    <div className={`${styles.bg} backdrop-blur-sm border ${styles.border} rounded-xl p-4 ${className}`}>
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
              className={`mt-3 ${styles.button}`}
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
