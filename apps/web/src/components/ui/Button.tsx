import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89a577] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-md shadow-sm';

  const variantClasses = {
    primary: 'bg-[#89a577] hover:bg-[#728d61] text-white border border-[#89a577] active:bg-[#637c53]',
    secondary: 'bg-[#f5f3ee] hover:bg-[#e2dfd7] text-[#1f241d] border border-[#e2dfd7] active:bg-[#d8d4c9]',
    outline: 'bg-white hover:bg-[#f5f3ee] text-[#1f241d] border border-[#e2dfd7] hover:border-[#877b5f] active:bg-[#ebe7df]',
    danger: 'bg-rose-700 hover:bg-rose-800 text-white border border-rose-700 active:bg-rose-900',
    ghost: 'bg-transparent hover:bg-[#f5f3ee] text-[#877b5f] hover:text-[#1f241d] border border-transparent shadow-none',
    success: 'bg-[#89a577] hover:bg-[#728d61] text-white border border-[#89a577] active:bg-[#637c53]',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 h-8 min-h-[32px] gap-1.5',
    md: 'text-xs px-4 h-10 min-h-[40px] gap-2',
    lg: 'text-sm px-5 h-11 min-h-[44px] gap-2.5',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon
      )}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};

