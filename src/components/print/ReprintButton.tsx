import React, { useState } from 'react';
import { useToast } from '@/components/ui/Toast';

interface ReprintButtonProps {
  saleId: string;
  receiptNumber: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
}

export const ReprintButton: React.FC<ReprintButtonProps> = ({
  receiptNumber,
  disabled = false,
  size = 'md',
  variant = 'secondary'
}) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleReprint = async () => {
    setLoading(true);
    try {
      // TODO: Implement reprint API call
      // const response = await printApi.reprintTicket(saleId);
      toast.success(`Reenviando ticket ${receiptNumber} a imprimir...`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al reimprimir';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-4 py-2.5 text-base';
      case 'md':
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400';
      case 'outline':
        return 'border border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50';
      case 'secondary':
      default:
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50';
    }
  };

  return (
    <button
      onClick={handleReprint}
      disabled={disabled || loading}
      className={`
        font-medium rounded transition-colors
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={`Reimprimir ticket ${receiptNumber}`}
    >
      {loading ? '⏳ Reenviando...' : '🖨️ Reimprimir'}
    </button>
  );
};
