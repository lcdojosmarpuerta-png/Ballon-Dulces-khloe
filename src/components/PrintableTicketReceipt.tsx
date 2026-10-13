import React from 'react';
import { PrintableInvoiceData } from './PrintableInvoiceSheet';
import { COMPANY_INFO } from '../data/companyInfo';
import { BrandLogo } from './BrandLogo';

interface PrintableTicketReceiptProps {
  data: PrintableInvoiceData;
  id?: string;
  className?: string;
}

export const PrintableTicketReceipt: React.FC<PrintableTicketReceiptProps> = ({
  data,
  id = 'printable-ticket-receipt',
  className = '',
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
    <div
      id={id}
      className={`ticket-receipt-print bg-white text-stone-900 mx-auto p-4 sm:p-6 border border-stone-300 rounded-2xl shadow-lg max-w-[340px] font-mono text-xs leading-tight ${className}`}
      style={{ width: '100%', maxWidth: '340px' }}
    >
      {/* Encabezado Fiscal */}
      <div className="text-center space-y-1 pb-2 border-b-2 border-dashed border-stone-800">
        <div className="flex justify-center mb-1">
          <BrandLogo size="md" />
        </div>
        <h2 className="text-sm font-extrabold uppercase tracking-tight text-stone-900 leading-tight">
          {COMPANY_INFO.name}
        </h2>
        <p className="text-[11px] font-bold text-stone-700">
          RIF: {COMPANY_INFO.rif}
        </p>
        <p className="text-[10px] text-stone-600 leading-tight">
          {COMPANY_INFO.address}
        </p>
        <p className="text-[10.5px] font-bold text-stone-800">
          TELÉFONO: {COMPANY_INFO.phoneFormatted}
        </p>
        <p className="text-[10px] italic text-sky-800 font-sans font-bold">
          "{COMPANY_INFO.slogan}"
        </p>
      </div>

      {/* Datos del Documento */}
      <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[11px]">
        <div className="flex justify-between items-center font-bold">
          <span className="uppercase text-stone-700">{type} (TICKET):</span>
          <span className="text-xs font-black text-red-600">{documentNumber}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Fecha Emisión:</span>
          <span className="font-semibold text-stone-800">{issueDate}</span>
        </div>
        {eventDate && (
          <div className="flex justify-between text-fuchsia-950 font-bold">
            <span>Fecha Evento:</span>
            <span>{eventDate}</span>
          </div>
        )}
        <div className="flex justify-between items-center pt-0.5">
          <span>Estado:</span>
          <span className="font-bold px-1.5 py-0.2 bg-stone-100 border border-stone-400 rounded text-[10px] uppercase">
            {status}
          </span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Forma Pago:</span>
          <span className="font-semibold text-stone-800">{paymentMethod || 'Efectivo $'}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Facturador(a):</span>
          <span className="font-bold text-stone-900 text-right truncate max-w-[160px]">
            {issuerName || 'Caja / Tienda'}
            {issuerCedula ? ` (${issuerCedula})` : ''}
          </span>
        </div>
        {issuerRole && (
          <div className="flex justify-between text-[10px] text-stone-500">
            <span>Cargo:</span>
            <span className="font-medium text-stone-700">{issuerRole}</span>
          </div>
        )}
      </div>

      {/* Datos del Cliente */}
      <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[11px]">
        <p className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">
          DATOS DEL CLIENTE:
        </p>
        <p className="font-bold text-stone-900 truncate">
          {clientName || 'Cliente General'}
        </p>
        <div className="flex justify-between text-stone-600">
          <span>C.I / RIF:</span>
          <span className="font-semibold text-stone-800">{clientCedulaRif || 'N/A'}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Teléfono:</span>
          <span className="font-semibold text-stone-800">{clientPhone || 'N/A'}</span>
        </div>
        {clientAddress && (
          <p className="text-[10px] text-stone-600 truncate">
            Dir: {clientAddress}
          </p>
        )}
      </div>

      {/* Detalle de Productos / Servicios */}
      <div className="py-2 border-b-2 border-dashed border-stone-800">
        <div className="flex justify-between font-bold text-[10px] uppercase border-b border-stone-300 pb-1 mb-1.5 text-stone-700">
          <span className="w-1/2">Descripción</span>
          <span className="w-1/4 text-center">Cant</span>
          <span className="w-1/4 text-right">Total $</span>
        </div>

        <div className="space-y-1.5">
          {items.map((it, idx) => (
            <div key={it.id || idx} className="text-[11px]">
              <div className="font-bold text-stone-900 leading-tight">
                {it.name}
              </div>
              <div className="flex justify-between text-stone-600 text-[10px]">
                <span>
                  {it.quantity} x ${it.unitPrice.toFixed(2)} USD
                </span>
                <span className="font-bold text-stone-900">
                  ${it.total.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de Totales */}
      <div className="py-2 border-b-2 border-dashed border-stone-800 space-y-1 text-xs">
        <div className="flex justify-between text-stone-600">
          <span>SUBTOTAL:</span>
          <span className="font-bold text-stone-800">${subtotalUSD.toFixed(2)} USD</span>
        </div>

        {ivaRate > 0 ? (
          <div className="flex justify-between text-stone-600">
            <span>IVA ({(ivaRate * 100).toFixed(0)}%):</span>
            <span className="font-bold text-stone-800">${ivaUSD.toFixed(2)} USD</span>
          </div>
        ) : (
          <div className="flex justify-between text-stone-500 text-[10.5px]">
            <span>IVA:</span>
            <span>EXENTO (0%)</span>
          </div>
        )}

        <div className="flex justify-between items-center text-sm font-black pt-1 border-t border-stone-300 text-stone-900">
          <span>TOTAL USD:</span>
          <span className="text-red-600">${totalUSD.toFixed(2)}</span>
        </div>

        <div className="flex justify-between text-[11px] text-stone-600">
          <span>TASA BCV:</span>
          <span>{rate.toFixed(2)} Bs / USD</span>
        </div>

        <div className="flex justify-between items-center text-sm font-black text-fuchsia-950 pt-0.5">
          <span>TOTAL BS:</span>
          <span>{totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs</span>
        </div>
      </div>

      {/* Datos para Pago Móvil en el Ticket */}
      <div className="py-2 border-b border-dashed border-stone-400 bg-stone-50/80 p-2 my-1 rounded text-[10px] space-y-0.5">
        <p className="font-bold uppercase text-stone-700 text-center">
          DATOS PAGO MÓVIL
        </p>
        <p className="text-center font-semibold text-stone-800">
          Banco Nacional de Crédito (0191)
        </p>
        <div className="flex justify-between">
          <span>Teléfono:</span>
          <span className="font-bold">0414-5057120</span>
        </div>
        <div className="flex justify-between">
          <span>C.I / RIF:</span>
          <span className="font-bold">J-508536371</span>
        </div>
      </div>

      {/* Notas si existen */}
      {notes && (
        <div className="py-1 text-[10px] text-stone-600 italic border-b border-dashed border-stone-300">
          <span className="font-bold not-italic">Nota:</span> {notes}
        </div>
      )}

      {/* Pie del Ticket */}
      <div className="text-center pt-3 space-y-1">
        <p className="font-bold text-xs text-stone-800">
          ¡GRACIAS POR SU PREFERENCIA!
        </p>
        <p className="text-[10px] text-stone-600 italic">
          "Detalles que marcan la diferencia en tu fiesta"
        </p>
        <p className="text-[9px] text-stone-400 uppercase pt-1">
          *** COMPROBANTE DE COMPRA ***
        </p>
      </div>
    </div>
  );
};
