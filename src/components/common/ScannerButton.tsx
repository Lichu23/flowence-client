'use client';

/**
 * ScannerButton Component  
 * Simple button to trigger scanner modal from anywhere in the app
 */

import { FC, ReactNode } from 'react';
import { Camera } from 'lucide-react';

interface ScannerButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  children?: ReactNode;
}

const ScannerButton: FC<ScannerButtonProps> = ({
  onClick,
  className = '',
  size = 'md',
  variant = 'primary',
  disabled = false,
  children
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'bg-transparent text-primary border border-primary hover:bg-primary/10 focus-contrast'
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium
        hover-contrast active-contrast focus-contrast transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      <Camera size={iconSize} className={children ? 'mr-2' : ''} />
      {children || 'Scan'}
    </button>
  );
};

export default ScannerButton;
