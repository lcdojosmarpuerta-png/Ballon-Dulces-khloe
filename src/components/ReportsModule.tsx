import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Filter, 
  RotateCcw, 
  FileSpreadsheet, 
  Cloud, 
  Eye, 
  Printer, 
  Trash2, 
  Edit3, 
  TrendingUp, 
  FileText, 
  FileCheck2, 
  CheckCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  CreditCard,
  MessageCircle,
  Copy,
  Check
} from 'lucide-react';
import { InvoiceDocument, DocumentType } from '../types';
import { exportInvoicesToExcel } from '../lib/exportUtils';
import { PrintableInvoiceSheet } from './PrintableInvoiceSheet';
import { PrintModal } from './PrintModal';
import { printInvoiceElement } from '../lib/printUtils';
import { COMPANY_INFO } from '../data/companyInfo';

interface ReportsModuleProps {
  invoices: InvoiceDocument[];
  onDeleteInvoice: (id: string) => void;
  onEditInvoice: (invoice: InvoiceDocument) => void;
  onResetMonthlyData: () => void;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  invoices,
  onDeleteInvoice,
  onEditInvoice,
  onResetMonthlyData,
}) => {
  // Filtros de fecha y tipo de documento
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState<'Todos' | DocumentType>('Todos');

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Modal para ver detalle completo
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<InvoiceDocument | null>(null);

  // Estado para impresión en Formato Carta Horizontal (1 página)
  const [printingInvoice, setPrintingInvoice] = useState<InvoiceDocument | null>(null);

  // Escuchar fin de impresión para limpiar el documento activo si no está en modal
  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintingInvoice(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const [showPrintModal, setShowPrintModal] = useState(false);

  // Función de impresión que abre el Centro de Impresión y Descarga Oficial
  const handlePrintDocument = (inv: InvoiceDocument) => {
    setPrintingInvoice(inv);
    setShowPrintModal(true);
  };

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Botón Aplicar Filtro (activación visual / feedback)
  const handleApplyFilter = () => {
    setCurrentPage(1);
    showToast('Filtro aplicado');
  };

  // Botón Limpiar Filtros
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setDocTypeFilter('Todos');
    setCurrentPage(1);
    showToast('Filtros restablecidos');
  };

  // Filtrado de documentos
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Filtro de fecha de emisión
      if (startDate && inv.issueDate < startDate) return false;
      if (endDate && inv.issueDate > endDate) return false;
      // Filtro de tipo de documento
      if (docTypeFilter !== 'Todos' && inv.type !== docTypeFilter) return false;
      return true;
    });
  }, [invoices, startDate, endDate, docTypeFilter]);

  // KPIs dinámicos calculados sobre el resultado filtrado:
  // "Total de Ingresos General", tomando solo lo tipo "Factura & Nota de Entrega"
  // Desglose: a) Total por Factura Fiscal, b) Total por Notas de Entrega
  const kpis = useMemo(() => {
    let facturaIncome = 0;
    let notaEntregaIncome = 0;

    filteredInvoices.forEach((inv) => {
      if (inv.type === 'Factura') {
        facturaIncome += inv.totalUSD;
      } else if (inv.type === 'Nota de Entrega') {
        notaEntregaIncome += inv.totalUSD;
      }
    });

    const generalIncome = facturaIncome + notaEntregaIncome;

    return {
      generalIncome,
      facturaIncome,
      notaEntregaIncome,
    };
  }, [filteredInvoices]);

  // Paginación
  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  // Exportar a Excel local
  const handleExportExcel = () => {
    if (filteredInvoices.length === 0) {
      showToast('⚠️ No hay movimientos registrados para exportar.');
      return;
    }
    const currentMonth = new Date().toLocaleString('es-VE', { month: 'long', year: 'numeric' });
    exportInvoicesToExcel(filteredInvoices, currentMonth);
    showToast('Informe Excel generado y descargado exitosamente');
  };

  // Eliminar registro con confirmación previa
  const handleDelete = (id: string, docNumber: string) => {
    if (window.confirm(`¿Estás seguro de eliminar permanentemente el documento "${docNumber}"? Esta acción no se puede deshacer.`)) {
      onDeleteInvoice(id);
      showToast(`Documento ${docNumber} eliminado`);
      if (selectedInvoiceForModal?.id === id) {
        setSelectedInvoiceForModal(null);
      }
    }
  };

  // Reiniciar datos al inicio de cada mes (con confirmación de seguridad)
  const handleResetMonth = () => {
    const confirmText = prompt(
      'ADVERTENCIA: Esta acción reiniciará todos los movimientos del mes en curso.\nPara confirmar, escribe "REINICIAR":'
    );
    if (confirmText === 'REINICIAR') {
      onResetMonthlyData();
      showToast('Datos del mes reiniciados correctamente');
    }
  };

  return (
    <>
      <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn no-print">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-800 text-sm no-print">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-red-600" />
            <span className="text-stone-900">Módulo 4: Reportes e Indicadores Financieros</span>
          </h2>
          <p className="text-sm text-stone-500">
            Filtros por fecha, balance de Facturas vs Notas de Entrega y exportación a Excel (.xlsx).
          </p>
        </div>

        {/* Botones de Exportación */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            id="btn-export-excel"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Descargar archivo Excel .xlsx con todos los movimientos filtrados"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar a Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleResetMonth}
            id="btn-reset-month-data"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Reiniciar todos los datos al inicio del mes"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reiniciar Mes</span>
          </button>
        </div>
      </div>

      {/* 1. MÓDULO DE FILTROS DE BÚSQUEDA POR FECHAS */}
      <div className="bg-white p-5 rounded-2xl border border-fuchsia-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-fuchsia-50 text-xs font-bold uppercase tracking-wider text-fuchsia-950">
          <Filter className="w-4 h-4 text-red-500" />
          <span>Filtros de Búsqueda</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Desde */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Fecha de Inicio (Desde):
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-fuchsia-500/30"
            />
          </div>

          {/* Hasta */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Fecha de Fin (Hasta):
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-fuchsia-500/30"
            />
          </div>

          {/* Tipo de Documento */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Tipo de Documento:
            </label>
            <select
              value={docTypeFilter}
              onChange={(e) => setDocTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:ring-2 focus:ring-fuchsia-500/30"
            >
              <option value="Todos">Todos los Tipos</option>
              <option value="Factura">Solo Facturas Fiscales</option>
              <option value="Nota de Entrega">Solo Notas de Entrega</option>
              <option value="Presupuesto">Presupuestos</option>
            </select>
          </div>

          {/* Botones Aplicar y Limpiar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyFilter}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-xs shadow-fuchsia-200"
            >
              Aplicar Filtro
            </button>
            <button
              onClick={handleClearFilters}
              className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* 2. PANEL RESUMEN DE INDICADORES CLAVE (KPIS) */}
      <div className="bg-gradient-to-br from-white via-fuchsia-50/20 to-red-50/20 p-6 rounded-3xl border border-fuchsia-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-bold text-stone-800">
              Resumen de Ingresos del Periodo Seleccionado
            </h3>
          </div>
          <span className="text-xs font-medium text-stone-400">
            Calculado automáticamente en USD
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Ingresos General (Factura & Nota de Entrega) */}
          <div className="bg-white p-5 rounded-2xl border-2 border-red-500/40 shadow-xs space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-red-700 block">
              Total de Ingresos General
            </span>
            <div className="text-3xl font-extrabold text-stone-900 font-mono">
              ${kpis.generalIncome.toFixed(2)}
            </div>
            <p className="text-[11px] text-stone-500 pt-1">
              Consolida solo los tipos <strong>Factura & Nota de Entrega</strong>.
            </p>
          </div>

          {/* Sub-total: Ingresos por Factura Fiscal */}
          <div className="bg-white p-5 rounded-2xl border border-fuchsia-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Factura Fiscal (Con IVA)
              </span>
              <FileCheck2 className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-700 font-mono">
              ${kpis.facturaIncome.toFixed(2)}
            </div>
            <p className="text-[11px] text-stone-400 pt-1">
              Monto total emitido con comprobante fiscal y 16% de IVA.
            </p>
          </div>

          {/* Sub-total: Ingresos por Notas de Entrega */}
          <div className="bg-white p-5 rounded-2xl border border-fuchsia-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                Notas de Entrega (Sin IVA)
              </span>
              <FileText className="w-4 h-4 text-fuchsia-700" />
            </div>
            <div className="text-2xl font-bold text-fuchsia-800 font-mono">
              ${kpis.notaEntregaIncome.toFixed(2)}
            </div>
            <p className="text-[11px] text-stone-400 pt-1">
              Monto total por concepto de entregas directas sin impuestos.
            </p>
          </div>
        </div>
      </div>

      {/* 3. TABLA / LISTADO DE FACTURACIONES GUARDADAS */}
      <div className="bg-white rounded-2xl border border-fuchsia-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-fuchsia-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-red-50/30 to-fuchsia-50/30">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-950">
              Listado de Facturaciones Guardadas ({filteredInvoices.length})
            </h4>
          </div>

          {/* Paginador Selector */}
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs"
            >
              <option value={10}>10 por pág.</option>
              <option value={25}>25 por pág.</option>
              <option value={50}>50 por pág.</option>
            </select>
          </div>
        </div>

        {paginatedInvoices.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <FileText className="w-10 h-10 mx-auto text-stone-300 mb-2" />
            <p className="text-sm font-medium">No hay registros con los filtros seleccionados</p>
            <p className="text-xs mt-1">Crea nuevas facturas o restablece los filtros.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">N° Documento</th>
                  <th className="py-3 px-3">Fechas</th>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-3">Tipo</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-4 text-right">Monto Total</th>
                  <th className="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-fuchsia-50/20 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-red-700">
                      {inv.documentNumber}
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-600">
                      <div className="text-xs">
                        <span className="text-[10px] text-stone-400">Emisión: </span>
                        <span>{inv.issueDate}</span>
                      </div>
                      {inv.eventDate && (
                        <div className="text-[11px] font-bold text-sky-950 mt-0.5">
                          <span className="text-[10px] text-sky-700 font-normal">Evento: </span>
                          <span>{inv.eventDate}</span>
                        </div>
                      )}
                      {inv.issuerName && (
                        <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <span className="font-semibold text-sky-700">Por:</span>
                          <span className="truncate max-w-[110px] font-medium text-slate-700">{inv.issuerName}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-800">
                      <div>{inv.clientName}</div>
                      <span className="text-[10px] text-stone-400 font-normal">
                        {inv.clientPhone}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          inv.type === 'Factura'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : inv.type === 'Nota de Entrega'
                            ? 'bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {inv.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          inv.status === 'Pagada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'Abonada'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-stone-900">
                      <div>${inv.totalUSD.toFixed(2)}</div>
                      <div className="text-[10px] text-stone-400 font-normal">
                        {inv.totalBs.toLocaleString('es-VE', { maximumFractionDigits: 1 })} Bs
                      </div>
                    </td>

                    {/* COLUMNA DE ACCIONES: Ver, Imprimir, Editar y Eliminar */}
                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        {/* Botón Ver */}
                        <button
                          onClick={() => setSelectedInvoiceForModal(inv)}
                          title="Ver detalle del documento"
                          className="p-1.5 text-stone-500 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Botón Imprimir */}
                        <button
                          onClick={() => handlePrintDocument(inv)}
                          title="Imprimir documento (Formato Carta Horizontal - Original y Copia)"
                          className="p-1.5 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Botón Editar */}
                        <button
                          onClick={() => onEditInvoice(inv)}
                          title="Editar en módulo de facturación"
                          className="p-1.5 text-stone-500 hover:text-fuchsia-700 hover:bg-fuchsia-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Botón Eliminar con confirmación */}
                        <button
                          onClick={() => handleDelete(inv.id, inv.documentNumber)}
                          title="Eliminar documento"
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación funcional */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-fuchsia-100 flex items-center justify-between text-xs text-stone-600 bg-stone-50/50">
            <span>
              Página {currentPage} de {totalPages} ({filteredInvoices.length} registros)
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 border border-stone-300 rounded-lg disabled:opacity-40 hover:bg-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-stone-300 rounded-lg disabled:opacity-40 hover:bg-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL DETALLE / VISTA PREVIA DEL DOCUMENTO */}
      {selectedInvoiceForModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl border border-fuchsia-100 max-h-[92vh] overflow-y-auto space-y-4 my-auto">
            {/* Cabecera del Modal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-fuchsia-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-fuchsia-950 font-script">
                    Ballón dulces Klhoe
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded-md font-mono font-bold bg-fuchsia-50 text-fuchsia-800 border border-fuchsia-200">
                    {selectedInvoiceForModal.type} #{selectedInvoiceForModal.documentNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      selectedInvoiceForModal.status === 'Pagada'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedInvoiceForModal.status === 'Abonada'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {selectedInvoiceForModal.status}
                  </span>
                  {selectedInvoiceForModal.issuerName && (
                    <span className="text-[11px] font-semibold text-slate-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                      👤 Facturador(a): <strong className="text-sky-900">{selectedInvoiceForModal.issuerName}</strong>
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500">
                  Vista previa con parámetros oficiales de impresión (Carta Horizontal - Original y Copia).
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <button
                  onClick={() => {
                    const inv = selectedInvoiceForModal;
                    const text = `🎈 *${COMPANY_INFO.name.toUpperCase()}* 🎈\n_"${COMPANY_INFO.slogan}"_\n💳 *DATOS OFICIALES PARA PAGOS* 💳\n-------------------------------------------------\n👤 *Cliente:* ${inv.clientName} ${inv.clientCedulaRif ? `(${inv.clientCedulaRif})` : ''}\n📄 *Documento:* ${inv.type} #${inv.documentNumber}\n💰 *Total:* $${inv.totalUSD.toFixed(2)} USD ≈ ${inv.totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs (Tasa BCV ${inv.bcvRate.toFixed(2)})\n📌 *Método:* ${inv.paymentMethod || 'Efectivo $'}\n-------------------------------------------------\n📲 *PAGO MÓVIL (BNC 0191):*\n• Teléfono: 04145057120\n• RIF: J-508536371\n• Titular: ${COMPANY_INFO.name}\n\n🟡 *BINANCE PAY:*\n• Teléfono / ID: 04145057120\n• Usuario: Morabia18\n\n🔵 *ZELLE:*\n• Cuenta / Destinatario: ReySantaella9122205630\n\n📍 *Ubicación:* ${COMPANY_INFO.address}\n-------------------------------------------------\n⚠️ Favor enviar comprobante a este chat una vez efectuado el pago. ¡Gracias!`;
                    navigator.clipboard.writeText(text);
                    showToast('Datos de Pago Móvil, Binance y Zelle copiados');
                  }}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-stone-200 transition-colors"
                  title="Copiar datos bancarios y monto del documento"
                >
                  <CreditCard className="w-4 h-4 text-fuchsia-600" />
                  <span>Datos de Pago</span>
                </button>

                <button
                  onClick={() => handlePrintDocument(selectedInvoiceForModal)}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs shadow-fuchsia-200 transition-all hover:scale-102"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Formato Carta</span>
                </button>
                <button
                  onClick={() => setSelectedInvoiceForModal(null)}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>

            {/* Vista Previa de la Factura (Mismo formato Carta Horizontal de Facturación) */}
            <div className="overflow-x-auto p-2 bg-stone-100/60 rounded-2xl border border-stone-200">
              <PrintableInvoiceSheet
                id="modal-preview-invoice-sheet"
                onOpenPrintModal={() => setShowPrintModal(true)}
                data={selectedInvoiceForModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>

    {/* 
      ========================================================================
      VISTA DE IMPRESIÓN OFICIAL (ID: printable-invoice-sheet)
      Cumple estrictamente los mismos parámetros del módulo de facturación:
      - Formato Tamaño Carta (Letter) en Orientación Horizontal (Landscape).
      - Layout de 2 secciones iguales: Lado 1: ORIGINAL | Lado 2: COPIA.
      - Separadas por línea punteada de corte con tijera.
      - Se ajusta estrictamente a UNA SOLA PÁGINA.
      - Desglose con Tasa Oficial BCV, IVA y datos completos de cliente.
      ========================================================================
    */}
    {(printingInvoice || selectedInvoiceForModal) && (
      <div className="print-only">
        <PrintableInvoiceSheet
          id="printable-invoice-sheet"
          data={printingInvoice || selectedInvoiceForModal!}
        />
      </div>
    )}

    {/* MODAL DE IMPRESIÓN Y DESCARGA OFICIAL */}
    {showPrintModal && (printingInvoice || selectedInvoiceForModal) && (
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        data={printingInvoice || selectedInvoiceForModal!}
      />
    )}
  </>
  );
};
