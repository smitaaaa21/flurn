'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

const variantClasses = {
  default: 'bg-brand-500 text-white hover:bg-brand-400',
  outline: 'border border-white/10 bg-white/5 text-white hover:bg-white/10',
  ghost: 'bg-transparent text-slate-100 hover:bg-white/5'
};

const sizeClasses = {
  default: 'h-11 px-5 py-3',
  sm: 'h-9 px-4 rounded-lg',
  lg: 'h-12 px-6 rounded-2xl'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-50 disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
