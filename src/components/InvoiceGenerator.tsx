import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Printer, 
  Trash2, 
  Plus, 
  RotateCcw, 
  Save, 
  Search, 
  Scissors, 
  CheckCircle, 
  HelpCircle, 
  Sparkles, 
  Calendar, 
  DollarSign,
  CreditCard,
  MessageCircle,
  Copy,
  Check,
  X,
  Share2,
  AlertTriangle,
  User,
  UserCheck,
  BadgeCheck
} from 'lucide-react';
import { 
  Client, 
  DocumentType, 
  InventoryItem, 
  InvoiceDocument, 
  InvoiceItem, 
  InvoiceStatus,
  PaymentMethod,
  BillingIssuer
} from '../types';
import { PrintableInvoiceSheet } from './PrintableInvoiceSheet';
import { PrintModal } from './PrintModal';
import { BrandLogo } from './BrandLogo';
import { printInvoiceElement } from '../lib/printUtils';

interface InvoiceGeneratorProps {
  clients: Client[];
  inventory: InventoryItem[];
  bcvRate: number | null;
  onSaveInvoice: (invoice: InvoiceDocument) => void;
  activeInvoiceToEdit?: InvoiceDocument | null;
  onFinishEdit?: () => void;
  catalogItemsToImport?: InvoiceItem[] | null;
  onClearCatalogImport?: () => void;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  clients,
  inventory,
  bcvRate,
  onSaveInvoice,
  activeInvoiceToEdit,
  onFinishEdit,
  catalogItemsToImport,
  onClearCatalogImport,
}) => {
  // Función para obtener stock disponible del producto (alquileres removido)
  const getDispatchedQuantityForDate = (_inventoryId: string, _itemName: string, _targetDate: string): number => {
    return 0;
  };

  const getDispatchedQuantity = (_inventoryId: string, _itemName: string): number => {
    return 0;
  };

  // Document configuration state
  const [docType, setDocType] = useState<DocumentType>('Factura');
  const [status, setStatus] = useState<InvoiceStatus>('Pagada');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | string>('Efectivo $');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  // Fecha del Evento seleccionada (para calcular la disponibilidad de stock a esa fecha)
  const [eventDate, setEventDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  // Facturador(a): Datos de quien realiza la facturación (guardados en localStorage)
  const [issuerName, setIssuerName] = useState<string>(() => {
    return localStorage.getItem('bdk_last_issuer_name') || '';
  });
  const [issuerCedula, setIssuerCedula] = useState<string>(() => {
    return localStorage.getItem('bdk_last_issuer_cedula') || '';
  });
  const [issuerRole, setIssuerRole] = useState<string>(() => {
    return localStorage.getItem('bdk_last_issuer_role') || 'Administración';
  });
  const [savedIssuers, setSavedIssuers] = useState<BillingIssuer[]>(() => {
    try {
      const stored = localStorage.getItem('bdk_saved_issuers');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Error reading saved issuers:', e);
    }
    return [
      { id: 'iss-1', name: 'Lcdo. Josmar Puerta', cedula: 'V-19.876.543', role: 'Administrador' },
      { id: 'iss-2', name: 'María Gómez', cedula: 'V-24.123.456', role: 'Encargada de Facturación' },
      { id: 'iss-3', name: 'Caja Principal', cedula: 'J-508536371', role: 'Atención y Cobranzas' },
    ];
  });

  const [notes, setNotes] = useState<string>('');

  // Items in invoice
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // Search & add items
  const [searchItemTerm, setSearchItemTerm] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState<number>(0);
  const [manualQty, setManualQty] = useState<number>(1);
  const [showManualForm, setShowManualForm] = useState(false);

  // Modal para compartir datos de pago
  const [showPaymentDataModal, setShowPaymentDataModal] = useState(false);
  const [copiedPaymentData, setCopiedPaymentData] = useState(false);

  // Modal de Impresión y Descarga Oficial
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Mensaje Emergente: Control de Disponibilidad Real y Stock Insuficiente
  const [stockAlert, setStockAlert] = useState<{
    itemName: string;
    totalStock: number;
    dispatchedQty: number;
    availableStock: number;
    requestedQty: number;
    eventDate: string;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const currentRate = bcvRate && bcvRate > 0 ? bcvRate : 36.5;

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Cargar si viene para editar
  useEffect(() => {
    if (activeInvoiceToEdit) {
      setDocType(activeInvoiceToEdit.type);
      setStatus(activeInvoiceToEdit.status);
      setPaymentMethod(activeInvoiceToEdit.paymentMethod || 'Efectivo $');
      setSelectedClientId(activeInvoiceToEdit.clientId);
      setIssuerName(activeInvoiceToEdit.issuerName || localStorage.getItem('bdk_last_issuer_name') || '');
      setIssuerCedula(activeInvoiceToEdit.issuerCedula || localStorage.getItem('bdk_last_issuer_cedula') || '');
      setIssuerRole(activeInvoiceToEdit.issuerRole || localStorage.getItem('bdk_last_issuer_role') || 'Administración');
      setNotes(activeInvoiceToEdit.notes || '');
      setItems(activeInvoiceToEdit.items || []);
    }
  }, [activeInvoiceToEdit]);

  // Cargar si vienen artículos transferidos desde el Catálogo con validación de disponibilidad real
  useEffect(() => {
    if (catalogItemsToImport && catalogItemsToImport.length > 0) {
      let overstockItem: {
        name: string;
        total: number;
        dispatched: number;
        available: number;
        requested: number;
      } | null = null;

      const validatedItems = catalogItemsToImport.map((it) => {
        if (it.inventoryId) {
          const inv = inventory.find((i) => i.id === it.inventoryId);
          if (inv && inv.quantity !== undefined) {
            const dispatchedQty = getDispatchedQuantity(inv.id, inv.name);
            const realAvailable = Math.max(0, inv.quantity - dispatchedQty);
            if (it.quantity > realAvailable) {
              overstockItem = {
                name: it.name,
                total: inv.quantity,
                dispatched: dispatchedQty,
                available: realAvailable,
                requested: it.quantity,
              };
              const clampedQty = Math.max(0, realAvailable);
              return {
                ...it,
                quantity: clampedQty,
                total: clampedQty * it.unitPrice,
              };
            }
          }
        }
        return it;
      });

      setItems(validatedItems);

      if (overstockItem) {
        setStockAlert({
          itemName: (overstockItem as any).name,
          totalStock: (overstockItem as any).total,
          dispatchedQty: (overstockItem as any).dispatched,
          availableStock: (overstockItem as any).available,
          requestedQty: (overstockItem as any).requested,
          eventDate: eventDate,
        });
      } else {
        showToast(`✨ Se transfirieron ${catalogItemsToImport.length} artículos desde el Catálogo.`);
      }

      if (onClearCatalogImport) onClearCatalogImport();
    }
  }, [catalogItemsToImport, inventory, onClearCatalogImport, eventDate]);

  // Selección de cliente actual
  const currentClient = clients.find((c) => c.id === selectedClientId);

  // Cálculos automáticos
  const subtotalUSD = items.reduce((acc, it) => acc + it.total, 0);
  // La Nota de Entrega se genera sin impuestos (0%), Factura y Presupuesto tienen 16%
  const ivaRate = docType === 'Nota de Entrega' ? 0 : 0.16;
  const ivaUSD = subtotalUSD * ivaRate;
  const totalUSD = subtotalUSD + ivaUSD;
  const totalBs = totalUSD * currentRate;

  // Agregar desde Inventario con Condición de Disponibilidad Real (Inventario vs Despachado)
  const handleAddFromInventory = (inv: InventoryItem) => {
    const existingIndex = items.findIndex((it) => it.inventoryId === inv.id);
    const currentQty = existingIndex >= 0 ? items[existingIndex].quantity : 0;
    const requestedQty = currentQty + 1;

    const dispatchedQty = getDispatchedQuantity(inv.id, inv.name);
    const realAvailableStock = Math.max(0, inv.quantity - dispatchedQty);

    // Condición: Si sobrepasa la disponibilidad real (inventario menos despachado en eventos)
    if (requestedQty > realAvailableStock) {
      setStockAlert({
        itemName: inv.name,
        totalStock: inv.quantity,
        dispatchedQty,
        availableStock: realAvailableStock,
        requestedQty,
        eventDate: eventDate,
      });
      return;
    }

    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].unitPrice;
      setItems(updated);
    } else {
      const newItem: InvoiceItem = {
        id: `it-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        inventoryId: inv.id,
        name: inv.name,
        category: inv.category,
        quantity: 1,
        unitPrice: inv.price,
        total: inv.price,
      };
      setItems([...items, newItem]);
    }
    showToast(`"${inv.name}" agregado (${realAvailableStock - requestedQty} disp. restantes)`);
  };

  // Agregar Ítem Manual o Servicio Especial
  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || manualPrice <= 0) {
      showToast('⚠️ Ingresa el nombre del ítem y un precio válido.');
      return;
    }

    const newItem: InvoiceItem = {
      id: `it-${Date.now()}`,
      name: manualName.trim(),
      quantity: manualQty > 0 ? manualQty : 1,
      unitPrice: manualPrice,
      total: (manualQty > 0 ? manualQty : 1) * manualPrice,
    };

    setItems([...items, newItem]);
    setManualName('');
    setManualPrice(0);
    setManualQty(1);
    setShowManualForm(false);
    showToast('Ítem personalizado agregado');
  };

  // Modificar cantidad directamente con Validación de Disponibilidad Real
  const handleQuantityChange = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }

    const currentItem = items.find((it) => it.id === id);
    if (currentItem && currentItem.inventoryId) {
      const inv = inventory.find((i) => i.id === currentItem.inventoryId);
      if (inv) {
        const dispatchedQty = getDispatchedQuantity(inv.id, inv.name);
        const realAvailableStock = Math.max(0, inv.quantity - dispatchedQty);

        // Condición: Si sobrepasa la disponibilidad real
        if (newQty > realAvailableStock) {
          setStockAlert({
            itemName: currentItem.name,
            totalStock: inv.quantity,
            dispatchedQty,
            availableStock: realAvailableStock,
            requestedQty: newQty,
            eventDate: eventDate,
          });
          newQty = Math.max(0, realAvailableStock);
        }
      }
    }

    const updated = items.map((it) => {
      if (it.id === id) {
        return {
          ...it,
          quantity: newQty,
          total: newQty * it.unitPrice,
        };
      }
      return it;
    });
    setItems(updated);
  };

  // Eliminar ítem de la factura
  const handleRemoveItem = (id: string) => {
    setItems(items.filter((it) => it.id !== id));
  };

  // Botón Limpiar: limpia todos los campos
  const handleClear = () => {
    if (items.length > 0 && !window.confirm('¿Deseas limpiar todos los campos del documento actual?')) {
      return;
    }
    setDocType('Factura');
    setStatus('Pagada');
    setPaymentMethod('Efectivo $');
    setSelectedClientId('');
    setEventDate(new Date().toISOString().slice(0, 10));
    setNotes('');
    setItems([]);
    if (onFinishEdit) onFinishEdit();
    showToast('Formulario restablecido');
  };

  // Generador de mensaje de datos de pago
  const generatePaymentDetailsMessage = () => {
    let msg = `🎈 *EMPRENDIMIENTO BALLÓN DULCES KHLOE* 🎈\n`;
    msg += `_"Detalles que marcan la diferencia en tu fiesta"_\n`;
    msg += `💳 *DATOS OFICIALES PARA PAGOS Y TRANSFERENCIAS* 💳\n`;
    msg += `-------------------------------------------------\n`;
    if (currentClient) {
      msg += `👤 *Cliente:* ${currentClient.name} ${currentClient.cedulaRif ? `(${currentClient.cedulaRif})` : ''}\n`;
    }
    msg += `📄 *Documento:* ${docType} (${activeInvoiceToEdit?.documentNumber || 'Por emitir'})\n`;
    msg += `💰 *Monto en Dólares:* $${totalUSD.toFixed(2)} USD\n`;
    msg += `🇻🇪 *Tasa Oficial BCV:* ${currentRate.toFixed(2)} Bs/USD\n`;
    msg += `💵 *Total a Cancelar en Bs:* ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.\n`;
    msg += `📌 *Método Seleccionado:* ${paymentMethod}\n`;
    msg += `-------------------------------------------------\n\n`;

    msg += `📲 *PAGO MÓVIL (OFICIAL):*\n`;
    msg += `• Banco: Banco Nacional de Crédito (BNC 0191)\n`;
    msg += `• Teléfono: 04145057120\n`;
    msg += `• C.I / RIF: J-508536371\n`;
    msg += `• Titular: Emprendimiento Ballón Dulces khloe\n\n`;

    msg += `🟡 *BINANCE PAY:*\n`;
    msg += `• Teléfono / ID: 04145057120\n`;
    msg += `• Usuario: Morabia18\n\n`;

    msg += `🔵 *ZELLE:*\n`;
    msg += `• Cuenta / Identificador: ReySantaella9122205630\n\n`;

    msg += `🏦 *TRANSFERENCIA BANCARIA:*\n`;
    msg += `• Banco: Banco Nacional de Crédito (BNC 0191)\n`;
    msg += `• Titular: Emprendimiento Ballón Dulces khloe\n`;
    msg += `• RIF: J-508536371\n\n`;

    msg += `💵 *EFECTIVO EN DIVISAS ($):*\n`;
    msg += `• Recepción directa en tienda o en el evento (billetes en buen estado sin roturas).\n\n`;

    msg += `-------------------------------------------------\n`;
    msg += `⚠️ *IMPORTANTE:* Una vez efectuado el pago, favor enviar el comprobante o captura de pantalla a este chat para confirmar y validar su reserva. ¡Muchas gracias!`;
    return msg;
  };

  const handleSendPaymentWhatsApp = () => {
    const text = generatePaymentDetailsMessage();
    let targetPhone = currentClient?.phone ? currentClient.phone.replace(/[^0-9]/g, '') : '';
    if (targetPhone.startsWith('0')) {
      targetPhone = `58${targetPhone.slice(1)}`;
    } else if (targetPhone && !targetPhone.startsWith('58')) {
      targetPhone = `58${targetPhone}`;
    }

    const whatsappUrl = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(whatsappUrl, '_blank');
    setShowPaymentDataModal(false);
  };

  const handleCopyPaymentData = () => {
    const text = generatePaymentDetailsMessage();
    navigator.clipboard.writeText(text);
    setCopiedPaymentData(true);
    setTimeout(() => setCopiedPaymentData(false), 2500);
  };

  // Botón Único Solicitado: "Generar Factura" (guarda e imprime automáticamente)
  const handleGenerateInvoice = () => {
    let clientToUse = currentClient;
    if (!clientToUse) {
      if (clients.length > 0) {
        clientToUse = clients[0];
        setSelectedClientId(clients[0].id);
      } else {
        showToast('⚠️ Por favor selecciona o registra un cliente para generar el documento.');
        return;
      }
    }

    if (items.length === 0) {
      showToast('⚠️ Debes agregar al menos un ítem o servicio a la factura.');
      return;
    }

    // Validación de stock disponible
    for (const it of items) {
      if (it.inventoryId) {
        const inv = inventory.find((i) => i.id === it.inventoryId);
        if (inv) {
          const dispatchedQty = getDispatchedQuantity(inv.id, inv.name);
          const realAvailableStock = Math.max(0, inv.quantity - dispatchedQty);
          if (it.quantity > realAvailableStock) {
            setStockAlert({
              itemName: it.name,
              totalStock: inv.quantity,
              dispatchedQty,
              availableStock: realAvailableStock,
              requestedQty: it.quantity,
              eventDate: eventDate,
            });
            return;
          }
        }
      }
    }

    const docPrefix = docType === 'Factura' ? 'FACT' : docType === 'Nota de Entrega' ? 'NE' : 'PRES';
    const randomNum = Math.floor(100 + Math.random() * 900);
    const documentNumber = activeInvoiceToEdit
      ? activeInvoiceToEdit.documentNumber
      : `${docPrefix}-${new Date().getFullYear()}-${randomNum}`;
    const finalIssuerName = issuerName.trim() || 'Administración';
    const finalIssuerCedula = issuerCedula.trim() || undefined;
    const finalIssuerRole = issuerRole.trim() || undefined;

    const newDoc: InvoiceDocument = {
      id: activeInvoiceToEdit ? activeInvoiceToEdit.id : `doc-${Date.now()}`,
      documentNumber,
      type: docType,
      status,
      paymentMethod,
      clientId: clientToUse.id,
      clientName: clientToUse.name,
      clientCedulaRif: clientToUse.cedulaRif,
      clientPhone: clientToUse.phone,
      clientAddress: clientToUse.address,
      items,
      subtotalUSD,
      ivaRate,
      ivaUSD,
      totalUSD,
      bcvRate: currentRate,
      totalBs,
      notes: notes.trim(),
      issueDate: new Date().toISOString().slice(0, 10),
      eventDate: eventDate,
      issuerName: finalIssuerName,
      issuerCedula: finalIssuerCedula,
      issuerRole: finalIssuerRole,
      createdAt: activeInvoiceToEdit ? activeInvoiceToEdit.createdAt : new Date().toISOString(),
    };

    // Guardar datos completos del facturador(a) en localStorage para próximas emisiones
    if (issuerName.trim()) {
      localStorage.setItem('bdk_last_issuer_name', finalIssuerName);
      if (finalIssuerCedula) localStorage.setItem('bdk_last_issuer_cedula', finalIssuerCedula);
      if (finalIssuerRole) localStorage.setItem('bdk_last_issuer_role', finalIssuerRole);

      // Guardar en la lista de facturadores frecuentes
      setSavedIssuers((prev) => {
        const exists = prev.some((p) => p.name.toLowerCase() === finalIssuerName.toLowerCase());
        if (!exists) {
          const updated = [
            ...prev,
            {
              id: `iss-${Date.now()}`,
              name: finalIssuerName,
              cedula: finalIssuerCedula,
              role: finalIssuerRole,
            },
          ];
          localStorage.setItem('bdk_saved_issuers', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }

    onSaveInvoice(newDoc);
    showToast(`✅ ${docType} ${documentNumber} generada y guardada con éxito`);
    setShowPrintModal(true);
    if (onFinishEdit) onFinishEdit();
  };

  // Filtrado de inventario para añadir rápido
  const filteredInventoryToAdd = inventory.filter((inv) =>
    inv.name.toLowerCase().includes(searchItemTerm.toLowerCase()) ||
    inv.category.toLowerCase().includes(searchItemTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-800 text-sm no-print">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* EDIT MODE BANNER */}
      {activeInvoiceToEdit && (
        <div className="no-print p-3.5 bg-fuchsia-50 border border-fuchsia-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-fuchsia-950">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <span className="font-semibold">
              Editando documento existente: <strong className="font-mono text-red-600">{activeInvoiceToEdit.documentNumber}</strong> ({activeInvoiceToEdit.type})
            </span>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
          >
            Cancelar Edición / Nuevo Documento
          </button>
        </div>
      )}

      {/* HEADER (No-Print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-sky-100 shadow-xs">
        <div className="flex items-center gap-3.5">
          <BrandLogo size="md" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                Módulo 3 • Facturación
              </span>
              <span className="text-xs text-pink-600 font-script font-bold hidden sm:inline">
                • Ballón Dulces khloe
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 flex items-center gap-2 mt-0.5">
              <Receipt className="w-5 h-5 text-sky-600" />
              <span>Generar Factura / Presupuesto</span>
            </h2>
            <p className="text-xs text-stone-500">
              Facturas fiscales (IVA 16%), Notas de Entrega sin impuestos y Presupuestos con tasa oficial BCV.
            </p>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowPaymentDataModal(true)}
            id="btn-share-payment-data"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-stone-200 shadow-2xs"
            title="Compartir datos bancarios y formas de pago con el cliente"
          >
            <CreditCard className="w-3.5 h-3.5 text-fuchsia-600" />
            <span>Datos para Pagos</span>
          </button>

          <button
            onClick={handleClear}
            id="btn-clear-invoice"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            title="Limpia todos los campos del documento"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>

          {/* Botón Solicitado: Sustituye Imprimir y Guardar por 'Generar Factura' */}
          <button
            onClick={handleGenerateInvoice}
            id="btn-generate-invoice"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 via-pink-500 to-amber-400 hover:from-sky-600 hover:to-amber-500 text-white rounded-xl text-xs font-black shadow-md shadow-sky-200 hover:shadow-lg transition-all cursor-pointer transform hover:scale-102 active:scale-98"
            title="Guarda la factura en la base de datos y abre inmediatamente el diálogo de impresión oficial (Carta y Ticket Fiscal Láser)"
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Generar {docType}</span>
          </button>
        </div>
      </div>

      {/* CONTROLES DE EMISIÓN (No-Print) */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Izquierda: Parámetros del Documento y Cliente */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-sky-100 shadow-xs space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-sky-50 pb-2">
            1. Datos del Documento
          </h3>

          {/* Tipo de Documento */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Tipo de Documento *
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-medium">
              {(['Factura', 'Presupuesto', 'Nota de Entrega'] as DocumentType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDocType(t)}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer truncate ${
                    docType === t
                      ? 'bg-gradient-to-r from-red-600 to-fuchsia-600 text-white font-semibold shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              {docType === 'Nota de Entrega'
                ? '⭐ La Nota de Entrega se genera SIN IMPUESTOS (0% IVA).'
                : '⭐ Aplica 16% de IVA sobre el subtotal.'}
            </p>
          </div>

          {/* Estado del Documento */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Estado de Pago *
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-medium">
              {(['Pagada', 'Pendiente', 'Abonada'] as InvoiceStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer ${
                    status === s
                      ? s === 'Pagada'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : s === 'Abonada'
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'bg-red-600 text-white font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Método de Pago *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
            >
              <option value="Efectivo $">💵 Efectivo en Dólares ($)</option>
              <option value="Pago Móvil">📲 Pago Móvil (Bs)</option>
              <option value="Binance (USDT)">🟡 Binance Pay (USDT)</option>
              <option value="Transferencia Bancaria">🏦 Transferencia Bancaria (Bs)</option>
              <option value="Zelle">💳 Zelle ($)</option>
              <option value="Punto de Venta">💳 Punto de Venta (Tarjeta)</option>
              <option value="Mixto">🔀 Pago Mixto (Divisas / Bs)</option>
            </select>
          </div>

          {/* Selección de Cliente */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Seleccionar Cliente *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
            >
              <option value="">-- Elige un cliente registrado --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.cedulaRif ? `(${c.cedulaRif})` : ''} - {c.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha del Evento */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center justify-between">
              <span>Fecha del Evento *</span>
              <span className="text-[10px] text-sky-700 font-normal">
                Emisión real: Hoy ({new Date().toISOString().slice(0, 10)})
              </span>
            </label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 font-mono font-bold text-stone-800"
            />
            <p className="text-[10.5px] text-stone-500 mt-1 leading-tight">
              📅 La disponibilidad de stock se calcula para esta fecha del evento.
            </p>
          </div>

          {/* ÍTEM SOLICITADO: Facturador(a) - Datos de quien realiza la facturación */}
          <div className="p-3.5 bg-gradient-to-r from-sky-50/90 via-pink-50/70 to-amber-50/70 rounded-2xl border-2 border-sky-200/90 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <span className="p-1 rounded-lg bg-sky-100 text-sky-700">👤</span>
                <span>Facturador(a)</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200 shadow-2xs">
                <BadgeCheck className="w-3 h-3 text-sky-600" />
                <span>Guardado permanente</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-600 leading-tight">
              Ingresa los datos de quien realiza la facturación. Quedarán guardados en el sistema y en el documento oficial.
            </p>

            {/* Selector Rápido de Facturadores Frecuentes Guardados */}
            {savedIssuers.length > 0 && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  ⚡ Facturadores Registrados:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {savedIssuers.map((iss) => {
                    const isSelected = issuerName.trim().toLowerCase() === iss.name.trim().toLowerCase();
                    return (
                      <button
                        key={iss.id}
                        type="button"
                        onClick={() => {
                          setIssuerName(iss.name);
                          if (iss.cedula) setIssuerCedula(iss.cedula);
                          if (iss.role) setIssuerRole(iss.role);
                          localStorage.setItem('bdk_last_issuer_name', iss.name);
                          if (iss.cedula) localStorage.setItem('bdk_last_issuer_cedula', iss.cedula);
                          if (iss.role) localStorage.setItem('bdk_last_issuer_role', iss.role);
                          showToast(`👤 Facturador(a) seleccionado: ${iss.name}`);
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-xl font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-sky-600 text-white shadow-xs scale-102 ring-2 ring-sky-300'
                            : 'bg-white text-slate-700 hover:bg-sky-50 border border-sky-200/80'
                        }`}
                        title={`${iss.name} - ${iss.cedula || ''} (${iss.role || ''})`}
                      >
                        <UserCheck className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[120px]">{iss.name}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setIssuerName('');
                      setIssuerCedula('');
                      setIssuerRole('Facturación');
                    }}
                    className="text-[10.5px] px-2 py-0.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 border border-dashed border-slate-300 transition-colors cursor-pointer"
                    title="Limpiar campos para registrar un nuevo facturador"
                  >
                    + Nuevo
                  </button>
                </div>
              </div>
            )}

            {/* Campos de Datos de Quien Realiza la Facturación */}
            <div className="space-y-2 pt-1">
              <div>
                <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lcdo. Josmar Puerta / Ana Rojas"
                  value={issuerName}
                  onChange={(e) => {
                    setIssuerName(e.target.value);
                    localStorage.setItem('bdk_last_issuer_name', e.target.value);
                  }}
                  className="w-full px-3 py-1.5 bg-white border border-sky-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 shadow-xs placeholder:text-stone-400 placeholder:font-normal"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                    Cédula / Identificación
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: V-19.876.543"
                    value={issuerCedula}
                    onChange={(e) => {
                      setIssuerCedula(e.target.value);
                      localStorage.setItem('bdk_last_issuer_cedula', e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 shadow-xs placeholder:text-stone-400 placeholder:font-normal"
                  />
                </div>

                <div>
                  <label className="block text-[10.5px] font-bold text-slate-700 mb-0.5">
                    Cargo / Rol
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Administrador / Caja"
                    value={issuerRole}
                    onChange={(e) => {
                      setIssuerRole(e.target.value);
                      localStorage.setItem('bdk_last_issuer_role', e.target.value);
                    }}
                    className="w-full px-2.5 py-1.5 bg-white border border-sky-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 shadow-xs placeholder:text-stone-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </div>

            <div className="p-1.5 bg-white/80 rounded-lg border border-sky-200/60 text-[10px] text-slate-600 flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>
                Datos activos: <strong>{issuerName || 'Sin asignar'}</strong>
                {issuerCedula ? ` (${issuerCedula})` : ''} • {issuerRole || 'Administración'}
              </span>
            </div>
          </div>

          {/* Caja de Texto: Observaciones */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Observaciones (Detalle adicional en la factura)
            </label>
            <textarea
              rows={3}
              placeholder="Ej. Entrega a las 3:00 PM. Desmontaje a las 11:00 PM. Se incluye depósito de garantía..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 resize-none"
            />
          </div>

          {/* Aviso Términos y Condiciones */}
          <div className="p-2.5 bg-fuchsia-50/60 rounded-xl border border-fuchsia-200/70 text-[11px] text-fuchsia-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-700">
              <Sparkles className="w-3.5 h-3.5 text-fuchsia-600" />
              <span>Términos y Condiciones de Alquiler</span>
            </div>
            <p className="text-[10.5px] text-stone-600 leading-tight">
              La factura emitida integra de forma oficial las cláusulas de <strong>Daños, Pérdidas y Limpieza</strong> con espacio para firmas conformes del cliente y de la agencia.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Búsqueda y Adición de Ítems */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-fuchsia-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-fuchsia-50 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-fuchsia-950">
                2. Adición de Equipos y Servicios del Inventario
              </h3>
              <button
                type="button"
                onClick={() => setShowManualForm(!showManualForm)}
                className="text-xs font-semibold text-fuchsia-600 hover:text-fuchsia-700 cursor-pointer"
              >
                {showManualForm ? '- Ocultar personalizado' : '+ Ítem / Servicio personalizado'}
              </button>
            </div>

            {/* Formulario Manual Opcional */}
            {showManualForm && (
              <form
                onSubmit={handleAddManualItem}
                className="p-3.5 bg-fuchsia-50/50 rounded-xl border border-fuchsia-200/60 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Descripción del Servicio / Ítem
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Transporte y Montaje especial en sitio..."
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Precio Unitario ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.1"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] font-semibold text-stone-600">
                      Cantidad:
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={manualQty}
                      onChange={(e) => setManualQty(parseInt(e.target.value) || 1)}
                      className="w-16 px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Agregar Ítem
                  </button>
                </div>
              </form>
            )}

            {/* Búsqueda en Inventario */}
            <div className="space-y-2">
              {/* Indicador de Disponibilidad por Fecha del Evento */}
              <div className="p-2.5 px-3.5 bg-gradient-to-r from-red-50/80 via-white to-fuchsia-50/80 rounded-xl border border-fuchsia-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-600 shrink-0" />
                  <span className="text-stone-700">
                    Fecha agendada para el evento:
                  </span>
                  <strong className="font-mono text-fuchsia-950 bg-fuchsia-100/70 px-2 py-0.5 rounded border border-fuchsia-200">
                    {eventDate}
                  </strong>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">
                  ✅ Stock disponible en tiempo real
                </span>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar en inventario (mobiliario, pasapalos, decoración...)"
                  value={searchItemTerm}
                  onChange={(e) => setSearchItemTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30"
                />
              </div>

              {/* Lista compacta de inventario con stock en tiempo real */}
              <div className="max-h-56 overflow-y-auto divide-y divide-stone-100 border border-stone-200/80 rounded-xl bg-stone-50/40">
                {filteredInventoryToAdd.map((inv) => {
                  const dispatchedQty = getDispatchedQuantity(inv.id, inv.name);
                  const realAvailable = Math.max(0, inv.quantity - dispatchedQty);
                  const itemInInvoice = items.find((it) => it.inventoryId === inv.id);
                  const inInvoiceCount = itemInInvoice ? itemInInvoice.quantity : 0;
                  const remainingToInvoice = Math.max(0, realAvailable - inInvoiceCount);
                  const isOutOfStock = realAvailable <= 0;
                  const isLimitReached = remainingToInvoice <= 0;

                  return (
                    <div
                      key={inv.id}
                      className="p-2.5 px-3 flex items-center justify-between text-xs hover:bg-white transition-colors gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={inv.imageUrl}
                          alt={inv.name}
                          className="w-9 h-9 rounded-lg object-cover shrink-0 border border-stone-200"
                          referrerPolicy="no-referrer"
                        />
                        <div className="truncate">
                          <span className="font-semibold text-stone-800 block truncate text-xs">
                            {inv.name}
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-stone-400">
                              {inv.category}
                            </span>
                            {isOutOfStock ? (
                              <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-red-100 text-red-700 border border-red-200">
                                ⛔ 0 disp. reales ({dispatchedQty > 0 ? `${dispatchedQty} despachadas` : 'Agotado'})
                              </span>
                            ) : isLimitReached ? (
                              <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                ⚠️ Límite en factura ({realAvailable} disp. reales)
                              </span>
                            ) : remainingToInvoice <= 3 ? (
                              <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                Quedan {remainingToInvoice} disp. reales (de {realAvailable})
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ✓ {remainingToInvoice} disp. reales
                              </span>
                            )}

                            {/* Desglose de Inventario y Despachado */}
                            <span className="text-[9.5px] text-stone-400 font-mono">
                              • Total: {inv.quantity}
                              {dispatchedQty > 0 && ` | Despachado en calle: ${dispatchedQty}`}
                            </span>

                            {inInvoiceCount > 0 && (
                              <span className="text-[9.5px] font-bold text-fuchsia-700">
                                • En factura: {inInvoiceCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <span className="font-bold text-red-600 font-mono text-xs">
                          ${inv.price.toFixed(2)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddFromInventory(inv)}
                          className={`p-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 border ${
                            isLimitReached
                              ? 'bg-stone-100 text-stone-400 border-stone-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                              : 'bg-fuchsia-50 hover:bg-gradient-to-r hover:from-red-600 hover:to-fuchsia-600 hover:text-white text-fuchsia-700 border-fuchsia-200/80 shadow-2xs'
                          }`}
                          title={isLimitReached ? 'Disponibilidad real alcanzada para este ítem' : 'Añadir ítem a la factura'}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isLimitReached ? 'Agotado' : 'Añadir'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* TABLA DE ÍTEMS AGREGADOS AL DOCUMENTO */}
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
                Ítems Seleccionados en Documento ({items.length})
              </h4>

              {items.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-stone-200 rounded-2xl text-stone-400 text-xs">
                  No hay ítems agregados. Selecciona artículos del inventario arriba o agrega un servicio personalizado.
                </div>
              ) : (
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 uppercase text-[10px] tracking-wider border-b border-stone-200">
                      <tr>
                        <th className="py-2.5 px-3">Descripción</th>
                        <th className="py-2.5 px-2 text-center w-28">Cant.</th>
                        <th className="py-2.5 px-3 text-right">P. Unit ($)</th>
                        <th className="py-2.5 px-3 text-right">Total ($)</th>
                        <th className="py-2.5 px-2 text-center w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {items.map((it) => {
                        const inv = it.inventoryId ? inventory.find((i) => i.id === it.inventoryId) : undefined;
                        const dispatchedQty = inv ? getDispatchedQuantity(inv.id, inv.name) : 0;
                        const realAvailable = inv ? Math.max(0, inv.quantity - dispatchedQty) : undefined;
                        const isExceeding = realAvailable !== undefined && it.quantity > realAvailable;
                        const isAtMax = realAvailable !== undefined && it.quantity === realAvailable;

                        return (
                          <tr key={it.id} className={`hover:bg-fuchsia-50/20 ${isExceeding ? 'bg-red-50/60' : ''}`}>
                            <td className="py-2.5 px-3">
                              <span className="font-semibold text-stone-800 block text-xs">
                                {it.name}
                              </span>
                              {inv && realAvailable !== undefined && (
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span
                                    className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-md border ${
                                      isExceeding
                                        ? 'bg-red-100 text-red-700 border-red-300 font-bold animate-pulse'
                                        : isAtMax
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                  >
                                    Disponibilidad real: {realAvailable} uds
                                  </span>
                                  <span className="text-[9.5px] text-stone-400 font-mono">
                                    (Stock total: {inv.quantity} • Despachado: {dispatchedQty})
                                  </span>
                                  {isExceeding && (
                                    <span className="text-[9.5px] font-bold text-red-600 flex items-center gap-1">
                                      <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
                                      ¡Excede disponibilidad real!
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <div className="inline-flex flex-col items-center">
                                <input
                                  type="number"
                                  min="1"
                                  max={realAvailable}
                                  value={it.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      it.id,
                                      parseInt(e.target.value) || 1
                                    )
                                  }
                                  className={`w-16 text-center px-1.5 py-1 border rounded-lg text-xs font-mono font-bold ${
                                    isExceeding
                                      ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-200'
                                      : 'border-stone-200 bg-white text-stone-900 focus:border-fuchsia-500'
                                  }`}
                                />
                                {realAvailable !== undefined && (
                                  <span className="text-[9px] text-stone-400 font-mono mt-0.5">
                                    Máx: {realAvailable}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono text-stone-600 text-xs">
                              ${it.unitPrice.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900 text-xs">
                              ${it.total.toFixed(2)}
                            </td>
                            <td className="py-2.5 px-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(it.id)}
                                className="text-stone-400 hover:text-red-600 cursor-pointer p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="Quitar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* RESUMEN DE TOTALES Y TASA BCV */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal Ítems:</span>
                <span className="font-mono font-semibold">${subtotalUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>
                  IVA ({docType === 'Nota de Entrega' ? '0% Exento' : '16%'}):
                </span>
                <span className="font-mono font-semibold">${ivaUSD.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-900 text-sm font-bold border-t border-stone-200 pt-2">
                <span>Total Final en USD:</span>
                <span className="font-mono text-red-600 font-extrabold">${totalUSD.toFixed(2)}</span>
              </div>

              {/* CONVERSIÓN BCV */}
              <div className="flex justify-between items-center text-xs bg-white p-2.5 rounded-lg border border-stone-200/80 mt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">
                    Tasa Oficial BCV
                  </span>
                  <span className="font-mono text-stone-700">
                    1 USD = {currentRate.toFixed(2)} Bs
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-fuchsia-700 block">
                    Monto en Bolívares (Bs)
                  </span>
                  <span className="text-base font-extrabold text-stone-900 font-mono">
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
        </div>
      </div>

      {/* 
        ========================================================================
        VISTA DE IMPRESIÓN Y PREVISUALIZACIÓN:
        Formato Tamaño Carta (Letter) en Orientación Horizontal (Landscape).
        Layout de 2 secciones iguales: Lado 1: ORIGINAL | Lado 2: COPIA.
        Separadas por línea punteada de corte con tijera.
        Se ajusta estrictamente a UNA SOLA PÁGINA.
        ========================================================================
      */}
      <div className="space-y-2 mt-8">
        <div className="no-print flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-red-600 to-fuchsia-600" />
            <h3 className="text-sm font-bold text-stone-800">
              Vista Previa de Impresión (Formato Carta Horizontal - Original y Copia)
            </h3>
          </div>
          <span className="text-xs text-stone-400 italic">
            Cumple con @page letter landscape y encaje en 1 hoja
          </span>
        </div>

        {/* CONTENEDOR IMPRIMIBLE (ID: printable-invoice-sheet) */}
        <PrintableInvoiceSheet
          onOpenPrintModal={() => setShowPrintModal(true)}
          data={{
            documentNumber: activeInvoiceToEdit
              ? activeInvoiceToEdit.documentNumber
              : `${docType === 'Factura' ? 'FACT' : docType === 'Nota de Entrega' ? 'NE' : 'PRES'}-001`,
            type: docType,
            status: status,
            paymentMethod: paymentMethod,
            issueDate: new Date().toISOString().slice(0, 10),
            eventDate: eventDate,
            clientName: currentClient?.name || 'Cliente sin registrar',
            clientCedulaRif: currentClient?.cedulaRif,
            clientPhone: currentClient?.phone || 'N/A',
            clientAddress: currentClient?.address || 'Entrega en tienda / Por coordinar',
            items: items,
            subtotalUSD: subtotalUSD,
            ivaRate: ivaRate,
            ivaUSD: ivaUSD,
            totalUSD: totalUSD,
            bcvRate: currentRate,
            totalBs: totalBs,
            notes: notes,
            issuerName: issuerName.trim() || 'Administración / Tienda',
            issuerCedula: issuerCedula.trim() || undefined,
            issuerRole: issuerRole.trim() || undefined,
          }}
        />
      </div>

      {/* MODAL: COMPARTIR DATOS PARA PAGOS */}
      {showPaymentDataModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-fuchsia-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-fuchsia-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-fuchsia-600 text-white flex items-center justify-center shadow-md shadow-fuchsia-200">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Datos Oficiales para Pagos
                  </h3>
                  <p className="text-xs text-stone-500">
                    Cuentas bancarias, Pago Móvil, Binance Pay y Zelle de Ballón Dulces Klhoe
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentDataModal(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumen del Monto a Pagar */}
            <div className="p-3.5 bg-gradient-to-r from-red-50/70 via-white to-fuchsia-50/70 rounded-2xl border border-fuchsia-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Total de este Comprobante ({paymentMethod})
                </span>
                <span className="text-2xl font-extrabold text-red-600 font-mono">
                  ${totalUSD.toFixed(2)} USD
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-stone-500 block">
                  Tasa Oficial BCV: <strong className="font-mono">{currentRate.toFixed(2)} Bs</strong>
                </span>
                <span className="text-lg font-bold text-stone-900 font-mono">
                  {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Bs.
                </span>
              </div>
            </div>

            {/* Tarjetas Visuales de Formas de Pago Oficiales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {/* Tarjeta Pago Móvil */}
              <div className="p-3 bg-fuchsia-50/70 rounded-2xl border border-fuchsia-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-fuchsia-950 flex items-center gap-1">
                    <span>📲</span> Pago Móvil
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('0191 04145057120 J-508536371');
                      showToast('Datos Pago Móvil BNC copiados');
                    }}
                    className="text-[10px] text-fuchsia-700 hover:text-fuchsia-900 font-semibold bg-white px-2 py-0.5 rounded-lg border border-fuchsia-200 cursor-pointer"
                  >
                    Copiar
                  </button>
                </div>
                <div className="text-[11px] text-stone-700 space-y-0.5 font-mono">
                  <div><strong>BNC (0191)</strong></div>
                  <div>Tlf: 0414-5057120</div>
                  <div>RIF: J-508536371</div>
                </div>
              </div>

              {/* Tarjeta Binance Pay */}
              <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 flex items-center gap-1">
                    <span>🟡</span> Binance Pay
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('Binance: 04145057120 / Usuario: Morabia18');
                      showToast('Datos de Binance copiados');
                    }}
                    className="text-[10px] text-amber-800 hover:text-amber-950 font-semibold bg-white px-2 py-0.5 rounded-lg border border-amber-200 cursor-pointer"
                  >
                    Copiar
                  </button>
                </div>
                <div className="text-[11px] text-stone-700 space-y-0.5 font-mono">
                  <div>Tlf: <strong>04145057120</strong></div>
                  <div>Usuario: <strong>Morabia18</strong></div>
                </div>
              </div>

              {/* Tarjeta Zelle */}
              <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-950 flex items-center gap-1">
                    <span>🔵</span> Zelle
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText('ReySantaella9122205630');
                      showToast('Datos de Zelle copiados');
                    }}
                    className="text-[10px] text-sky-700 hover:text-sky-900 font-semibold bg-white px-2 py-0.5 rounded-lg border border-sky-200 cursor-pointer"
                  >
                    Copiar
                  </button>
                </div>
                <div className="text-[11px] text-stone-700 space-y-0.5 font-mono">
                  <div>Cuenta / Destinatario:</div>
                  <strong className="text-sky-950 break-all">ReySantaella9122205630</strong>
                </div>
              </div>
            </div>

            {/* Previsualización del texto a enviar */}
            <div>
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wide block mb-1">
                Mensaje con Coordenadas Bancarias
              </span>
              <pre className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-[11px] text-stone-800 font-mono max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                {generatePaymentDetailsMessage()}
              </pre>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleCopyPaymentData}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-stone-300 hover:border-fuchsia-400 text-stone-700 hover:text-fuchsia-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                {copiedPaymentData ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>¡Datos Copiados!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Datos Bancarios</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSendPaymentWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-emerald-200 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {currentClient?.phone ? `Enviar por WhatsApp a ${currentClient.name}` : 'Enviar por WhatsApp'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MENSAJE EMERGENTE: STOCK INSUFICIENTE / YA NO CUENTA CON CANTIDAD SUFICIENTE */}
      {stockAlert && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-xs">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                  Control de Inventario
                </span>
                <h3 className="text-base font-bold text-stone-900 mt-0.5">
                  Stock Insuficiente
                </h3>
              </div>
            </div>

            {/* Mensaje Solicitado Explícitamente por el Usuario */}
            <div className="p-3.5 bg-red-50/90 border border-red-200 rounded-2xl text-center space-y-1">
              <p className="text-sm font-bold text-red-900 leading-snug">
                ⚠️ Ya no cuenta con la cantidad suficiente para facturar
              </p>
              <p className="text-[11px] text-red-700">
                Disponibilidad calculada para la fecha del evento: <strong className="font-mono font-bold text-stone-900">{stockAlert.eventDate}</strong>
              </p>
            </div>

            {/* Detalle del Ítem, Stock Total, Despachado y Disponibilidad Real */}
            <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5 text-xs text-stone-700">
              <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                <span className="text-stone-500 font-medium">Artículo / Mobiliario:</span>
                <strong className="text-stone-900 font-semibold truncate max-w-[200px]">
                  {stockAlert.itemName}
                </strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Stock Total en Inventario:</span>
                <span className="font-mono font-bold text-stone-800 bg-stone-200/60 px-2 py-0.5 rounded border border-stone-300">
                  {stockAlert.totalStock} uds.
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Material Ocupado para esa Fecha:</span>
                <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {stockAlert.dispatchedQty} uds.
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-stone-200">
                <span className="text-stone-700 font-bold">Disponible Real para el Evento ({stockAlert.eventDate}):</span>
                <span className={`font-mono font-extrabold px-2.5 py-0.5 rounded border ${
                  stockAlert.availableStock > 0
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-red-700 bg-red-50 border-red-200'
                }`}>
                  {stockAlert.availableStock} uds.
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Cantidad que Intentas Facturar:</span>
                <span className="font-mono font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                  {stockAlert.requestedQty} uds.
                </span>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 leading-relaxed text-center">
              El sistema calculó la disponibilidad real tomando como referencia la fecha del evento (<strong>{stockAlert.eventDate}</strong>) y restando el material reservado o despachado en esa fecha ({stockAlert.dispatchedQty} uds) del inventario físico total ({stockAlert.totalStock} uds). La cantidad a facturar se ha ajustado al stock real disponible ({stockAlert.availableStock} uds).
            </p>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setStockAlert(null)}
                className="w-full py-2.5 bg-gradient-to-r from-red-600 to-fuchsia-700 hover:from-red-700 hover:to-fuchsia-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE IMPRESIÓN Y DESCARGA OFICIAL */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        data={{
          documentNumber: activeInvoiceToEdit
            ? activeInvoiceToEdit.documentNumber
            : `${docType === 'Factura' ? 'FACT' : docType === 'Nota de Entrega' ? 'NE' : 'PRES'}-001`,
          type: docType,
          status: status,
          paymentMethod: paymentMethod,
          issueDate: new Date().toISOString().slice(0, 10),
          eventDate: eventDate,
          clientName: currentClient?.name || 'Cliente sin registrar',
          clientCedulaRif: currentClient?.cedulaRif,
          clientPhone: currentClient?.phone || 'N/A',
          clientAddress: currentClient?.address || 'Entrega en tienda / Por coordinar',
          items: items,
          subtotalUSD: subtotalUSD,
          ivaRate: ivaRate,
          ivaUSD: ivaUSD,
          totalUSD: totalUSD,
          bcvRate: currentRate,
          totalBs: totalBs,
          notes: notes,
          issuerName: issuerName.trim() || 'Administración / Tienda',
          issuerCedula: issuerCedula.trim() || undefined,
          issuerRole: issuerRole.trim() || undefined,
        }}
      />
    </div>
  );
};
