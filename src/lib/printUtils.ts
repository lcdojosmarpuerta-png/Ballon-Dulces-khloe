/**
 * Utility to reliably print invoices both in standard browsers and sandboxed iframes.
 */

export function printInvoiceElement(elementId = 'printable-invoice-sheet'): boolean {
  try {
    // Asegurar foco en la ventana actual
    window.focus();

    const element = document.getElementById(elementId);
    
    // Intento 1: Llamada directa a window.print()
    try {
      window.print();
      return true;
    } catch (directErr) {
      console.warn('Intento directo de window.print() falló, probando con iframe aislado:', directErr);
    }

    if (!element) {
      window.print();
      return true;
    }

    // Obtenemos los estilos cargados en la página
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    // Intentamos imprimir a través de un iframe aislado
    let iframe = document.getElementById('bdk-isolated-print-frame') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'bdk-isolated-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      iframe.style.opacity = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc && element) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="utf-8" />
            <title>Ballón dulces Klhoe - Factura Oficial</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
            ${styles}
            <style>
              @page {
                size: letter landscape;
                margin: 0.5cm;
              }
              *, *::before, *::after {
                box-sizing: border-box;
              }
              html, body {
                width: 100% !important;
                height: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                background: #ffffff !important;
                color: #000000 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                font-family: 'Inter', sans-serif;
              }
              .font-script {
                font-family: 'Great Vibes', 'Dancing Script', cursive !important;
              }
              .no-print {
                display: none !important;
              }
              .print-page-front {
                display: flex !important;
                flex-direction: row !important;
                width: 100% !important;
                height: 100% !important;
                max-height: 19cm !important;
                page-break-inside: avoid !important;
                page-break-after: always !important;
                break-after: page !important;
                overflow: hidden !important;
                background: #ffffff !important;
                margin-bottom: 20px !important;
              }
              .print-page-back {
                display: flex !important;
                flex-direction: row !important;
                width: 100% !important;
                height: 100% !important;
                max-height: 19cm !important;
                page-break-inside: avoid !important;
                page-break-before: always !important;
                break-before: page !important;
                overflow: hidden !important;
                background: #ffffff !important;
              }
              .print-half {
                width: 48.5% !important;
                max-width: 48.5% !important;
                height: 100% !important;
                display: flex !important;
                flex-direction: column !important;
                justify-content: space-between !important;
                padding: 6px 8px !important;
                box-sizing: border-box !important;
                font-size: 8pt !important;
                line-height: 1.15 !important;
                border: 1px solid #e2e8f0 !important;
                border-radius: 6px !important;
              }
              .print-divider {
                width: 3% !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: center !important;
                justify-content: center !important;
                border-left: 2px dashed #94a3b8 !important;
                margin-left: -1px !important;
                height: 100% !important;
              }
            </style>
          </head>
          <body>
            <div style="width: 100%; margin: 0; padding: 0;">
              ${element.innerHTML}
            </div>
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        try {
          iframe?.contentWindow?.focus();
          iframe?.contentWindow?.print();
        } catch (iframeErr) {
          console.warn('Iframe print falló, usando window.print()', iframeErr);
          window.focus();
          window.print();
        }
      }, 250);
      return true;
    } else {
      window.focus();
      window.print();
      return true;
    }
  } catch (err) {
    console.warn('Error en printInvoiceElement, ejecutando fallback window.print()', err);
    try {
      window.focus();
      window.print();
      return true;
    } catch (fallbackErr) {
      console.error('Error fatal al imprimir:', fallbackErr);
      return false;
    }
  }
}
