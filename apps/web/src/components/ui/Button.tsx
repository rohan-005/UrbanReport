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
    'inline-flex items-center justify-center font-extrabold uppercase tracking-wider transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-zinc-950/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm shadow-sm';

  const variantClasses = {
    primary: 'bg-zinc-950 hover:bg-zinc-900 text-white border border-zinc-950 active:bg-black',
    secondary: 'bg-zinc-200 hover:bg-zinc-300 text-zinc-900 border border-zinc-300 active:bg-zinc-400',
    outline: 'bg-white hover:bg-zinc-100 text-zinc-900 border border-[#e2e0d8] hover:border-zinc-400',
    danger: 'bg-rose-700 hover:bg-rose-600 text-white border border-rose-800 active:bg-rose-900',
    ghost: 'bg-transparent hover:bg-zinc-200/60 text-zinc-700 hover:text-zinc-950 border border-transparent shadow-none',
    success: 'bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-800 active:bg-emerald-900',
  };

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-xs px-4 py-2 gap-2 min-h-[44px]',
    lg: 'text-sm px-5 py-2.5 gap-2.5 min-h-[48px]',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
