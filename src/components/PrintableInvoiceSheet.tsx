import React, { useState } from 'react';
import { Scissors, FileText, CheckCircle, ShieldCheck, Printer } from 'lucide-react';
import { DocumentType, InvoiceItem, InvoiceStatus } from '../types';
import { printInvoiceElement } from '../lib/printUtils';
import { COMPANY_INFO } from '../data/companyInfo';
import { BrandLogo } from './BrandLogo';

export interface PrintableInvoiceData {
  documentNumber: string;
  type: DocumentType;
  status: InvoiceStatus;
  paymentMethod?: string;
  issueDate: string;
  eventDate?: string;
  clientName: string;
  clientCedulaRif?: string;
  clientPhone: string;
  clientAddress?: string;
  items: InvoiceItem[];
  subtotalUSD: number;
  ivaRate: number; // 0 or 0.16
  ivaUSD: number;
  totalUSD: number;
  bcvRate: number;
  totalBs: number;
  notes?: string;
  issuerName?: string;
  issuerCedula?: string;
  issuerRole?: string;
}

interface PrintableInvoiceSheetProps {
  data: PrintableInvoiceData;
  id?: string;
  className?: string;
  onOpenPrintModal?: () => void;
}

export const PrintableInvoiceSheet: React.FC<PrintableInvoiceSheetProps> = ({
  data,
  id = 'printable-invoice-sheet',
  className = '',
  onOpenPrintModal,
}) => {
  const [activeViewSheet, setActiveViewSheet] = useState<'both' | 'front' | 'back'>('both');

  return (
    <div id={id} className={`space-y-4 ${className}`}>
      {/* Selector de Vista en Pantalla (No imprimible) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 p-2.5 bg-stone-100 rounded-xl border border-stone-200 text-xs">
        <div className="flex items-center gap-2 text-stone-700 font-medium">
          <FileText className="w-4 h-4 text-fuchsia-600" />
          <span>Vista de Factura (Formato Carta Horizontal):</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-stone-200">
            <button
              type="button"
              onClick={() => setActiveViewSheet('both')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeViewSheet === 'both'
                  ? 'bg-gradient-to-r from-red-600 to-fuchsia-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Ambas Hojas (Anverso y Reverso)
            </button>
            <button
              type="button"
              onClick={() => setActiveViewSheet('front')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeViewSheet === 'front'
                  ? 'bg-gradient-to-r from-red-600 to-fuchsia-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Hoja 1: Factura / Nota
            </button>
            <button
              type="button"
              onClick={() => setActiveViewSheet('back')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                activeViewSheet === 'back'
                  ? 'bg-gradient-to-r from-red-600 to-fuchsia-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Hoja 2: Términos (Reverso)
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (onOpenPrintModal) {
                onOpenPrintModal();
              } else {
                printInvoiceElement(id);
              }
            }}
            className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-102"
            title="Imprimir o descargar en formato Carta u opción Ticket Fiscal"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Descargar</span>
          </button>
        </div>
      </div>

      {/* PÁGINA 1: FACTURA / NOTA DE ENTREGA (ANVERSO) */}
      <div
        className={`print-page-front bg-white rounded-2xl border border-stone-300 p-4 shadow-sm flex flex-col md:flex-row justify-between items-stretch gap-3 text-stone-900 overflow-hidden ${
          activeViewSheet === 'back' ? 'hidden print:hidden' : 'flex print:flex'
        }`}
        style={{ minHeight: '560px' }}
      >
        {/* LADO 1: ORIGINAL */}
        <div className="print-half flex-1 flex flex-col justify-between p-4 border border-stone-300 rounded-xl bg-white">
          <InvoiceHalfTemplate versionTag="ORIGINAL" data={data} />
        </div>

        {/* DIVISOR CENTRAL CON LÍNEA PUNTEADA Y TIJERA DE CORTE */}
        <div className="print-divider flex md:flex-col items-center justify-center py-2 md:py-0 px-2 text-stone-400 select-none">
          <div className="flex-1 w-full border-b md:border-b-0 md:border-l border-dashed border-stone-400" />
          <div className="p-1.5 my-1 rounded-full bg-stone-100 border border-stone-300 text-stone-500 flex items-center gap-1 shrink-0">
            <Scissors className="w-3.5 h-3.5 rotate-90 md:rotate-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">
              Corte
            </span>
          </div>
          <div className="flex-1 w-full border-b md:border-b-0 md:border-l border-dashed border-stone-400" />
        </div>

        {/* LADO 2: COPIA */}
        <div className="print-half flex-1 flex flex-col justify-between p-4 border border-stone-300 rounded-xl bg-white">
          <InvoiceHalfTemplate versionTag="COPIA" data={data} />
        </div>
      </div>

      {/* PÁGINA 2: HOJA POSTERIOR / AL REVERSO (TÉRMINOS Y CONDICIONES - ORIGINAL Y COPIA) */}
      <div
        className={`print-page-back bg-white rounded-2xl border border-stone-300 p-4 shadow-sm flex flex-col md:flex-row justify-between items-stretch gap-3 text-stone-900 overflow-hidden ${
          activeViewSheet === 'front' ? 'hidden print:hidden' : 'flex print:flex'
        }`}
        style={{ minHeight: '560px' }}
      >
        <PrintableInvoiceReverseSheet data={data} />
      </div>
    </div>
  );
};

