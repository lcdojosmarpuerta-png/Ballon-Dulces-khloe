/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Client, 
  InventoryItem, 
  InvoiceDocument, 
  PagoMovilConfig, 
  BackupData, 
  InvoiceItem 
} from './types';
import { 
  INITIAL_CLIENTS, 
  INITIAL_INVENTORY, 
  INITIAL_INVOICES, 
  DEFAULT_PAGO_MOVIL 
} from './data/mockData';
import { exportInvoicesToExcel } from './lib/exportUtils';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ClientsModule } from './components/ClientsModule';
import { InventoryModule } from './components/InventoryModule';
import { InvoiceGenerator } from './components/InvoiceGenerator';
import { ReportsModule } from './components/ReportsModule';
import { WhatsAppCobranzasModule } from './components/WhatsAppCobranzasModule';
import { CatalogModule } from './components/CatalogModule';
import { BackupsModule } from './components/BackupsModule';
import { EndOfMonthModal } from './components/EndOfMonthModal';
import { SysWebStudioFooter } from './components/SysWebStudioFooter';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');

  // BCV Rate State
  const [bcvRate, setBcvRate] = useState<number | null>(36.5);
  const [loadingRate, setLoadingRate] = useState(false);

  // Inicialización limpia: Garantiza que el sitio quede en blanco listo para datos nuevos
  const CLEAN_SLATE_FLAG = 'bdk_blank_slate_ready_v1';
  if (typeof window !== 'undefined' && !localStorage.getItem(CLEAN_SLATE_FLAG)) {
    localStorage.removeItem('bdk_clients');
    localStorage.removeItem('bdk_inventory');
    localStorage.removeItem('bdk_invoices');
    localStorage.setItem(CLEAN_SLATE_FLAG, 'true');
  }

  // Local Storage Data Collections (Inicializados en blanco)
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('bdk_clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading clients:', e);
      }
    }
    return [];
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('bdk_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading inventory:', e);
      }
    }
    return [];
  });

  const [invoices, setInvoices] = useState<InvoiceDocument[]>(() => {
    const saved = localStorage.getItem('bdk_invoices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading invoices:', e);
      }
    }
    return [];
  });

  // Configuración de Pago Móvil & QR
  const [pagoMovilConfig, setPagoMovilConfig] = useState<PagoMovilConfig>(() => {
    const saved = localStorage.getItem('bdk_pago_movil');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.idNumber === 'V-26136645' || 
          parsed.phone === '04141234567' ||
          !parsed.bankName.includes('Nacional de Crédito')
        ) {
          return DEFAULT_PAGO_MOVIL;
        }
        return parsed;
      } catch (e) {
        console.error('Error loading pagoMovilConfig:', e);
      }
    }
    return DEFAULT_PAGO_MOVIL;
  });

  // Ítems transferidos desde Catálogo a Facturación
  const [catalogItemsToImport, setCatalogItemsToImport] = useState<InvoiceItem[] | null>(null);

  // Invoice being edited from reports
  const [invoiceToEdit, setInvoiceToEdit] = useState<InvoiceDocument | null>(null);

  // End of month modal trigger
  const [showEndOfMonthModal, setShowEndOfMonthModal] = useState(false);

  // App notification toast
  const [appToast, setAppToast] = useState<string | null>(null);

  const showAppToast = (msg: string) => {
    setAppToast(msg);
    setTimeout(() => setAppToast(null), 3500);
  };

  // Persistir en LocalStorage
  useEffect(() => {
    localStorage.setItem('bdk_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('bdk_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('bdk_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('bdk_pago_movil', JSON.stringify(pagoMovilConfig));
  }, [pagoMovilConfig]);

  // Carga de tasa BCV inicial
  const fetchBcvRate = async () => {
    setLoadingRate(true);
    try {
      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      if (response.ok) {
        const data = await response.json();
        if (data && data.promedio) {
          setBcvRate(data.promedio);
          return;
        }
      }
      setBcvRate(36.5);
    } catch (e) {
      console.warn('Fallo al obtener tasa oficial BCV:', e);
      setBcvRate(36.5);
    } finally {
      setLoadingRate(false);
    }
  };

  useEffect(() => {
    fetchBcvRate();
  }, []);

  // Verificar si es el último día del mes para el modal recordatorio
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (tomorrow.getDate() === 1) {
      const dismissed = sessionStorage.getItem('bdk_dismissed_end_month_modal');
      if (!dismissed) {
        setShowEndOfMonthModal(true);
      }
    }
  }, []);

  // Métricas financieras calculadas
  const totalIncomeUSD = invoices
    .filter((inv) => inv.status === 'Pagada' || inv.status === 'Abonada')
    .reduce((sum, inv) => sum + (inv.totalUSD || 0), 0);

  // Acciones de Clientes
  const handleAddClient = (newClientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...newClientData,
      id: `cli-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setClients([newClient, ...clients]);
    showAppToast(`✅ Cliente "${newClient.name}" registrado.`);
  };

  const handleUpdateClient = (updated: Client) => {
    setClients(clients.map((c) => (c.id === updated.id ? updated : c)));
    showAppToast(`✅ Cliente "${updated.name}" actualizado.`);
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter((c) => c.id !== id));
    showAppToast('🗑️ Cliente eliminado.');
  };

  // Acciones de Inventario
  const handleAddInventoryItem = (newItemData: Omit<InventoryItem, 'id' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...newItemData,
      id: `inv-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    setInventory([newItem, ...inventory]);
    showAppToast(`✅ Artículo "${newItem.name}" agregado al inventario.`);
  };

  const handleUpdateInventoryItem = (updated: InventoryItem) => {
    setInventory(inventory.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory(inventory.filter((item) => item.id !== id));
  };

  // Acciones de Facturación
  const handleSaveInvoice = (invoiceDoc: InvoiceDocument) => {
    const existingIndex = invoices.findIndex((i) => i.id === invoiceDoc.id);
    if (existingIndex >= 0) {
      const updated = [...invoices];
      updated[existingIndex] = invoiceDoc;
      setInvoices(updated);
    } else {
      setInvoices([invoiceDoc, ...invoices]);
    }

    setInvoiceToEdit(null);
    showAppToast(`✅ Documento ${invoiceDoc.documentNumber} guardado correctamente.`);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(invoices.filter((inv) => inv.id !== id));
    showAppToast('🗑️ Documento eliminado.');
  };

  const handleEditInvoiceFromReports = (inv: InvoiceDocument) => {
    setInvoiceToEdit(inv);
    setActiveTab('facturacion');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetMonthlyData = () => {
    setInvoices([]);
    showAppToast('🔄 Movimientos del mes reiniciados.');
  };

  // Configuración de Pago Móvil & QR
  const handleUpdatePagoMovilConfig = (config: PagoMovilConfig) => {
    setPagoMovilConfig(config);
    showAppToast('✅ Datos de Pago Móvil actualizados correctamente.');
  };

  // Transferencia de ítems desde el Catálogo a Facturación
  const handleTransferCatalogToInvoice = (
    items: { inventoryId?: string; name: string; quantity: number; unitPrice: number; category?: string }[]
  ) => {
    const mapped: InvoiceItem[] = items.map((it, idx) => ({
      id: `it-cat-${Date.now()}-${idx}`,
      inventoryId: it.inventoryId,
      name: it.name,
      category: it.category,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.quantity * it.unitPrice,
    }));
    setCatalogItemsToImport(mapped);
    setActiveTab('facturacion');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Restauración de Copia de Seguridad Completa
  const handleRestoreData = (backup: BackupData) => {
    if (backup.clients) setClients(backup.clients);
    if (backup.inventory) setInventory(backup.inventory);
    if (backup.invoices) setInvoices(backup.invoices);
    if (backup.pagoMovilConfig) setPagoMovilConfig(backup.pagoMovilConfig);
    showAppToast('✅ Copia de seguridad restaurada exitosamente.');
  };

  // Dejar todo el sitio en blanco listo para datos nuevos
  const handleClearAllData = () => {
    if (window.confirm('¿Deseas dejar todo el sitio en blanco para ingresar datos nuevos? Se limpiarán clientes, inventario y facturas locales.')) {
      setClients([]);
      setInventory([]);
      setInvoices([]);
      localStorage.removeItem('bdk_clients');
      localStorage.removeItem('bdk_inventory');
      localStorage.removeItem('bdk_invoices');
      showAppToast('✨ El sitio ha sido dejado en blanco listo para ingresar datos nuevos.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50/40 via-white to-fuchsia-50/40 flex text-stone-800 font-sans antialiased">
      {/* Navegación Lateral (Sidebar) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'facturacion') {
            setInvoiceToEdit(null);
          }
        }}
      />

      {/* Área de Trabajo Principal */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          bcvRate={bcvRate}
          loadingRate={loadingRate}
          onRefreshRate={fetchBcvRate}
          activeModule={activeTab}
        />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {activeTab === 'inicio' && (
            <HomeView
              setActiveTab={setActiveTab}
              clientsCount={clients.length}
              inventoryCount={inventory.length}
              invoicesCount={invoices.length}
              bcvRate={bcvRate}
              totalIncomeUSD={totalIncomeUSD}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientsModule
              clients={clients}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
            />
          )}

          {activeTab === 'inventario' && (
            <InventoryModule
              inventory={inventory}
              onAddItem={handleAddInventoryItem}
              onUpdateItem={handleUpdateInventoryItem}
              onDeleteItem={handleDeleteInventoryItem}
            />
          )}

          {activeTab === 'facturacion' && (
            <InvoiceGenerator
              clients={clients}
              inventory={inventory}
              bcvRate={bcvRate}
              onSaveInvoice={handleSaveInvoice}
              activeInvoiceToEdit={invoiceToEdit}
              onFinishEdit={() => setInvoiceToEdit(null)}
              catalogItemsToImport={catalogItemsToImport}
              onClearCatalogImport={() => setCatalogItemsToImport(null)}
            />
          )}

          {activeTab === 'mensajes' && (
            <WhatsAppCobranzasModule
              clients={clients}
              invoices={invoices}
              bcvRate={bcvRate}
              pagoMovilConfig={pagoMovilConfig}
              onUpdatePagoMovilConfig={handleUpdatePagoMovilConfig}
            />
          )}

          {activeTab === 'catalogo' && (
            <CatalogModule
              inventory={inventory}
              bcvRate={bcvRate}
              onTransferToInvoice={handleTransferCatalogToInvoice}
            />
          )}

          {activeTab === 'reportes' && (
            <ReportsModule
              invoices={invoices}
              onDeleteInvoice={handleDeleteInvoice}
              onEditInvoice={handleEditInvoiceFromReports}
              onResetMonthlyData={handleResetMonthlyData}
            />
          )}

          {activeTab === 'respaldos' && (
            <BackupsModule
              clients={clients}
              inventory={inventory}
              invoices={invoices}
              pagoMovilConfig={pagoMovilConfig}
              bcvRate={bcvRate}
              onRestoreData={handleRestoreData}
              onClearAllData={handleClearAllData}
            />
          )}
        </main>

        {/* Cintillo Inferior: S&S Web Studio */}
        <SysWebStudioFooter />
      </div>

      {/* Modal Emergente Último Día del Mes */}
      <EndOfMonthModal
        isOpen={showEndOfMonthModal}
        onClose={() => setShowEndOfMonthModal(false)}
        onExportExcel={() => {
          const monthName = new Date().toLocaleString('es-VE', { month: 'long', year: 'numeric' });
          exportInvoicesToExcel(invoices, monthName);
        }}
      />

      {/* Global App Toast */}
      {appToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-800 text-sm no-print animate-fadeIn">
          <span>{appToast}</span>
        </div>
      )}
    </div>
  );
}
