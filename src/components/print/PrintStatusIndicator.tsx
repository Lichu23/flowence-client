import { FC } from 'react';
import { PrintJobStatus } from '@/hooks/usePrintStatus';

interface PrintStatusIndicatorProps {
  job: PrintJobStatus;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const PrintStatusIndicator: FC<PrintStatusIndicatorProps> = ({
  job,
  onRetry,
  onDismiss
}) => {
  const getStatusColor = () => {
    switch (job.status) {
      case 'pending':
      case 'printing':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (job.status) {
      case 'pending':
      case 'printing':
        return '⏳';
      case 'completed':
        return '✓';
      case 'failed':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  const getStatusText = () => {
    switch (job.status) {
      case 'pending':
        return 'Pendiente de imprimir';
      case 'printing':
        return 'Imprimiendo...';
      case 'completed':
        return 'Impreso correctamente';
      case 'failed':
        return 'Error al imprimir';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <div className={`border rounded-lg p-3 flex items-center justify-between gap-3 ${getStatusColor()}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{getStatusIcon()}</span>
        <div>
          <div className="font-medium text-sm">{getStatusText()}</div>
          {job.message && <div className="text-xs opacity-75">{job.message}</div>}
          {job.error && <div className="text-xs opacity-75">Error: {job.error}</div>}
        </div>
      </div>
      <div className="flex gap-2">
        {job.status === 'failed' && onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        )}
        {job.status === 'completed' && onDismiss && (
          <button
            onClick={onDismiss}
            className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
};
