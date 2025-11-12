import { useState, useCallback } from 'react';

export interface PrintJobStatus {
  jobId: string;
  status: 'pending' | 'printing' | 'completed' | 'failed';
  message?: string;
  error?: string;
}

export function usePrintStatus() {
  const [printJobs, setPrintJobs] = useState<Map<string, PrintJobStatus>>(new Map());
  const [isPolling, setIsPolling] = useState(false);

  /**
   * Add a new print job to track
   */
  const trackPrintJob = useCallback((jobId: string) => {
    setPrintJobs(prev => new Map(prev).set(jobId, {
      jobId,
      status: 'pending',
      message: 'Enviando a imprimir...'
    }));
  }, []);

  /**
   * Update print job status
   */
  const updateJobStatus = useCallback((jobId: string, status: PrintJobStatus) => {
    setPrintJobs(prev => new Map(prev).set(jobId, status));
  }, []);

  /**
   * Get print job status
   */
  const getJobStatus = useCallback((jobId: string): PrintJobStatus | undefined => {
    return printJobs.get(jobId);
  }, [printJobs]);

  /**
   * Check if job is completed
   */
  const isJobCompleted = useCallback((jobId: string): boolean => {
    const job = printJobs.get(jobId);
    return job?.status === 'completed';
  }, [printJobs]);

  /**
   * Check if job failed
   */
  const isJobFailed = useCallback((jobId: string): boolean => {
    const job = printJobs.get(jobId);
    return job?.status === 'failed';
  }, [printJobs]);

  /**
   * Clear completed jobs
   */
  const clearCompletedJobs = useCallback(() => {
    setPrintJobs(prev => {
      const updated = new Map(prev);
      for (const [key, value] of updated.entries()) {
        if (value.status === 'completed') {
          updated.delete(key);
        }
      }
      return updated;
    });
  }, []);

  /**
   * Retry failed job
   */
  const retryFailedJob = useCallback((jobId: string) => {
    setPrintJobs(prev => {
      const updated = new Map(prev);
      const job = updated.get(jobId);
      if (job) {
        updated.set(jobId, {
          ...job,
          status: 'pending',
          message: 'Reintentando...',
          error: undefined
        });
      }
      return updated;
    });
  }, []);

  /**
   * Get all failed jobs
   */
  const getFailedJobs = useCallback((): PrintJobStatus[] => {
    return Array.from(printJobs.values()).filter(job => job.status === 'failed');
  }, [printJobs]);

  /**
   * Get all pending jobs
   */
  const getPendingJobs = useCallback((): PrintJobStatus[] => {
    return Array.from(printJobs.values()).filter(job => job.status === 'pending' || job.status === 'printing');
  }, [printJobs]);

  return {
    printJobs,
    trackPrintJob,
    updateJobStatus,
    getJobStatus,
    isJobCompleted,
    isJobFailed,
    clearCompletedJobs,
    retryFailedJob,
    getFailedJobs,
    getPendingJobs,
    isPolling,
    setIsPolling
  };
}
