import React from 'react';
import { AlertCircle, Download, FileSpreadsheet, X } from 'lucide-react';

interface EndOfMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExportExcel: () => void;
}

export const EndOfMonthModal: React.FC<EndOfMonthModalProps> = ({
  isOpen,
  onClose,
  onExportExcel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-red-500 space-y-4 text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-tr from-red-100 to-fuchsia-100 text-red-600 flex items-center justify-center animate-bounce">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
            Aviso Importante de Cierre
          </span>
          <h3 className="text-xl font-extrabold text-stone-900 mt-2">
            ÚLTIMO DÍA DEL MES
          </h3>
        </div>

        <div className="p-4 bg-red-50/70 border border-red-200/80 rounded-2xl text-stone-800 text-sm leading-relaxed">
          <p className="font-semibold text-red-800">
            Por favor descarga el <strong>EXPORTAR A EXCEL</strong>, de lo contrario perderás tu reporte de Mes.
          </p>
          <div className="mt-3 pt-3 border-t border-red-200/60 text-xs font-bold text-stone-700">
            Emprendimiento Ballón Dulces khloe • <span className="text-red-600 font-extrabold">J-508536371</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => {
              onExportExcel();
              onClose();
            }}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-xl font-bold text-sm shadow-md shadow-fuchsia-200 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <Download className="w-4 h-4" />
            <span>EXPORTAR A EXCEL AHORA</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Entendido / Cerrar Aviso
          </button>
        </div>
      </div>
    </div>
  );
};
