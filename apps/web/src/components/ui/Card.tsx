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
      className={`rounded-md bg-white border ${
        active ? 'border-[#89a577] shadow-sm ring-1 ring-[#89a577]' : 'border-[#e2dfd7] shadow-xs'
      } ${
        hoverable ? 'hover:border-[#877b5f] hover:shadow-md transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

