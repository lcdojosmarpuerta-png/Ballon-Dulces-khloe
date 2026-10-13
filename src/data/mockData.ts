import { Client, InventoryItem, InvoiceDocument, PagoMovilConfig } from '../types';

/**
 * Sitio configurado en blanco listo para el ingreso de datos reales de la empresa.
 * Sin clientes ficticios, sin inventario de prueba y sin facturas de demostración.
 */
export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_INVOICES: InvoiceDocument[] = [];

export const DEFAULT_PAGO_MOVIL: PagoMovilConfig = {
  bankName: 'Banco Nacional de Crédito (0191)',
  bankCode: '0191',
  idNumber: 'J-508536371',
  phone: '04145057120',
  accountHolder: 'Emprendimiento Ballón Dulces khloe',
  notes: 'Favor enviar capture del comprobante con número de referencia bancaria visible.',
};
