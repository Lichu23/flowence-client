import React, { useEffect } from 'react';
import { usePrintStatus } from '@/hooks/usePrintStatus';
import { PrintStatusIndicator } from './PrintStatusIndicator';

interface PrintQueueMonitorProps {
  onJobStatusChange?: (jobId: string, status: string) => void;
  maxVisibleJobs?: number;
}

export const PrintQueueMonitor: React.FC<PrintQueueMonitorProps> = ({
  onJobStatusChange,
  maxVisibleJobs = 3
}) => {
  const {
    printJobs,
    getFailedJobs,
    getPendingJobs,
    retryFailedJob,
    clearCompletedJobs
  } = usePrintStatus();

  const failedJobs = getFailedJobs();
  const pendingJobs = getPendingJobs();
  const allJobs = Array.from(printJobs.values());
  const visibleJobs = allJobs.slice(-maxVisibleJobs);

  useEffect(() => {
    // Notify parent of status changes
    allJobs.forEach(job => {
      onJobStatusChange?.(job.jobId, job.status);
    });
  }, [allJobs, onJobStatusChange]);

  if (allJobs.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm space-y-2 z-40">
      {/* Failed jobs alert */}
      {failedJobs.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="font-semibold text-red-800 text-sm">
              ⚠️ {failedJobs.length} ticket(s) con error
            </div>
            <button
              onClick={() => failedJobs.forEach(job => retryFailedJob(job.jobId))}
              className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar todos
            </button>
          </div>
          <div className="text-xs text-red-700">
            {failedJobs.map(job => (
              <div key={job.jobId} className="flex justify-between items-center">
                <span>{job.error || 'Error desconocido'}</span>
                <button
                  onClick={() => retryFailedJob(job.jobId)}
                  className="text-red-600 hover:text-red-800 underline"
                >
                  Reintentar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pending jobs indicator */}
      {pendingJobs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
          <div className="text-xs text-blue-800 font-medium">
            ⏳ {pendingJobs.length} ticket(s) en proceso
          </div>
        </div>
      )}

      {/* Individual job status indicators */}
      {visibleJobs.map(job => (
        <PrintStatusIndicator
          key={job.jobId}
          job={job}
          onRetry={() => retryFailedJob(job.jobId)}
          onDismiss={() => clearCompletedJobs()}
        />
      ))}

      {/* Show more indicator */}
      {allJobs.length > maxVisibleJobs && (
        <div className="text-xs text-gray-600 text-center">
          +{allJobs.length - maxVisibleJobs} más
        </div>
      )}
    </div>
  );
};
