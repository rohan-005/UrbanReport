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
      className={`rounded-sm bg-white border ${
        active ? 'border-zinc-950 shadow-md ring-1 ring-zinc-950' : 'border-[#e2e0d8] shadow-sm'
      } ${
        hoverable ? 'hover:border-zinc-400 hover:shadow-md transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
