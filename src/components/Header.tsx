import React from 'react';
import { Phone } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { COMPANY_INFO } from '../data/companyInfo';

interface HeaderProps {
  bcvRate: number | null;
  loadingRate: boolean;
  onRefreshRate: () => void;
  activeModule: string;
}

export const Header: React.FC<HeaderProps> = ({
  bcvRate,
  loadingRate,
  onRefreshRate,
}) => {
  return (
    <header className="no-print bg-white/95 backdrop-blur-md border-b border-sky-100 sticky top-0 z-30 px-4 md:px-8 py-2.5 transition-all shadow-xs">
      <div className="flex items-center justify-between gap-3">
        {/* Identidad de Marca */}
        <div className="flex items-center gap-3 min-w-0">
          <BrandLogo size="sm" />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200 hidden sm:inline-block">
                👑 Emprendimiento
              </span>
              <h1 className="text-lg md:text-xl font-bold font-script bg-gradient-to-r from-pink-600 via-sky-600 to-amber-600 bg-clip-text text-transparent tracking-wide leading-tight truncate">
                Ballón Dulces khloe
              </h1>
              <span className="text-xs text-pink-600 font-script font-bold hidden lg:inline">
                • Festejos y Decoraciones
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
              <span className="font-bold text-sky-700">RIF: {COMPANY_INFO.rif}</span>
              <span className="hidden md:inline text-slate-300">•</span>
              <span className="hidden md:flex items-center gap-1 text-slate-600">
                <Phone className="w-2.5 h-2.5 text-emerald-500" />
                {COMPANY_INFO.phoneFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Tasa Oficial BCV */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="bg-white border border-fuchsia-100 rounded-xl px-2.5 sm:px-3 py-1 flex items-center gap-2 shadow-xs">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider font-semibold text-fuchsia-500 block leading-tight">
                Tasa BCV
              </span>
              <span className="text-xs sm:text-sm font-bold text-stone-800 font-mono leading-tight">
                {loadingRate ? (
                  <span className="text-stone-400 animate-pulse">...</span>
                ) : bcvRate ? (
                  `${bcvRate.toFixed(2)} Bs`
                ) : (
                  '36.50 Bs'
                )}
              </span>
            </div>
            <button
              onClick={onRefreshRate}
              disabled={loadingRate}
              title="Actualizar tasa oficial BCV"
              className="p-1 rounded-lg text-stone-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 transition-colors cursor-pointer"
            >
              <svg
                className={`w-3.5 h-3.5 ${loadingRate ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
