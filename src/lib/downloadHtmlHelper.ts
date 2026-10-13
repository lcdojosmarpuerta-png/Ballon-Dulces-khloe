import confetti from 'canvas-confetti';
import { Client, InventoryItem, InvoiceDocument, RentalInspection, PagoMovilConfig } from '../types';

export interface DownloadHtmlOptions {
  fileName?: string;
  embedData?: boolean;
  clients?: Client[];
  inventory?: InventoryItem[];
  invoices?: InvoiceDocument[];
  rentals?: RentalInspection[];
  pagoMovilConfig?: PagoMovilConfig;
  bcvRate?: number | null;
}

/**
 * Descarga el archivo index.html completamente empaquetado y autónomo (Single-File)
 * que contiene todo el código del sitio (React, estilos Tailwind, iconos, módulos, generador de PDF, etc.)
 */
export async function downloadSiteIndexHtml(options: DownloadHtmlOptions = {}): Promise<void> {
  const {
    fileName = 'index.html',
    embedData = false,
    clients = [],
    inventory = [],
    invoices = [],
    rentals = [],
    pagoMovilConfig,
    bcvRate
  } = options;

  let htmlContent = '';

  try {
    // 1. Intentar obtener el bundle autónomo pre-construido
    let res = await fetch('/api/descargar-index-html');
    if (!res.ok) {
      res = await fetch('/descargas/index.html');
    }

    if (res.ok) {
      htmlContent = await res.text();
    } else {
      throw new Error(`Error HTTP ${res.status} al obtener index.html`);
    }
  } catch (err) {
    console.warn('Fallo al obtener desde endpoint, intentando fallback directo:', err);
    // Fallback: intentar leer desde dist-singlefile o la ubicación alternativa
    const fallbackRes = await fetch('/descargas/ballon_dulces_klhoe_offline.html');
    if (fallbackRes.ok) {
      htmlContent = await fallbackRes.text();
    } else {
      throw new Error('No se pudo descargar el archivo index.html autónomo. Por favor asegúrate de que el bundle esté generado.');
    }
  }

  // 2. Si se solicitó incrustar los datos actuales del usuario:
  if (embedData && htmlContent) {
    const seedScript = `
  <!-- DATOS PRECARGADOS LOCALES DE BALLÓN DULCES KLHOE -->
  <script id="bdk-embedded-seed">
  (function() {
    try {
      var forceSeed = !localStorage.getItem('bdk_clients');
      var clientsData = ${JSON.stringify(clients)};
      var inventoryData = ${JSON.stringify(inventory)};
      var invoicesData = ${JSON.stringify(invoices)};
      var rentalsData = ${JSON.stringify(rentals)};
      var pagoMovilData = ${pagoMovilConfig ? JSON.stringify(pagoMovilConfig) : 'null'};
      var bcvRateData = ${bcvRate ? JSON.stringify(bcvRate) : '36.5'};

      if (clientsData && (forceSeed || clientsData.length > 0)) {
        localStorage.setItem('bdk_clients', JSON.stringify(clientsData));
      }
      if (inventoryData && (forceSeed || inventoryData.length > 0)) {
        localStorage.setItem('bdk_inventory', JSON.stringify(inventoryData));
      }
      if (invoicesData && (forceSeed || invoicesData.length > 0)) {
        localStorage.setItem('bdk_invoices', JSON.stringify(invoicesData));
      }
      if (rentalsData && (forceSeed || rentalsData.length > 0)) {
        localStorage.setItem('bdk_rentals', JSON.stringify(rentalsData));
      }
      if (pagoMovilData) {
        localStorage.setItem('bdk_pago_movil', JSON.stringify(pagoMovilData));
      }
      if (bcvRateData) {
        localStorage.setItem('bdk_bcv_rate', String(bcvRateData));
      }
      console.log('✅ Base de datos inicializada con éxito desde archivo index.html empaquetado.');
    } catch(e) {
      console.error('Error precargando datos en index.html:', e);
    }
  })();
  </script>`;

    if (htmlContent.includes('</body>')) {
      htmlContent = htmlContent.replace('</body>', `${seedScript}\n</body>`);
    } else {
      htmlContent += seedScript;
    }
  }

  // 3. Crear Blob y forzar descarga directa con el nombre solicitado
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  // Confetti festivo
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#c026d3', '#ec4899', '#db2777', '#f43f5e']
    });
  } catch (e) {
    // Ignore confetti errors
  }
}
