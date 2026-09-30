import React, { useState } from 'react';
import { Building2, Home } from 'lucide-react';

interface PropertyImageProps {
  src?: string;
  alt: string;
  className?: string;
  aspectClass?: string;
  propertyType?: string;
}

export const PropertyImage: React.FC<PropertyImageProps> = ({
  src,
  alt,
  className = '',
  aspectClass = 'aspect-video',
  propertyType = 'Property',
}) => {
  const [hasError, setHasError] = useState(!src);

  if (hasError || !src) {
    return (
      <div
        className={`w-full ${aspectClass} bg-gradient-to-br from-slate-800 via-slate-900 to-indigo-950 flex flex-col items-center justify-center text-slate-400 p-4 relative overflow-hidden select-none ${className}`}
      >
        {/* Subtle geometric architectural pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:12px_12px]" />
        
        <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-indigo-300 shadow-inner">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-300 tracking-tight line-clamp-1">{alt}</span>
          <span className="text-[9px] uppercase tracking-widest text-indigo-400 font-bold">{propertyType}</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`w-full ${aspectClass} object-cover ${className}`}
    />
  );
};
