import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  active?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  active = false,
  ...props
}) => {
  return (
    <div
      className={`rounded-xl bg-slate-800/80 border ${
        active ? 'border-sky-500 shadow-md shadow-sky-500/10' : 'border-slate-700/70'
      } ${
        hoverable ? 'hover:border-slate-500 hover:shadow-lg hover:shadow-slate-900/40 transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
