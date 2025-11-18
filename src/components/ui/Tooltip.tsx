'use client';

/**
 * Tooltip Component - Helpful hints for users
 */

import { ReactNode, useState } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top',
  className = '' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-card',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-card',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-card',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-card'
  };

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none animate-fade-in`}
          role="tooltip"
        >
          <div className="bg-card backdrop-blur-md border border-border text-foreground text-xs rounded-lg py-1.5 px-3 max-w-xs whitespace-nowrap shadow-lg-ambient shadow-lg-direct">
            {content}
            <div
              className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