interface InvoiceHalfTemplateProps {
  versionTag: 'ORIGINAL' | 'COPIA';
  data: PrintableInvoiceData;
}

export const InvoiceHalfTemplate: React.FC<InvoiceHalfTemplateProps> = ({
  versionTag,
  data,
}) => {
  const {
    documentNumber,
    type,
    status,
    paymentMethod,
    issueDate,
    eventDate,
    clientName,
    clientCedulaRif,
    clientPhone,
    clientAddress,
    items,
    subtotalUSD,
    ivaRate,
    ivaUSD,
    totalUSD,
    bcvRate,
    totalBs,
    notes,
    issuerName,
    issuerCedula,
    issuerRole,
  } = data;

  const rate = bcvRate && bcvRate > 0 ? bcvRate : 36.5;

  return (
    <div className="w-full h-full flex flex-col justify-between text-xs leading-normal space-y-2.5">
      {/* Top Header - Con letra más grande y legible */}
      <div>
        <div className="flex items-start justify-between border-b-2 border-sky-200 pb-2.5">
          <div className="flex items-start gap-3">
            <BrandLogo size="md" variant="bare" />
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-bold font-script text-slate-900 tracking-wide">
                  {COMPANY_INFO.name}
                </h4>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                    versionTag === 'ORIGINAL'
                      ? 'bg-sky-50 text-sky-800 border-sky-300'
                      : 'bg-pink-50 text-pink-800 border-pink-300'
                  }`}
                >
                  {versionTag}
                </span>
              </div>
              <p className="text-[11px] text-pink-600 font-script font-bold">
                "{COMPANY_INFO.slogan} • Detalles que marcan la diferencia"
              </p>
              <p className="text-[10.5px] font-mono text-slate-700 font-bold">
                RIF: {COMPANY_INFO.rif} • Tlf: {COMPANY_INFO.phoneFormatted}
              </p>
              <p className="text-[10px] text-slate-500 truncate max-w-[280px]">
                {COMPANY_INFO.address}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider block text-stone-700">
              {type}
            </span>
            <span className="text-sm font-mono font-black text-red-600 block">
              {documentNumber}
            </span>
            <span className="text-[10px] font-semibold text-stone-600 block">
              F. Emisión: {issueDate}
            </span>
            {eventDate && (
              <span className="text-[10px] font-bold text-fuchsia-950 block">
                F. Evento: {eventDate}
              </span>
            )}
            <span
              className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 ${
                status === 'Pagada'
                  ? 'bg-emerald-100 text-emerald-800'
                  : status === 'Abonada'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Client Info Banner - Tipografía grande y nítida */}
        <div className="mt-2.5 p-2.5 bg-stone-50 rounded-xl border border-stone-300 text-[13px] grid grid-cols-2 gap-2 leading-snug">
          <div>
            <span className="font-semibold text-stone-600">Cliente: </span>
            <span className="font-bold text-stone-950 text-sm">{clientName || 'Cliente sin registrar'}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-600">C.I / RIF: </span>
            <span className="font-mono font-bold text-stone-900">{clientCedulaRif || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-600">Teléfono: </span>
            <span className="font-mono font-bold text-stone-900">{clientPhone || 'N/A'}</span>
          </div>
          <div>
            <span className="font-semibold text-stone-600">Forma Pago: </span>
            <span className="font-bold text-red-600">{paymentMethod || 'Efectivo $'}</span>
          </div>
          <div className="col-span-2 truncate">
            <span className="font-semibold text-stone-600">Dirección: </span>
            <span className="text-stone-800 font-medium">{clientAddress || 'Entrega en tienda / Por coordinar'}</span>
          </div>
        </div>
      </div>

      {/* Items Table - Tipografía clara, grande y ampliada */}
      <div className="flex-1 my-1.5 overflow-hidden">
        <table className="w-full text-left border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b-2 border-stone-400 text-stone-800 font-bold uppercase text-[11px] bg-stone-100">
              <th className="py-2 px-2">Descripción / Servicio</th>
              <th className="py-2 px-2 text-center w-14">Cant</th>
              <th className="py-2 px-2 text-right w-20">P.U ($)</th>
              <th className="py-2 px-2 text-right w-20">Total ($)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-4 text-center text-stone-400 italic">
                  Sin ítems agregados
                </td>
              </tr>
            ) : (
              items.slice(0, 6).map((it) => (
                <tr key={it.id}>
                  <td className="py-2 px-2 text-stone-950 font-semibold truncate max-w-[170px]">
                    {it.name}
                  </td>
                  <td className="py-2 px-2 text-center font-mono font-bold text-stone-800 text-[13px]">
                    {it.quantity}
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-medium text-stone-800">
                    ${it.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-black text-stone-950 text-[13px]">
                    ${it.total.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bottom Notes & Financial Breakdown - Totales destacados */}
      <div className="border-t-2 border-stone-400 pt-2.5">
        <div className="grid grid-cols-2 gap-3">
          {/* Notes & Bank Details */}
          <div className="text-[11.5px] text-stone-700 space-y-1.5 leading-normal">
            {notes && (
              <p className="line-clamp-2">
                <strong className="text-stone-900 font-bold">Obs:</strong> {notes}
              </p>
            )}
            <p className="font-semibold text-stone-900 text-xs">
              Pago: <span className="text-red-700 font-bold">{paymentMethod || 'Efectivo $'}</span>
            </p>
            <div className="p-1.5 bg-amber-50/80 rounded border border-amber-200 text-[11px] font-mono font-semibold text-amber-950">
              Pago Móvil BNC: 0414-5057120 • RIF: J-508536371
            </div>
          </div>

          {/* Totals Box con letra aumentada */}
          <div className="text-xs sm:text-[13px] space-y-1 text-right font-mono">
            <div className="flex justify-between">
              <span className="text-stone-600 font-medium">Subtotal:</span>
              <span className="font-bold text-stone-900">${subtotalUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600 font-medium">
                IVA ({type === 'Nota de Entrega' || ivaRate === 0 ? '0% Exento' : '16%'}):
              </span>
              <span className="font-bold text-stone-900">${ivaUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-stone-300 pt-1 text-stone-950 font-bold text-base">
              <span>Total USD:</span>
              <span className="text-red-600 font-black">${totalUSD.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-stone-500 font-sans">
              <span>Tasa BCV:</span>
              <span className="font-mono">{rate.toFixed(2)} Bs/$</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-black text-stone-950 bg-fuchsia-50 px-2 py-1 rounded-lg border border-fuchsia-200">
              <span>Total Bs:</span>
              <span>
                {totalBs.toLocaleString('es-VE', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                Bs.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de Página de la Factura con Datos Completos del Facturador(a) */}
      <div className="border-t border-stone-200 pt-1 text-[10.5px] text-stone-600 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <span>👤 Facturador(a):</span>
          <strong className="text-stone-900 font-bold">{issuerName || 'Administración / Tienda'}</strong>
          {issuerCedula && <span className="font-mono text-stone-700 font-medium"> • C.I: {issuerCedula}</span>}
          {issuerRole && <span className="text-stone-500"> ({issuerRole})</span>}
        </span>
        <span className="italic font-medium text-pink-700">
          Términos y condiciones al reverso →
        </span>
      </div>
    </div>
  );
};

{/* =========================================================================
    HOJA POSTERIOR (AL REVERSO): TÉRMINOS Y CONDICIONES (ORIGINAL Y COPIA)
   ========================================================================= */}
export const PrintableInvoiceReverseSheet: React.FC<{ data: PrintableInvoiceData }> = ({
  data,
}) => {
  return (
    <>
      {/* LADO 1: TÉRMINOS ORIGINAL */}
      <div className="print-half flex-1 flex flex-col justify-between p-3.5 border border-stone-300 rounded-xl bg-white">
        <TermsHalfTemplate versionTag="ORIGINAL" data={data} />
      </div>

      {/* DIVISOR CENTRAL CON LÍNEA PUNTEADA Y TIJERA DE CORTE */}
      <div className="print-divider flex md:flex-col items-center justify-center py-2 md:py-0 px-2 text-stone-400 select-none">
        <div className="flex-1 w-full border-b md:border-b-0 md:border-l border-dashed border-stone-400" />
        <div className="p-1.5 my-1 rounded-full bg-stone-100 border border-stone-300 text-stone-500 flex items-center gap-1 shrink-0">
          <Scissors className="w-3.5 h-3.5 rotate-90 md:rotate-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider hidden md:inline">
            Corte
          </span>
        </div>
        <div className="flex-1 w-full border-b md:border-b-0 md:border-l border-dashed border-stone-400" />
      </div>

      {/* LADO 2: TÉRMINOS COPIA */}
      <div className="print-half flex-1 flex flex-col justify-between p-3.5 border border-stone-300 rounded-xl bg-white">
        <TermsHalfTemplate versionTag="COPIA" data={data} />
      </div>
    </>
  );
};

interface TermsHalfTemplateProps {
  versionTag: 'ORIGINAL' | 'COPIA';
  data: PrintableInvoiceData;
}

export const TermsHalfTemplate: React.FC<TermsHalfTemplateProps> = ({
  versionTag,
  data,
}) => {
  const {
    documentNumber,
    type,
    issueDate,
    clientName,
    clientCedulaRif,
    paymentMethod,
    issuerName,
    issuerCedula,
  } = data;

  return (
    <div className="w-full h-full flex flex-col justify-between text-[10px] leading-tight space-y-2 select-none">
      {/* Top Header */}
      <div className="border-b border-fuchsia-200 pb-1.5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold font-script text-fuchsia-950 tracking-wide">
                {COMPANY_INFO.name}
              </h4>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border uppercase ${
                  versionTag === 'ORIGINAL'
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-300'
                }`}
              >
                {versionTag}
              </span>
            </div>
            <p className="text-[10px] text-fuchsia-900 italic font-script">
              "{COMPANY_INFO.slogan}"
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono font-bold text-red-600 block">
              {type} Nº {documentNumber}
            </span>
            <span className="text-[9.5px] text-stone-500 block">
              Fecha: {issueDate}
            </span>
          </div>
        </div>

        <div className="mt-1 px-2 py-0.5 bg-fuchsia-50 rounded border border-fuchsia-200 flex items-center justify-between text-[9px]">
          <span className="font-bold text-fuchsia-950 uppercase tracking-wide">
            Términos y Condiciones Generales de Servicio
          </span>
          <span className="font-mono text-stone-600 font-bold">
            RIF: {COMPANY_INFO.rif}
          </span>
        </div>
      </div>

      {/* Mini Client Banner */}
      <div className="px-2 py-1 bg-stone-50 rounded border border-stone-200 text-[10px] grid grid-cols-2 gap-x-2">
        <div className="truncate">
          <span className="font-semibold text-stone-500">Cliente: </span>
          <strong className="text-stone-900">{clientName || 'Cliente sin registrar'}</strong>
        </div>
        <div className="text-right">
          <span className="font-semibold text-stone-500">C.I / RIF: </span>
          <strong className="font-mono text-stone-800">{clientCedulaRif || 'N/A'}</strong>
        </div>
      </div>

      {/* Cláusulas Legales con letra ampliada */}
      <div className="flex-1 space-y-1.5 text-[9.5px] leading-tight text-stone-700">
        <div className="p-1.5 bg-stone-50 rounded border border-stone-200">
          <strong className="text-stone-900 block font-bold text-fuchsia-950">
            1. Servicios y Decoración:
          </strong>
          <p className="text-stone-600 text-justify">
            La empresa garantiza la entrega y montaje de los productos, arreglos y servicios detallados en el anverso en óptimas condiciones de calidad, presentación e higiene para la fecha del evento.
          </p>
        </div>

        <div className="p-1.5 bg-red-50/50 rounded border border-red-200">
          <div className="flex items-center gap-1 text-red-700 font-bold">
            <ShieldCheck className="w-3 h-3 text-red-600 shrink-0" />
            <span>2. Cuidado de Mobiliario y Arreglos:</span>
          </div>
          <p className="text-stone-700 text-justify mt-0.5">
            El contratante asume la responsabilidad y custodia del material desde la entrega hasta su recolección. Cualquier daño o pérdida será calculado a costo de reposición.
          </p>
        </div>

        <div className="p-1.5 bg-stone-50 rounded border border-stone-200">
          <strong className="text-stone-900 block font-bold text-fuchsia-950">
            3. Medios de Pago y Tasa Oficial BCV:
          </strong>
          <p className="text-stone-600 text-justify">
            Todo pago en Bolívares se liquida según la Tasa Oficial del Banco Central de Venezuela (BCV). Pago Móvil a Banco Nacional de Crédito (0191), teléfono 0414-5057120, RIF J-508536371. Pagos en divisas vía Binance Pay: 04145057120 / Morabia18 y Zelle: ReySantaella9122205630.
          </p>
        </div>
      </div>

      {/* Recuadro de Firmas Conformes */}
      <div className="pt-1 border-t border-dashed border-stone-300">
        <div className="grid grid-cols-2 gap-3 text-center text-[9px] text-stone-600">
          <div>
            <div className="border-b border-stone-400 w-4/5 mx-auto mb-1 h-3" />
            <strong className="text-stone-900 block">Firma Conforme del Cliente</strong>
            <span className="text-[8.5px] text-stone-500 font-mono">
              C.I / RIF: {clientCedulaRif || '________________'}
            </span>
          </div>
          <div>
            <div className="border-b border-stone-400 w-4/5 mx-auto mb-1 h-3" />
            <strong className="text-stone-900 block">Por {COMPANY_INFO.name}</strong>
            <span className="text-[8.5px] text-stone-600 block">
              Facturador(a): <strong className="text-stone-800">{issuerName || 'Administración'}</strong>
              {issuerCedula ? ` • C.I: ${issuerCedula}` : ''}
            </span>
            <span className="text-[8px] text-stone-500 block">
              RIF: {COMPANY_INFO.rif}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
