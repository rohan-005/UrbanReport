import React from 'react';
import Link from 'next/link';

export interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  href?: string;
  variant?: 'dark' | 'light';
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
  href = '/',
  variant = 'dark',
}) => {
  const sizeMap = {
    sm: { emblem: 'w-7 h-7 text-xs', text: 'text-sm tracking-wider', tagline: 'text-[9px]' },
    md: { emblem: 'w-9 h-9 text-sm', text: 'text-base tracking-widest', tagline: 'text-[10px]' },
    lg: { emblem: 'w-11 h-11 text-base', text: 'text-xl tracking-widest', tagline: 'text-xs' },
    xl: { emblem: 'w-14 h-14 text-xl', text: 'text-2xl tracking-widest', tagline: 'text-xs' },
  };

  const current = sizeMap[size];
  const isLight = variant === 'light';

  const content = (
    <div className={`inline-flex items-center gap-3 group cursor-pointer ${className}`}>
      <div
        className={`${current.emblem} ${
          isLight
            ? 'bg-white text-zinc-950 border-white'
            : 'bg-zinc-950 text-white border-zinc-950'
        } font-black flex items-center justify-center rounded-sm border shadow-sm transition-transform duration-200 group-hover:scale-[1.04]`}
      >
        <span>UR</span>
      </div>
      <div className="flex flex-col">
        <span
          className={`${current.text} font-black uppercase leading-none tracking-widest ${
            isLight ? 'text-white' : 'text-zinc-950'
          }`}
        >
          Urban<span className={isLight ? 'text-zinc-400 font-bold' : 'text-zinc-500 font-bold'}>Reports</span>
        </span>
        {showTagline && (
          <span
            className={`${current.tagline} font-extrabold tracking-wider uppercase mt-1 ${
              isLight ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            Report. Track. Improve.
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
