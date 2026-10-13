import React from 'react';
import { 
  Home, 
  Users, 
  Boxes, 
  Receipt, 
  BarChart3, 
  MessageCircle, 
  ShoppingBag, 
  Database,
  MapPin,
  Phone,
  FileText
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { COMPANY_INFO } from '../data/companyInfo';

export type ActiveTab = 
  | 'inicio' 
  | 'clientes' 
  | 'inventario' 
  | 'facturacion' 
  | 'mensajes' 
  | 'catalogo' 
  | 'reportes' 
  | 'respaldos';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const navItems = [
    {
      id: 'inicio' as ActiveTab,
      label: 'Inicio',
      description: 'Datos y métricas',
      icon: Home,
    },
    {
      id: 'clientes' as ActiveTab,
      label: 'Registro de Clientes',
      description: 'Directorio y redes WhatsApp',
      icon: Users,
    },
    {
      id: 'inventario' as ActiveTab,
      label: 'Carga de Inventario',
      description: 'Stock, precios y fotos',
      icon: Boxes,
    },
    {
      id: 'facturacion' as ActiveTab,
      label: 'Generar Factura',
      description: 'Emisión fiscal y ticket láser',
      icon: Receipt,
    },
    {
      id: 'mensajes' as ActiveTab,
      label: 'WhatsApp & QR Cobranzas',
      description: 'Plantillas y QR Pago Móvil',
      icon: MessageCircle,
    },
    {
      id: 'catalogo' as ActiveTab,
      label: 'Catálogo & Cotizador',
      description: 'Portafolio para clientes',
      icon: ShoppingBag,
    },
    {
      id: 'reportes' as ActiveTab,
      label: 'Reportes y Métricas',
      description: 'Historial y exportación Excel',
      icon: BarChart3,
    },
    {
      id: 'respaldos' as ActiveTab,
      label: 'Copias de Seguridad',
      description: 'Descarga index.html y JSON',
      icon: Database,
    },
  ];

  return (
    <aside className="no-print w-64 md:w-72 bg-white/95 backdrop-blur-md border-r border-sky-100 flex flex-col justify-between shrink-0 h-screen sticky top-0 shadow-lg shadow-sky-100/40 z-40 select-none">
      {/* Brand Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-sky-100 bg-gradient-to-r from-sky-50/60 via-pink-50/40 to-amber-50/40 flex items-center gap-3 shrink-0">
          <BrandLogo size="md" />
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 block leading-none flex items-center gap-1">
              <span>👑</span> Emprendimiento
            </span>
            <h2 className="text-base font-bold font-script bg-gradient-to-r from-pink-600 via-sky-600 to-amber-600 bg-clip-text text-transparent tracking-wide leading-tight truncate">
              Ballón Dulces khloe
            </h2>
            <span className="text-[10px] text-pink-600 font-script font-bold block truncate">
              "Festejos y Decoraciones"
            </span>
            <span className="text-[9.5px] font-mono font-semibold text-slate-500 block">
              RIF: {COMPANY_INFO.rif}
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1 pr-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-50 via-pink-50 to-amber-50/60 text-slate-900 font-semibold shadow-xs border border-sky-200'
                    : 'text-slate-600 hover:bg-sky-50/50 hover:text-sky-950'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-all shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 via-pink-500 to-amber-400 text-white shadow-xs shadow-sky-300'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate leading-tight">{item.label}</div>
                  <div className="text-[10px] text-slate-400 group-hover:text-sky-600/70 truncate font-normal leading-tight">
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-sky-400 via-pink-400 to-amber-400 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Company Identity Card */}
      <div className="p-3.5 border-t border-fuchsia-100 space-y-2 bg-gradient-to-b from-white to-fuchsia-50/30 text-stone-600">
        <div className="p-2.5 rounded-xl bg-white border border-fuchsia-100 shadow-xs space-y-1 text-[11px]">
          <div className="flex items-center gap-1.5 text-fuchsia-950 font-bold">
            <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span className="truncate">{COMPANY_INFO.address}</span>
          </div>
          <div className="flex items-center justify-between text-stone-500 font-mono text-[10px] pt-0.5 border-t border-stone-100">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-600" />
              {COMPANY_INFO.phoneFormatted}
            </span>
            <span className="font-semibold text-fuchsia-800">
              {COMPANY_INFO.rif}
            </span>
          </div>
        </div>

        <div className="text-center pt-0.5">
          <p className="text-[10px] text-stone-400">
            "Detalles que marcan la diferencia en tu fiesta"
          </p>
        </div>
      </div>
    </aside>
  );
};
