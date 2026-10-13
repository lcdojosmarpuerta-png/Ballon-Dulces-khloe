import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Database, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  HardDrive, 
  FileJson, 
  Sparkles,
  RefreshCw,
  Globe,
  FileCode2,
  Laptop,
  Zap,
  Check,
  FolderDown
} from 'lucide-react';
import { 
  Client, 
  InventoryItem, 
  InvoiceDocument, 
  RentalInspection, 
  PagoMovilConfig, 
  BackupData 
} from '../types';
import { downloadSiteIndexHtml } from '../lib/standaloneDownload';

interface BackupsModuleProps {
  clients: Client[];
  inventory: InventoryItem[];
  invoices: InvoiceDocument[];
  rentals?: RentalInspection[];
  pagoMovilConfig: PagoMovilConfig;
  bcvRate: number | null;
  onRestoreData: (backup: BackupData) => void;
  onClearAllData?: () => void;
}

export const BackupsModule: React.FC<BackupsModuleProps> = ({
  clients,
  inventory,
  invoices,
  rentals = [],
  pagoMovilConfig,
  bcvRate,
  onRestoreData,
  onClearAllData,
}) => {
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(() => {
    return localStorage.getItem('bdk_last_local_backup_date');
  });

  const [importPreview, setImportPreview] = useState<BackupData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [downloadingHtmlType, setDownloadingHtmlType] = useState<'clean' | 'seeded' | null>(null);
  const [htmlSuccessMsg, setHtmlSuccessMsg] = useState<string | null>(null);

  const currentRate = bcvRate || 36.5;

  // Descarga del archivo index.html autónomo del sitio completo
  const handleDownloadStandaloneHtml = async (embedData: boolean) => {
    try {
      setDownloadingHtmlType(embedData ? 'seeded' : 'clean');
      const dateFormatted = new Date().toISOString().slice(0, 10);
      const fileName = embedData 
        ? `ballon-dulces-klhoe-completo-con-datos-${dateFormatted}.html`
        : `index.html`;

      await downloadSiteIndexHtml({
        fileName,
        embedData,
        clients,
        inventory,
        invoices,
        rentals,
        pagoMovilConfig,
        bcvRate,
      });

      setHtmlSuccessMsg(
        embedData
          ? '¡Archivo HTML descargado con todo el código y tus datos actuales incluidos!'
          : '¡Archivo index.html descargado con todo el código del sitio!'
      );
      setTimeout(() => setHtmlSuccessMsg(null), 4500);
    } catch (err: any) {
      console.error('Error al descargar archivo index.html:', err);
    } finally {
      setDownloadingHtmlType(null);
    }
  };

  // Exportar archivo JSON completo
  const handleExportJSON = () => {
    const backup: BackupData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      appName: 'Ballón dulces Klhoe',
      clients,
      inventory,
      invoices,
      rentals,
      pagoMovilConfig,
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backup, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    const dateFormatted = new Date().toISOString().slice(0, 10);
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `respaldo-ballon-dulces-klhoe-${dateFormatted}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    const now = new Date().toLocaleString('es-VE');
    setLastBackupDate(now);
    localStorage.setItem('bdk_last_local_backup_date', now);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  // Exportar Libro Excel Maestro Multi-Hojas
  const handleExportExcelMaster = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Clientes
    const clientsRows = clients.map((c) => ({
      ID: c.id,
      Nombre: c.name,
      'Cédula / RIF': c.cedulaRif || '',
      Teléfono: c.phone,
      Dirección: c.address,
      'Fecha Registro': c.createdAt.slice(0, 10),
    }));
    const wsClients = XLSX.utils.json_to_sheet(clientsRows);
    XLSX.utils.book_append_sheet(wb, wsClients, 'Clientes');

    // Hoja 2: Inventario
    const inventoryRows = inventory.map((inv) => ({
      ID: inv.id,
      Nombre: inv.name,
      Categoría: inv.category,
      Stock: inv.quantity,
      'Precio USD': inv.price,
      'Precio Bs (BCV)': Number((inv.price * currentRate).toFixed(2)),
      'Última Modificación': inv.updatedAt.slice(0, 10),
    }));
    const wsInventory = XLSX.utils.json_to_sheet(inventoryRows);
    XLSX.utils.book_append_sheet(wb, wsInventory, 'Inventario');

    // Hoja 3: Facturación
    const invoiceRows = invoices.map((i) => ({
      ID: i.id,
      'Nº Documento': i.documentNumber,
      Tipo: i.type,
      Estado: i.status,
      'Método de Pago': i.paymentMethod || 'Efectivo $',
      Cliente: i.clientName,
      'Total USD': i.totalUSD,
      'Tasa BCV': i.bcvRate,
      'Total Bs': i.totalBs,
      Fecha: i.issueDate,
    }));
    const wsInvoices = XLSX.utils.json_to_sheet(invoiceRows);
    XLSX.utils.book_append_sheet(wb, wsInvoices, 'Facturación');

    const dateFormatted = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `libro-maestro-ballon-dulces-klhoe-${dateFormatted}.xlsx`);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3500);
  };

  // Leer y validar archivo JSON para restaurar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportPreview(null);
    setImportSuccess(false);

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed: BackupData = JSON.parse(text);

        if (!parsed.clients || !Array.isArray(parsed.clients) || !parsed.inventory || !Array.isArray(parsed.inventory)) {
          throw new Error('El archivo no tiene el formato de copia de seguridad válido de Ballón Dulces Klhoe.');
        }

        setImportPreview(parsed);
      } catch (err: any) {
        setImportError(err.message || 'Error al leer el archivo JSON seleccionado.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!importPreview) return;
    onRestoreData(importPreview);
    setImportSuccess(true);
    setImportPreview(null);
    setTimeout(() => setImportSuccess(false), 4000);
  };

  // Estadísticas generales del sistema
  const totalRecords = clients.length + inventory.length + invoices.length + rentals.length;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
            <Database className="w-5 h-5" />
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-script text-fuchsia-950">
            Copias de Seguridad, Respaldo y Restauración
          </h2>
        </div>
        <p className="text-xs text-stone-600 mt-1">
          Descarga copias de seguridad completas de toda tu información en tu equipo o restaura bases de datos anteriores de forma segura.
        </p>
      </div>

      {/* Indicadores de Salud de la Base de Datos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Registros Totales
            </span>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">
              {totalRecords}
            </h3>
            <p className="text-[10px] text-stone-500">En clientes, stock y facturas</p>
          </div>
          <div className="p-3 bg-stone-100 text-stone-700 rounded-2xl">
            <HardDrive className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Directorio Clientes
            </span>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">
              {clients.length}
            </h3>
            <p className="text-[10px] text-stone-500">Registrados en agenda</p>
          </div>
          <div className="p-3 bg-fuchsia-50 text-fuchsia-700 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Movimientos Facturación
            </span>
            <h3 className="text-2xl font-bold text-stone-900 mt-0.5">
              {invoices.length}
            </h3>
            <p className="text-[10px] text-stone-500">Facturas y presupuestos</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Último Respaldo Local
            </span>
            <h3 className="text-xs font-bold text-stone-800 mt-1 truncate">
              {lastBackupDate || 'Sin registro reciente'}
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Almacenamiento seguro
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>¡Archivo descargado exitosamente a tu dispositivo! Guárdalo en un pendrive o carpeta segura.</span>
        </div>
      )}

      {importSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>¡Copia de seguridad restaurada con éxito! Todos los módulos han sido actualizados con los datos importados.</span>
        </div>
      )}

      {/* SECCIÓN ESPECIAL: DESCARGA DEL SITIO WEB COMPLETO EN UN SOLO ARCHIVO INDEX.HTML */}
      <div className="bg-gradient-to-br from-sky-950 via-purple-950 to-pink-950 p-6 md:p-8 rounded-3xl text-white shadow-xl border border-sky-400/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-pink-300 shadow-inner">
                <Globe className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg md:text-xl font-bold text-white font-script tracking-wide">
                    Descargar Sitio Completo en un solo Archivo (index.html)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/30 text-pink-200 border border-pink-400/30 uppercase tracking-wider">
                    100% Offline
                  </span>
                </div>
                <p className="text-xs text-pink-100/80 mt-0.5">
                  Todo el sistema (código React, estilos, catálogo, facturas, generador de PDF y base de datos) empaquetado en un único archivo autónomo.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] font-mono text-pink-200/70 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                Tamaño: ~2.0 MB (Autónomo)
              </span>
            </div>
          </div>

          {htmlSuccessMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{htmlSuccessMsg}</span>
            </div>
          )}

          {/* Botones de Descarga */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Botón 1: Código Limpio */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between gap-3 hover:bg-white/15 transition-all">
              <div>
                <div className="flex items-center gap-2 text-pink-200 font-bold text-xs">
                  <FileCode2 className="w-4 h-4 text-pink-300" />
                  <span>index.html (Código Original del Sitio)</span>
                </div>
                <p className="text-[11px] text-pink-100/70 mt-1 leading-relaxed">
                  Descarga el archivo <code>index.html</code> listo para usar en tu computadora o alojar en cualquier servidor gratuito (GitHub Pages, Netlify, Vercel).
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadStandaloneHtml(false)}
                disabled={downloadingHtmlType !== null}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:from-pink-400 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-900/30 cursor-pointer transition-transform active:scale-98 disabled:opacity-50"
              >
                {downloadingHtmlType === 'clean' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Generando archivo...</span>
                  </>
                ) : (
                  <>
                    <FolderDown className="w-4 h-4" />
                    <span>Descargar index.html Autónomo</span>
                  </>
                )}
              </button>
            </div>

            {/* Botón 2: Con datos precargados */}
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex flex-col justify-between gap-3 hover:bg-white/15 transition-all">
              <div>
                <div className="flex items-center gap-2 text-amber-200 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>index.html + Mis Datos Actuales Precargados</span>
                </div>
                <p className="text-[11px] text-pink-100/70 mt-1 leading-relaxed">
                  Incrusta tus clientes ({clients.length}), inventario ({inventory.length}), facturas ({invoices.length}) y tasa BCV directamente en el archivo HTML.
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadStandaloneHtml(true)}
                disabled={downloadingHtmlType !== null}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 cursor-pointer transition-transform active:scale-98 disabled:opacity-50"
              >
                {downloadingHtmlType === 'seeded' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Empaquetando con datos...</span>
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    <span>Descargar index.html con Mis Datos</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Ventajas y Cómo Utilizarlo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px] text-pink-100/80 border-t border-white/10">
            <div className="flex items-start gap-2">
              <Laptop className="w-4 h-4 text-pink-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Abre con doble clic:</span>
                Sin Node.js, sin instalar nada, funciona directo en Chrome, Edge, Firefox o Safari.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Zap className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Sin límites de nube:</span>
                Inmune a fallos de cuota o caídas de servidor; tus datos se guardan en tu propio navegador.
              </div>
            </div>

            <div className="flex items-start gap-2">
              <HardDrive className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block">Llévalo en Pendrive:</span>
                Copia el archivo a una memoria USB y úsalo en cualquier computadora u oficina.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Opciones de Exportación y Restauración */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TARJETA 1: DESCARGAR COPIAS */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-fuchsia-950" />
              <span>Exportar Copias de Seguridad</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Descarga un archivo con fecha y hora para resguardar tus datos en caso de cambio de equipo o formateo.
            </p>
          </div>

          <div className="space-y-3">
            {/* Botón Respaldo JSON */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-fuchsia-800" />
                  <span>Respaldo Completo del Sistema (.JSON)</span>
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Incluye clientes, inventario, facturas y configuración listo para restaurar.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportJSON}
                className="px-4 py-2.5 bg-fuchsia-950 hover:bg-fuchsia-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Descargar .JSON</span>
              </button>
            </div>

            {/* Botón Respaldo Excel Maestro */}
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                  <span>Libro Maestro Completo (.XLSX)</span>
                </h4>
                <p className="text-[11px] text-emerald-800/80 mt-0.5">
                  Hojas individuales de Excel para Clientes, Inventario y Facturación.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportExcelMaster}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Descargar Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* TARJETA 2: RESTAURAR COPIA */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
          <div className="border-b border-stone-200 pb-3">
            <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-red-600" />
              <span>Restaurar Copia de Seguridad</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Carga un archivo <code className="bg-stone-100 px-1 py-0.5 rounded font-mono">.json</code> descargado previamente para restaurar tu información.
            </p>
          </div>

          <div className="space-y-4">
            {/* Input para subir archivo */}
            <div className="border-2 border-dashed border-stone-200 hover:border-red-400 p-6 rounded-2xl text-center cursor-pointer transition-colors bg-stone-50">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="restore-file-input"
              />
              <label htmlFor="restore-file-input" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                <span className="block text-xs font-semibold text-stone-700">
                  Haz clic para seleccionar tu archivo de respaldo (.json)
                </span>
                <span className="block text-[11px] text-stone-400">
                  Formato JSON exportado desde Ballón Dulces Klhoe
                </span>
              </label>
            </div>

            {/* Error si ocurre */}
            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {/* Vista previa antes de confirmar */}
            {importPreview && (
              <div className="p-4 bg-fuchsia-50/60 rounded-2xl border border-fuchsia-200 space-y-3 text-xs">
                <div className="flex items-center justify-between font-bold text-fuchsia-950">
                  <span>Respaldo Detectado:</span>
                  <span className="text-[11px] font-mono font-normal">
                    {new Date(importPreview.exportDate).toLocaleString('es-VE')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-stone-700 bg-white p-2.5 rounded-xl border border-fuchsia-100">
                  <div>• Clientes: <strong>{importPreview.clients?.length || 0}</strong></div>
                  <div>• Inventario: <strong>{importPreview.inventory?.length || 0}</strong></div>
                  <div>• Facturas: <strong>{importPreview.invoices?.length || 0}</strong></div>
                </div>

                <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-[11px]">
                  ⚠️ <strong>Atención:</strong> Al restaurar, se actualizará la base de datos local con los registros del archivo seleccionado.
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setImportPreview(null)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmRestore}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-xs"
                  >
                    Confirmar y Restaurar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TARJETA 3: DEJAR EL SITIO EN BLANCO (LISTO PARA DATOS NUEVOS) */}
      {onClearAllData && (
        <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <span>🧹</span>
                <span>Dejar Sitio en Blanco (Datos Nuevos)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xl">
                Limpia los clientes, productos y facturas locales actuales para comenzar a registrar la información real de tu negocio desde cero.
              </p>
            </div>
            <button
              type="button"
              onClick={onClearAllData}
              className="px-4 py-2.5 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 border border-stone-200 hover:border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              Dejar Sitio en Blanco
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
