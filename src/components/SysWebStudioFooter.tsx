import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Sparkles } from 'lucide-react';

export const SysWebStudioFooter: React.FC = () => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <footer className="no-print w-full bg-gradient-to-r from-slate-950 via-[#0a1e38] to-slate-950 text-white border-t-2 border-cyan-500/40 py-3.5 px-4 md:px-8 mt-auto shadow-2xl relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Logo oficial y autoría */}
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Logo S&S Web Studio con soporte SVG directo */}
          <div className="bg-white rounded-xl p-1.5 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/50 shrink-0 flex items-center justify-center transition-transform hover:scale-105">
            {!imgFailed ? (
              <img
                src="/assets/sys-web-studio.svg"
                alt="Logo S&S Web Studio - Ideas que conectan tu negocio al mundo"
                className="h-9 sm:h-11 w-auto object-contain select-none"
                onError={() => setImgFailed(true)}
              />
            ) : (
              /* Vector SVG idéntico de alta resolución embebido directamente */
              <svg
                viewBox="0 0 520 280"
                className="h-9 sm:h-11 w-auto select-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Circuitos Izquierda */}
                <g stroke="#00a8cc" strokeWidth="4" strokeLinecap="round" fill="none">
                  <line x1="120" y1="85" x2="180" y2="85" />
                  <circle cx="120" cy="85" r="5" fill="#00a8cc" stroke="none" />
                  <line x1="100" y1="105" x2="175" y2="105" />
                  <circle cx="100" cy="105" r="4.5" fill="#00a8cc" stroke="none" />
                  <line x1="130" y1="125" x2="190" y2="125" />
                  <circle cx="130" cy="125" r="5.5" fill="#00a8cc" stroke="none" />
                  <line x1="115" y1="145" x2="195" y2="145" />
                  <circle cx="115" cy="145" r="5.5" fill="#00a8cc" stroke="none" />
                  <line x1="135" y1="165" x2="205" y2="165" />
                  <circle cx="135" cy="165" r="4.5" fill="#00a8cc" stroke="none" />
                </g>

                {/* Circuitos Derecha */}
                <g stroke="#00a8cc" strokeWidth="4" strokeLinecap="round" fill="none">
                  <line x1="370" y1="85" x2="400" y2="85" />
                  <circle cx="400" cy="85" r="5" fill="#00a8cc" stroke="none" />
                  <line x1="365" y1="105" x2="425" y2="105" />
                  <circle cx="425" cy="105" r="5.5" stroke="#00a8cc" strokeWidth="3" fill="#ffffff" />
                  <line x1="375" y1="125" x2="395" y2="125" />
                  <circle cx="395" cy="125" r="4.5" fill="#00a8cc" stroke="none" />
                  <line x1="370" y1="145" x2="410" y2="145" />
                  <circle cx="410" cy="145" r="5" fill="#00a8cc" stroke="none" />
                  <line x1="360" y1="165" x2="400" y2="165" />
                  <circle cx="400" cy="165" r="5.5" fill="#00a8cc" stroke="none" />
                </g>

                {/* Letras S&S */}
                <text
                  x="200"
                  y="160"
                  fill="#0f2e59"
                  fontFamily="Montserrat, system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="130"
                  textAnchor="middle"
                >
                  S
                </text>
                <text
                  x="260"
                  y="160"
                  fill="#0f2e59"
                  fontFamily="Montserrat, system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="135"
                  textAnchor="middle"
                >
                  &amp;
                </text>
                <text
                  x="330"
                  y="160"
                  fill="#00a8cc"
                  fontFamily="Montserrat, system-ui, sans-serif"
                  fontWeight="900"
                  fontSize="130"
                  textAnchor="middle"
                >
                  S
                </text>

                {/* WEB STUDIO */}
                <text
                  x="260"
                  y="218"
                  fill="#0f2e59"
                  fontFamily="Montserrat, system-ui, sans-serif"
                  fontWeight="800"
                  fontSize="42"
                  letterSpacing="3"
                  textAnchor="middle"
                >
                  WEB STUDIO
                </text>

                {/* Tagline */}
                <text
                  x="260"
                  y="250"
                  fill="#0f2e59"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontWeight="500"
                  fontSize="17"
                  textAnchor="middle"
                >
                  Ideas que conectan tu negocio al mundo.
                </text>
              </svg>
            )}
          </div>

          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-slate-300 font-medium">
                Este sitio web fue diseñado y creado por
              </span>
              <strong className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-sky-200 bg-clip-text text-transparent tracking-wide">
                S&S Web Studio
              </strong>
            </div>
            <p className="text-[10.5px] text-cyan-200/80 italic font-sans flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>"Ideas que conectan tu negocio al mundo."</span>
            </p>
          </div>
        </div>

        {/* Ubicación, Teléfono y Botones de Contacto */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 sm:gap-3 text-xs">
          {/* Ubicación: Barinas, Venezuela */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-slate-200 shadow-2xs font-medium">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Barinas, Venezuela</span>
          </div>

          {/* Teléfono / WhatsApp: 0424-5104245 */}
          <a
            href="https://wa.me/584245104245?text=Hola%20S%26S%20Web%20Studio%2C%20vi%20su%20desarrollo%20web%20para%20Ball%C3%B3n%20Dulces%20khloe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-md shadow-emerald-950/40 transition-all hover:scale-102 cursor-pointer"
            title="Contactar a S&S Web Studio vía WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-mono">0424-5104245</span>
          </a>

          {/* Llamada directa */}
          <a
            href="tel:04245104245"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-200 hover:text-white rounded-xl font-semibold transition-colors cursor-pointer"
            title="Llamar a S&S Web Studio"
          >
            <Phone className="w-3 h-3 text-cyan-300 shrink-0" />
            <span className="hidden sm:inline">Llamar</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
