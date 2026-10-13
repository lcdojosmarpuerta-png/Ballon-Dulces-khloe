import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Users, 
  Boxes, 
  Receipt, 
  BarChart3, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Layers,
  Clock,
  Share2,
  Copy,
  Check,
  Instagram,
  MessageCircle,
  ExternalLink,
  X,
  ShoppingBag,
  Database,
  MapPin,
  Phone,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { COMPANY_INFO, generateSocialMediaWhatsAppMessage } from '../data/companyInfo';
import { BrandLogo } from './BrandLogo';

interface HomeViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  clientsCount: number;
  inventoryCount: number;
  invoicesCount: number;
  bcvRate: number | null;
  totalIncomeUSD: number;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  clientsCount,
  inventoryCount,
  invoicesCount,
  bcvRate,
  totalIncomeUSD,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedData, setCopiedData] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('es-VE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentDateTime.toLocaleTimeString('es-VE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const socialLinks = [
    {
      name: 'Instagram Oficial',
      handle: COMPANY_INFO.instagram,
      url: COMPANY_INFO.instagramUrl,
      color: 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white',
      icon: Instagram,
      description: 'Fotos de decoraciones con globos, dulces finos y eventos',
    },
    {
      name: 'WhatsApp de Atención',
      handle: COMPANY_INFO.phoneFormatted,
      url: COMPANY_INFO.whatsappUrl,
      color: 'bg-emerald-600 text-white',
      icon: MessageCircle,
      description: 'Atención personalizada, pedidos y cotizaciones',
    },
    {
      name: 'TikTok',
      handle: COMPANY_INFO.tiktok,
      url: COMPANY_INFO.tiktokUrl,
      color: 'bg-stone-900 text-white',
      icon: Sparkles,
      description: 'Videos en vivo de montajes, fiestas y celebraciones',
    },
  ];

  const handleCopyAllSocials = () => {
    const shareText = generateSocialMediaWhatsAppMessage();
    navigator.clipboard.writeText(shareText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyCompanyData = () => {
    const text = `*${COMPANY_INFO.name}*\n• RIF: ${COMPANY_INFO.rif}\n• Teléfono: ${COMPANY_INFO.phoneFormatted}\n• Ubicación: ${COMPANY_INFO.address}\n• Slogan: "${COMPANY_INFO.slogan}"`;
    navigator.clipboard.writeText(text);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2500);
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        localStorage.setItem('bdk_custom_logo', result);
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Indicador de Fecha y Hora en Vivo */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-fuchsia-100 shadow-xs">
        <div className="flex items-center gap-2.5 text-stone-700">
          <div className="p-2 rounded-xl bg-red-50 text-red-600">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold capitalize block text-stone-800">
              {formattedDate}
            </span>
            <span className="text-[11px] text-fuchsia-800 font-mono font-bold">
              Hora local: {formattedTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCompanyData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-stone-200"
            title="Copiar datos de la empresa al portapapeles"
          >
            {copiedData ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-stone-500" />}
            <span>{copiedData ? '¡Datos Copiados!' : 'Copiar Datos RIF/Tlf'}</span>
          </button>

          <button
            onClick={() => setShowSocialModal(true)}
            id="btn-share-social-home"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-red-600 via-rose-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-fuchsia-200 transition-all cursor-pointer"
            title="Compartir redes sociales de la empresa"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Compartir Redes</span>
          </button>
        </div>
      </div>

      {/* Hero Welcome Card con paleta y ambientación del Logo Pastel Rainbow & Globos 3D */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-400 via-pink-400 to-amber-300 text-white p-8 md:p-12 shadow-2xl shadow-sky-200/50 border border-white/60">
        <div className="absolute -top-16 -right-16 w-96 h-96 rounded-full bg-white/25 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 rounded-full bg-pink-300/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-72 h-72 rounded-full bg-sky-200/30 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-xs font-black uppercase tracking-widest border border-white text-sky-700 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>Festejos & Decoraciones • Eventos Infantiles</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-script tracking-wide text-white drop-shadow-md">
              Emprendimiento Ballón Dulces khloe
            </h1>

            <p className="text-xl md:text-2xl font-light italic text-white/95 font-script drop-shadow-xs">
              "{COMPANY_INFO.slogan} • Detalles que marcan la diferencia"
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs text-slate-800 font-mono">
              <div className="flex items-center gap-2 bg-white/85 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white shadow-xs">
                <span className="font-extrabold text-sky-700">RIF:</span>
                <span className="font-bold text-slate-900">{COMPANY_INFO.rif}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/85 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white shadow-xs">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-extrabold text-emerald-700">Tlf:</span>
                <span className="font-bold text-slate-900">{COMPANY_INFO.phoneFormatted}</span>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2 bg-white/85 backdrop-blur-sm px-3.5 py-2 rounded-xl border border-white text-[11px] font-sans shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="truncate font-medium text-slate-800">{COMPANY_INFO.address}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('facturacion')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-sm shadow-lg shadow-sky-900/15 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <Receipt className="w-4 h-4 text-sky-600" />
                <span>Generar Factura / Ticket</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => setActiveTab('inventario')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-900/25 hover:bg-sky-900/35 text-white font-bold text-sm backdrop-blur-md border border-white/40 transition-all cursor-pointer"
              >
                <Boxes className="w-4 h-4" />
                <span>Ver Inventario</span>
              </button>
            </div>
          </div>

          {/* Logo Showcase with Ambient Glow and Custom Logo Uploader */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white/90 backdrop-blur-md border border-white shadow-xl shrink-0 self-center">
            <BrandLogo size="xl" className="filter drop-shadow-md" />
            <span className="text-xs font-extrabold text-slate-900 mt-3 text-center">
              Logo Oficial de la Marca
            </span>
            <span className="text-[10px] text-slate-500 text-center max-w-[200px] font-medium">
              Arcoíris pastel, globos perlados 3D y nube esponjosa
            </span>

            <label className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold cursor-pointer transition-colors border border-sky-200">
              <Upload className="w-3 h-3 text-sky-600" />
              <span>Cambiar Imagen Logo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadLogo}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/95 backdrop-blur-xs p-5 rounded-2xl border border-sky-100 shadow-xs hover:border-sky-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Clientes Registrados
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">
            {clientsCount}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-500" />
            Directorio activo
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xs p-5 rounded-2xl border border-pink-100 shadow-xs hover:border-pink-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Artículos en Stock
            </span>
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">
            {inventoryCount}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-pink-500" />
            Mobiliario y decoración
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xs p-5 rounded-2xl border border-purple-100 shadow-xs hover:border-purple-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Documentos Emitidos
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">
            {invoicesCount}
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
            Facturas y ticket fiscal
          </p>
        </div>

        <div className="bg-white/95 backdrop-blur-xs p-5 rounded-2xl border border-amber-100 shadow-xs hover:border-amber-300 hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Ingresos Totales ($)
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 font-mono">
            ${totalIncomeUSD.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ≈ {bcvRate ? `${(totalIncomeUSD * bcvRate).toLocaleString('es-VE', { maximumFractionDigits: 2 })} Bs` : 'Calculando Bs'}
          </p>
        </div>
      </div>

      {/* Module Shortcuts Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
          <span>Módulos de Gestión</span>
          <span className="text-xs font-normal text-stone-400">
            Acceso rápido a las funciones operativas
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Módulo 1 */}
          <div
            onClick={() => setActiveTab('clientes')}
            className="p-6 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-sky-50 text-sky-600 group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:to-cyan-500 group-hover:text-white transition-all shadow-xs">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors flex items-center justify-between">
                  <span>Registro de Clientes & Redes</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Directorio con Cédula/RIF, teléfonos y botón para enviar las redes sociales de la empresa por WhatsApp.
                </p>
              </div>
            </div>
          </div>

          {/* Módulo 2 */}
          <div
            onClick={() => setActiveTab('inventario')}
            className="p-6 rounded-2xl bg-white border border-pink-100 hover:border-pink-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-pink-50 text-pink-600 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-rose-500 group-hover:text-white transition-all shadow-xs">
                <Boxes className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800 group-hover:text-pink-600 transition-colors flex items-center justify-between">
                  <span>Carga de Inventario</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Control de stock físico de mobiliario, decoración, pasapalos y comestibles con fotos y precios.
                </p>
              </div>
            </div>
          </div>

          {/* Módulo 3 */}
          <div
            onClick={() => setActiveTab('facturacion')}
            className="p-6 rounded-2xl bg-white border border-purple-100 hover:border-purple-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-sky-50 to-pink-50 text-sky-600 group-hover:bg-gradient-to-r group-hover:from-sky-500 group-hover:to-pink-500 group-hover:text-white transition-all shadow-xs">
                <Receipt className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors flex items-center justify-between">
                  <span>Generar Factura (Fiscal & Ticket)</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Botón único "Generar Factura" que guarda e imprime automáticamente. Opciones de Factura Carta Horizontal y Ticket para Impresora Fiscal Láser.
                </p>
              </div>
            </div>
          </div>

          {/* Módulo 4 */}
          <div
            onClick={() => setActiveTab('mensajes')}
            className="p-6 rounded-2xl bg-white border border-emerald-100 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-500 group-hover:text-white transition-all shadow-xs">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                  <span>WhatsApp & QR Pago Móvil (BNC)</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Datos de Pago Móvil actualizados: Banco Nacional de Crédito (0191), 0414-5057120, RIF J-508536371 con código QR dinámico.
                </p>
              </div>
            </div>
          </div>

          {/* Módulo 5 */}
          <div
            onClick={() => setActiveTab('catalogo')}
            className="p-6 rounded-2xl bg-white border border-amber-100 hover:border-amber-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-600 group-hover:bg-gradient-to-r group-hover:from-amber-400 group-hover:to-pink-500 group-hover:text-white transition-all shadow-xs">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800 group-hover:text-amber-700 transition-colors flex items-center justify-between">
                  <span>Catálogo & Cotizador</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Portafolio digital para presupuestar fiestas con montos en USD y Bs BCV para clientes.
                </p>
              </div>
            </div>
          </div>

          {/* Módulo 6 */}
          <div
            onClick={() => setActiveTab('reportes')}
            className="p-6 rounded-2xl bg-white border border-fuchsia-100 hover:border-fuchsia-300 shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-fuchsia-50 text-fuchsia-700 group-hover:bg-gradient-to-r group-hover:from-fuchsia-700 group-hover:to-red-600 group-hover:text-white transition-all shadow-xs">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-stone-800 group-hover:text-fuchsia-700 transition-colors flex items-center justify-between">
                  <span>Reportes e Indicadores</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Historial de ventas, totales mensuales y exportación directa de todas las facturas a Excel (.xlsx).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: COMPARTIR REDES SOCIALES */}
      {showSocialModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-fuchsia-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-fuchsia-100">
              <div className="flex items-center gap-2.5">
                <BrandLogo size="sm" />
                <div>
                  <h3 className="font-bold text-stone-900 text-base leading-tight">
                    Redes Sociales Oficiales
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {COMPANY_INFO.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSocialModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {socialLinks.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 flex items-center justify-between gap-3 hover:bg-stone-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${s.color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">{s.name}</h4>
                        <p className="text-[11px] font-mono font-semibold text-fuchsia-800">{s.handle}</p>
                      </div>
                    </div>

                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-white hover:bg-fuchsia-50 text-fuchsia-950 border border-fuchsia-200 rounded-xl text-xs font-semibold flex items-center gap-1 shadow-2xs transition-colors shrink-0"
                    >
                      <span>Abrir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleCopyAllSocials}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-red-600 via-rose-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? '¡Mensaje Copiado con Éxito!' : 'Copiar Mensaje Completo para WhatsApp'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
