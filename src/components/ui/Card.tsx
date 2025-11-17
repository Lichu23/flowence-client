/**
 * Card Component - Reusable card container with glass morphism
 */

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  variant?: 'glass' | 'solid';
}

export function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
  variant = 'glass'
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  const baseClasses = variant === 'glass'
    ? 'glass-card'
    : 'bg-card border border-border rounded-2xl shadow-lg-ambient shadow-lg-direct transition-all hover:bg-card-hover hover:border-border-light hover:shadow-xl-ambient hover:shadow-xl-direct';

  return (
    <div
      className={`${baseClasses} ${paddingClasses[padding]} ${!hover && variant === 'glass' ? '[&:hover]:bg-card [&:hover]:border-border [&:hover]:shadow-lg-ambient [&:hover]:shadow-lg-direct' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div className="flex-1 min-w-0">
        <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-foreground-muted mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="ml-4 flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-border ${className}`}>
      {children}
    </div>
  );
}
