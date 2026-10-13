import React, { useState, useEffect } from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  variant?: 'card' | 'bare' | 'badge';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  variant = 'card',
}) => {
  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    return localStorage.getItem('bdk_custom_logo');
  });
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setCustomLogo(localStorage.getItem('bdk_custom_logo'));
      setHasError(false);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
    '2xl': 'w-44 h-44',
  };

  const containerStyles = {
    card: 'rounded-2xl shadow-lg shadow-sky-200/50 ring-2 ring-sky-300/60 bg-gradient-to-tr from-sky-100 via-pink-50 to-amber-50 p-1 transition-transform hover:scale-105',
    badge: 'rounded-xl shadow-xs ring-1 ring-sky-200 bg-white/95 p-0.5',
    bare: 'p-0 bg-transparent shadow-none ring-0',
  };

  const imageSrc = customLogo || '/assets/logo.svg';

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`relative ${sizeClasses[size]} shrink-0 overflow-hidden flex items-center justify-center ${containerStyles[variant]}`}
      >
        {!hasError ? (
          <img
            src={imageSrc}
            alt="Logo Emprendimiento Ballón Dulces khloe - Festejos y Decoraciones"
            className="w-full h-full object-contain filter drop-shadow-xs select-none"
            loading="eager"
            onError={() => {
              // Si falla /assets/logo.svg, probar fallback
              setHasError(true);
            }}
          />
        ) : (
          /* Emblema vectorial SVG de respaldo en caso de desconexión o fallo */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-sky-400 via-pink-400 to-amber-300 rounded-xl text-white p-1">
            <span className="text-[10px] leading-none">👑</span>
            <span className="text-[8px] font-black tracking-tight leading-none uppercase mt-0.5 font-script">
              Ballón
            </span>
          </div>
        )}
      </div>

      {showSubtitle && (
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 leading-none flex items-center gap-1">
            <span>✨</span> Emprendimiento
          </span>
          <span className="text-lg md:text-xl font-bold font-script bg-gradient-to-r from-pink-500 via-sky-500 to-amber-500 bg-clip-text text-transparent leading-tight truncate">
            Ballón Dulces khloe
          </span>
          <span className="text-[10.5px] text-pink-600 font-script font-semibold hidden sm:block">
            "Festejos y Decoraciones"
          </span>
        </div>
      )}
    </div>
  );
};
