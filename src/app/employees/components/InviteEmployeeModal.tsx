import { FC, FormEvent, useState } from 'react';
import type { StoreListItem } from '@/types';

interface InviteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, storeId: string) => Promise<void>;
  stores: StoreListItem[];
  currentStoreId: string;
}

export const InviteEmployeeModal: FC<InviteEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  stores,
  currentStoreId,
}) => {
  const [email, setEmail] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState(currentStoreId);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!selectedStoreId) {
      setError('Por favor selecciona una tienda');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await onSuccess(email, selectedStoreId);
      // Reset form on success
      setEmail('');
      setSelectedStoreId(currentStoreId);
      setError('');
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar invitación';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSelectedStoreId(currentStoreId);
    setError('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="glass-card max-w-md w-full p-4 sm:p-6 my-4 sm:my-8 max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-5">
          <h3 className="text-lg sm:text-xl font-bold text-foreground">
            Invitar Empleado
          </h3>
          <button
            onClick={handleClose}
            className="text-foreground-subtle hover:text-foreground p-1 hover:bg-card rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Tienda *
            </label>
            <select
              required
              value={selectedStoreId}
              onChange={(e) => setSelectedStoreId(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecciona una tienda</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                  {store.address && ` - ${store.address}`}
                </option>
              ))}
            </select>
            <p className="text-xs text-foreground-subtle mt-1.5">
              El empleado será asignado a esta tienda específica
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email del Empleado *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base bg-card text-foreground border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="empleado@example.com"
            />
            <p className="text-xs text-foreground-subtle mt-1.5">
              Se enviará una invitación a este email
            </p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-3 py-2 rounded-lg text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base border border-border text-foreground rounded-lg font-medium hover:bg-card-hover transition-colors active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 sm:py-2 text-sm sm:text-base btn-primary rounded-lg font-medium transition-colors disabled:opacity-50 active:scale-95"
            >
              {loading ? "Enviando..." : "Enviar Invitación"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
