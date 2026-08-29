'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, AlertCircle, CameraOff } from 'lucide-react';

interface ComplaintImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  containerClassName?: string;
  height?: number | string;
  showEmptyState?: boolean;
}

export const ComplaintImage: React.FC<ComplaintImageProps> = ({
  src,
  alt = 'Complaint media evidence',
  className = 'w-full h-full object-cover',
  containerClassName = 'relative w-full overflow-hidden bg-[#f5f3ee]',
  height = '100%',
  showEmptyState = true,
}) => {
  const [loading, setLoading] = useState(Boolean(src));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) {
      setLoading(true);
      setHasError(false);
    } else {
      setLoading(false);
      setHasError(false);
    }
  }, [src]);

  // Empty state: no image attached
  if (!src && showEmptyState) {
    return (
      <div
        className={`${containerClassName} flex flex-col items-center justify-center border border-[#e2dfd7] rounded-xs text-[#877b5f] p-4 text-center select-none`}
        style={{ height }}
      >
        <div className="p-2.5 rounded-full bg-[#e2dfd7]/60 mb-2">
          <CameraOff className="w-5 h-5 text-[#877b5f]" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#5f604f]">No photo attached</span>
        <span className="text-[11px] text-[#6b7280] font-mono mt-0.5">Civic dossier record</span>
      </div>
    );
  }

  // Error state: request failed (404/CORS/network error)
  if (hasError) {
    return (
      <div
        className={`${containerClassName} flex flex-col items-center justify-center border border-[#e2dfd7] bg-[#f5f3ee] text-[#877b5f] p-4 text-center select-none`}
        style={{ height }}
      >
        <div className="p-2.5 rounded-full bg-amber-100/80 mb-2">
          <AlertCircle className="w-5 h-5 text-amber-700" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#3f4636]">Image unavailable</span>
        <span className="text-[11px] text-[#6b7280] font-mono mt-0.5">Unable to stream photo evidence</span>
      </div>
    );
  }

  return (
    <div className={containerClassName} style={{ height }}>
      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-[#e2dfd7] animate-pulse flex items-center justify-center z-10">
          <ImageIcon className="w-6 h-6 text-[#877b5f]/40 animate-bounce" />
        </div>
      )}

      {/* Actual Image */}
      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoading(false)}
          onError={() => {
            console.warn(`[UrbanReports Media Notice] Unable to load media resource: ${src}`);
            setLoading(false);
            setHasError(true);
          }}
          className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        />
      )}
    </div>
  );
};
