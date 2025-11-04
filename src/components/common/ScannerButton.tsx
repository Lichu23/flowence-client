'use client';

/**
 * ScannerButton Component  
 * Simple button to trigger scanner modal from anywhere in the app
 */

import React from 'react';
import { Camera } from 'lucide-react';

interface ScannerButtonProps {
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  children?: React.ReactNode;
}

const ScannerButton: React.FC<ScannerButtonProps> = ({
  onClick,
  className = '',
  size = 'md',
  variant = 'primary',
  disabled = false,
  children
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  };

  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 20 : 18;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center rounded-lg font-medium 
        focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
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
