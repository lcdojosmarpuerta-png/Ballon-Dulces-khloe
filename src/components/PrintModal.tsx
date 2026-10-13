import React, { useState, useRef } from 'react';
import { 
  Printer, 
  Download, 
  X, 
  FileText, 
  FileCode, 
  Check, 
  Loader2, 
  AlertCircle,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  Receipt
} from 'lucide-react';
import { PrintableInvoiceData, PrintableInvoiceSheet } from './PrintableInvoiceSheet';
import { PrintableTicketReceipt } from './PrintableTicketReceipt';
import { generateInvoicePdf, downloadPrintableHtml } from '../lib/pdfUtils';
import { printInvoiceElement } from '../lib/printUtils';
import { COMPANY_INFO } from '../data/companyInfo';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: PrintableInvoiceData;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [printFormat, setPrintFormat] = useState<'sheet' | 'ticket'>('sheet');
  const [selectedSheet, setSelectedSheet] = useState<'both' | 'front' | 'back'>('both');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);
  const [htmlSuccess, setHtmlSuccess] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [browserPrintNotice, setBrowserPrintNotice] = useState<string | null>(null);

  const previewContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const docCode = `${data.type}-${data.documentNumber}`;

  // Imprimir con diálogo nativo del navegador
  const handleNativePrint = () => {
    try {
      setBrowserPrintNotice('Abriendo diálogo de impresión...');
      const targetElementId = printFormat === 'ticket' ? 'modal-print-ticket-content' : 'modal-print-sheet-content';
      const success = printInvoiceElement(targetElementId);
      if (!success) {
        setBrowserPrintNotice('El navegador bloqueó la ventana emergente. Usa "Descargar PDF Oficial".');
      } else {
        setTimeout(() => setBrowserPrintNotice(null), 3000);
      }
    } catch (e: any) {
      console.warn('Error al llamar a window.print:', e);
      setBrowserPrintNotice('Tu navegador bloquea el diálogo directo. Usa "Descargar PDF Oficial".');
    }
  };

  // Descargar PDF con jsPDF y html2canvas
  const handleDownloadPdf = async () => {
    try {
      setIsGeneratingPdf(true);
      setBrowserPrintNotice(null);

      if (printFormat === 'ticket') {
        const ticketEl = document.querySelector('#modal-print-ticket-content .ticket-receipt-print') as HTMLElement | null;
        const success = await generateInvoicePdf(
          ticketEl,
          null,
          `${docCode}-TicketFiscal.pdf`,
          'front'
        );
        if (success) {
          setPdfSuccess(true);
          setTimeout(() => setPdfSuccess(false), 3500);
        } else {
          handleDownloadHtml();
        }
      } else {
        const frontEl = document.querySelector('#modal-print-sheet-content .print-page-front') as HTMLElement | null;
        const backEl = document.querySelector('#modal-print-sheet-content .print-page-back') as HTMLElement | null;

        const success = await generateInvoicePdf(
          frontEl,
          backEl,
          `${docCode}.pdf`,
          selectedSheet
        );

        if (success) {
          setPdfSuccess(true);
          setTimeout(() => setPdfSuccess(false), 3500);
        } else {
          handleDownloadHtml();
        }
      }
    } catch (err) {
      console.error(err);
      handleDownloadHtml();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Descargar HTML autónomo con auto-print
  const handleDownloadHtml = () => {
    const targetElementId = printFormat === 'ticket' ? 'modal-print-ticket-content' : 'modal-print-sheet-content';
    const el = document.getElementById(targetElementId);
    if (el) {
      downloadPrintableHtml(
        `${COMPANY_INFO.name} - ${data.type} ${data.documentNumber}`,
        el.innerHTML,
        `${docCode}-${printFormat === 'ticket' ? 'TicketFiscal' : 'Imprimir'}.html`
      );
      setHtmlSuccess(true);
      setTimeout(() => setHtmlSuccess(false), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 no-print animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full p-4 sm:p-6 shadow-2xl border border-fuchsia-100 max-h-[96vh] flex flex-col space-y-4 my-auto">
        {/* Cabecera del Modal */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-fuchsia-100 pb-3 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <h3 className="text-xl font-bold text-stone-900">
                Centro de Impresión y Facturación Oficial
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-lg font-mono font-bold bg-fuchsia-50 text-fuchsia-900 border border-fuchsia-200">
                {data.type} #{data.documentNumber}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Cliente: <strong className="text-stone-800">{data.clientName}</strong> • Total: <strong className="text-red-600 font-mono">${data.totalUSD.toFixed(2)} USD</strong> (≈ {data.totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs)
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SELECTOR DE FORMATO DE IMPRESIÓN (Carta vs Ticket Fiscal Láser) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-gradient-to-r from-fuchsia-50 via-white to-pink-50 rounded-2xl border border-fuchsia-200 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-fuchsia-950 px-2">
              Formato de Salida:
            </span>
            <button
              type="button"
              onClick={() => setPrintFormat('sheet')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                printFormat === 'sheet'
                  ? 'bg-fuchsia-950 text-white shadow-md shadow-fuchsia-950/20'
                  : 'bg-white text-stone-700 hover:bg-fuchsia-100/50 border border-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-pink-300" />
              <span>Factura Carta Horizontal</span>
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('ticket')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                printFormat === 'ticket'
                  ? 'bg-gradient-to-r from-red-600 to-fuchsia-600 text-white shadow-md shadow-red-500/20'
                  : 'bg-white text-stone-700 hover:bg-fuchsia-100/50 border border-stone-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5 text-amber-200" />
              <span>Ticket Fiscal (Láser / 80mm)</span>
            </button>
          </div>

          <div className="text-xs text-stone-500 hidden md:block">
            {printFormat === 'sheet' 
              ? 'Impresión horizontal en 1 hoja con Original y Copia' 
              : 'Formato continuo para impresoras fiscales y tickets láser'}
          </div>
        </div>

        {/* Barra de Acciones y Controles Principales */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shrink-0">
          {/* Opciones específicas según el formato */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {printFormat === 'sheet' ? (
              <>
                <span className="text-xs font-bold text-stone-600 mr-1 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-fuchsia-600" />
                  Hojas:
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedSheet('both')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedSheet === 'both'
                      ? 'bg-gradient-to-r from-red-600 to-fuchsia-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  Ambas (Anverso y Reverso)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSheet('front')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedSheet === 'front'
                      ? 'bg-gradient-to-r from-red-600 to-fuchsia-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  Hoja 1 (Factura)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSheet('back')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedSheet === 'back'
                      ? 'bg-gradient-to-r from-red-600 to-fuchsia-600 text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  Hoja 2 (Términos)
                </button>
              </>
            ) : (
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200">
                <Receipt className="w-3.5 h-3.5 text-red-600" />
                <span>Ticket Fiscal Estándar 80mm</span>
              </span>
            )}

            {/* Controles de Zoom */}
            <div className="hidden sm:flex items-center gap-1 ml-2 bg-white px-2 py-1 rounded-xl border border-stone-200 text-xs text-stone-600">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(50, z - 15))}
                className="hover:text-stone-900 cursor-pointer p-0.5"
                title="Alejar vista previa"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] w-10 text-center font-semibold">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(130, z + 15))}
                className="hover:text-stone-900 cursor-pointer p-0.5"
                title="Acercar vista previa"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Botones de Acción de Impresión / Descarga */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-xl text-xs font-bold shadow-md shadow-fuchsia-200 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>¡PDF Descargado!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF Oficial</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleNativePrint}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              title="Abrir ventana de impresión del navegador (Ctrl + P)"
            >
              <Printer className="w-4 h-4 text-red-400" />
              <span>{printFormat === 'ticket' ? 'Imprimir Ticket' : 'Imprimir Factura'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadHtml}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
              title="Descargar archivo HTML que abre automáticamente la ventana de impresión"
            >
              {htmlSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Descargado</span>
                </>
              ) : (
                <>
                  <FileCode className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">HTML Auto-Print</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Aviso de feedback si el navegador restringe modales */}
        {browserPrintNotice && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{browserPrintNotice}</span>
          </div>
        )}

        {/* Contenedor de Vista Previa del Documento */}
        <div
          ref={previewContainerRef}
          className="flex-1 overflow-auto p-4 bg-stone-200/80 rounded-2xl border border-stone-300 shadow-inner flex flex-col items-center min-h-[360px]"
        >
          {printFormat === 'sheet' ? (
            <div
              id="modal-print-sheet-content"
              className="w-full transition-transform origin-top"
              style={{ transform: `scale(${zoomLevel / 100})`, maxWidth: '1080px' }}
            >
              <PrintableInvoiceSheet
                id="printable-invoice-sheet-in-modal"
                data={data}
              />
            </div>
          ) : (
            <div
              id="modal-print-ticket-content"
              className="transition-transform origin-top my-2"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <PrintableTicketReceipt
                id="printable-ticket-receipt-in-modal"
                data={data}
              />
            </div>
          )}
        </div>

        {/* Guía Rápida al Pie */}
        <div className="p-3 bg-fuchsia-50/60 border border-fuchsia-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-fuchsia-950 shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-fuchsia-600 shrink-0" />
            <span>
              {printFormat === 'sheet' ? (
                <>
                  <strong>Guía Factura:</strong> Selecciona papel <strong>Carta (Letter)</strong> en orientación <strong>Horizontal (Landscape)</strong>. Si deseas guardarla digitalmente, pulsa <strong>"Descargar PDF Oficial"</strong>.
                </>
              ) : (
                <>
                  <strong>Guía Ticket Fiscal:</strong> Optimizado para papel continuo de <strong>80mm</strong> en impresoras térmicas y láser. Contiene datos de Pago Móvil BNC y desglose completo.
                </>
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
