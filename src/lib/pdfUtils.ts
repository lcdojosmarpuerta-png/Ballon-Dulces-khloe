import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Genera y descarga un archivo PDF de alta definición en tamaño Carta Horizontal (Letter Landscape)
 */
export async function generateInvoicePdf(
  frontElement: HTMLElement | null,
  backElement: HTMLElement | null,
  filename = 'Factura-Ballon-Dulces-Klhoe.pdf',
  pagesToInclude: 'both' | 'front' | 'back' = 'both'
): Promise<boolean> {
  try {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'letter',
    });

    const letterWidth = 279.4;
    const letterHeight = 215.9;
    const margin = 5;
    const printWidth = letterWidth - margin * 2;
    const printHeight = letterHeight - margin * 2;

    let hasPage = false;

    // Página 1: Anverso (Factura / Nota de Entrega)
    if ((pagesToInclude === 'both' || pagesToInclude === 'front') && frontElement) {
      const canvas = await html2canvas(frontElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', margin, margin, printWidth, printHeight);
      hasPage = true;
    }

    // Página 2: Reverso (Términos y Condiciones)
    if ((pagesToInclude === 'both' || pagesToInclude === 'back') && backElement) {
      if (hasPage) {
        pdf.addPage('letter', 'landscape');
      }
      const backCanvas = await html2canvas(backElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const backImg = backCanvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(backImg, 'JPEG', margin, margin, printWidth, printHeight);
      hasPage = true;
    }

    if (!hasPage) {
      throw new Error('No se encontraron elementos para generar el PDF');
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generando PDF:', error);
    return false;
  }
}

/**
 * Genera un archivo HTML autosuficiente listo para imprimir en una pestaña separada o guardado local.
 * Incluye un script de auto-impresión y botón manual por si el navegador bloquea modales en el iframe.
 */
export function downloadPrintableHtml(
  title: string,
  elementHtml: string,
  filename = 'Documento-Imprimible.html'
) {
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((el) => el.outerHTML)
    .join('\n');

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
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
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      font-family: 'Inter', sans-serif;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      display: none !important;
    }
    .print-header-bar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 99999;
      font-family: system-ui, -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    @media print {
      .print-header-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-header-bar">
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 18px;">🎈</span>
      <div>
        <strong style="font-size: 14px; display: block;">Ballón Dulces Klhoe - Documento Oficial</strong>
        <span style="font-size: 11px; color: #94a3b8;">Formato Carta Horizontal (Letter Landscape)</span>
      </div>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()" style="background: linear-gradient(135deg, #e11d48, #c026d3); color: white; border: none; padding: 9px 20px; border-radius: 8px; font-weight: bold; font-size: 13px; cursor: pointer;">
        🖨️ Imprimir Ahora / Guardar como PDF
      </button>
      <button onclick="window.close()" style="background: #334155; color: white; border: none; padding: 9px 14px; border-radius: 8px; font-size: 13px; cursor: pointer;">
        Cerrar
      </button>
    </div>
  </div>

  <div style="padding: 12px; max-width: 1280px; margin: 0 auto;">
    ${elementHtml}
  </div>

  <script>
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.warn('Auto print falló:', e);
        }
      }, 400);
    });
  </script>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
