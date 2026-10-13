import * as XLSX from 'xlsx';
import { InvoiceDocument } from '../types';

/**
 * Exporta directamente a un archivo .xlsx para descarga en el navegador
 */
export function exportInvoicesToExcel(invoices: InvoiceDocument[], monthLabel: string = 'Mes_Actual') {
  const data = invoices.map((inv) => ({
    'ID / N° Documento': inv.documentNumber,
    'Tipo': inv.type,
    'Estado': inv.status,
    'Fecha de Emisión': inv.issueDate,
    'Cliente': inv.clientName,
    'Teléfono': inv.clientPhone,
    'Dirección': inv.clientAddress,
    'Subtotal (USD)': inv.subtotalUSD.toFixed(2),
    'IVA 16% (USD)': inv.ivaUSD.toFixed(2),
    'Total (USD)': inv.totalUSD.toFixed(2),
    'Tasa BCV (Bs/$)': inv.bcvRate.toFixed(2),
    'Facturador(a)': inv.issuerName || 'Administración',
    'Cédula Facturador': inv.issuerCedula || 'N/A',
    'Cargo Facturador': inv.issuerRole || 'Administración / Caja',
    'Observaciones': inv.notes || '',
    'Cantidad de Ítems': inv.items.reduce((acc, it) => acc + it.quantity, 0),
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte Facturación');

  // Ajuste automático de anchos de columna
  const colWidths = [
    { wch: 16 }, // N°
    { wch: 14 }, // Tipo
    { wch: 12 }, // Estado
    { wch: 14 }, // Fecha
    { wch: 22 }, // Cliente
    { wch: 16 }, // Telefono
    { wch: 28 }, // Dirección
    { wch: 14 }, // Subtotal
    { wch: 14 }, // IVA
    { wch: 14 }, // Total USD
    { wch: 14 }, // Tasa BCV
    { wch: 16 }, // Total Bs
    { wch: 30 }, // Observaciones
    { wch: 16 }, // Cantidad
  ];
  worksheet['!cols'] = colWidths;

  const fileName = `Reporte_Ballon_Dulces_Klhoe_${monthLabel.replace(/\s+/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}
