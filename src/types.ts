export interface Client {
  id: string;
  name: string;
  cedulaRif?: string;
  phone: string;
  address: string;
  createdAt: string; // ISO date
}

export type InventoryCategory =
  | 'Mobiliario'
  | 'Decoración'
  | 'Pasapalos'
  | 'Comestibles'
  | 'Equipos de sonido';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  quantity: number;
  price: number; // in USD
  imageUrl: string;
  updatedAt: string;
}

export type DocumentType = 'Factura' | 'Presupuesto' | 'Nota de Entrega';
export type InvoiceStatus = 'Pagada' | 'Pendiente' | 'Abonada';
export type PaymentMethod =
  | 'Efectivo $'
  | 'Pago Móvil'
  | 'Binance (USDT)'
  | 'Transferencia Bancaria'
  | 'Zelle'
  | 'Punto de Venta'
  | 'Mixto';

export interface InvoiceItem {
  id: string;
  inventoryId?: string;
  name: string;
  category?: string;
  quantity: number;
  unitPrice: number; // in USD
  total: number; // in USD
}

export interface InvoiceDocument {
  id: string; // e.g. DOC-2026-001
  documentNumber: string;
  type: DocumentType;
  status: InvoiceStatus;
  paymentMethod?: PaymentMethod | string;
  clientId: string;
  clientName: string;
  clientCedulaRif?: string;
  clientPhone: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotalUSD: number;
  ivaRate: number; // 0.16 or 0
  ivaUSD: number;
  totalUSD: number;
  bcvRate: number; // Bs per USD
  totalBs: number;
  notes: string;
  issueDate: string; // YYYY-MM-DD (Fecha real de emisión)
  eventDate?: string; // YYYY-MM-DD (Fecha en que se realiza el evento)
  issuerName?: string; // Nombre de quien realiza la facturación (Facturador/a)
  issuerCedula?: string; // Cédula o RIF de quien realiza la facturación
  issuerRole?: string; // Cargo o función (ej: Administrador, Cajero, Asesor)
  createdAt: string; // ISO timestamp
}

export interface BillingIssuer {
  id: string;
  name: string;
  cedula?: string;
  role?: string;
}

export interface BCVRateResponse {
  promedio: number;
  fechaActualizacion: string;
}

// Opción 1: Control de Alquileres, Entregas y Devoluciones
export type RentalStatus =
  | 'En Almacén'
  | 'En Evento (Calle)'
  | 'Devuelto Conforme'
  | 'Devuelto con Daños';

export type DamageSeverity = 'Leve' | 'Grave' | 'Pérdida Total';

export interface InspectionDamageItem {
  id: string;
  itemName: string;
  damageType:
    | 'Rotura'
    | 'Mancha Permanente'
    | 'Extravío / Pérdida'
    | 'Suciedad Extrema'
    | 'Cera de Velas / Quemadura'
    | 'Abolladura / Fractura';
  severity: DamageSeverity;
  chargeUSD: number;
  notes?: string;
}

export interface RentalInspection {
  id: string; // e.g. ALQ-2026-001
  invoiceId?: string;
  documentNumber: string; // Número de factura o nota asociada
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientCedulaRif?: string;
  eventLocation: string;
  dispatchDate: string; // YYYY-MM-DD
  expectedReturnDate: string; // YYYY-MM-DD
  actualReturnDate?: string;
  depositAmountUSD: number;
  status: RentalStatus;
  itemsDispatched: {
    inventoryId?: string;
    name: string;
    quantity: number;
    category?: string;
  }[];
  damages: InspectionDamageItem[];
  totalDamageChargeUSD: number;
  depositRefundUSD: number; // Monto a devolver al cliente
  pendingChargeUSD: number; // Monto adicional a cobrar al cliente si los daños superan el depósito
  inspectionNotes?: string;
  inspectedBy: string; // e.g. Lcdo. Josmar Puerta
  inspectedAt?: string;
  createdAt: string;
}

// Opción 2: Configuración de Pago Móvil & Cobranzas
export interface PagoMovilConfig {
  bankName: string;
  bankCode: string;
  idNumber: string; // e.g. 'V-26136645'
  phone: string;    // e.g. '04141234567'
  accountHolder: string; // e.g. 'Lcdo. Josmar Puerta'
  notes?: string;
}

// Opción 3: Carrito / Cotizador Rápido de Catálogo
export interface CatalogCartItem {
  item: InventoryItem;
  quantity: number;
}

// Estructura de Respaldo de Base de Datos
export interface BackupData {
  version: string;
  exportDate: string;
  appName: string;
  clients: Client[];
  inventory: InventoryItem[];
  invoices: InvoiceDocument[];
  rentals?: RentalInspection[];
  pagoMovilConfig?: PagoMovilConfig;
}
