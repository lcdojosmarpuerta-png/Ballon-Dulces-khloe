import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { 
  MessageCircle, 
  QrCode, 
  Copy, 
  Download, 
  Send, 
  Check, 
  DollarSign, 
  Save, 
  RefreshCw, 
  Sparkles, 
  FileText, 
  Users, 
  Building2 
} from 'lucide-react';
import { Client, InvoiceDocument, PagoMovilConfig } from '../types';
import { COMPANY_INFO } from '../data/companyInfo';

interface WhatsAppCobranzasModuleProps {
  clients: Client[];
  invoices: InvoiceDocument[];
  bcvRate: number | null;
  pagoMovilConfig: PagoMovilConfig;
  onUpdatePagoMovilConfig: (config: PagoMovilConfig) => void;
}

export const WhatsAppCobranzasModule: React.FC<WhatsAppCobranzasModuleProps> = ({
  clients,
  invoices,
  bcvRate,
  pagoMovilConfig,
  onUpdatePagoMovilConfig,
}) => {
  // Configuración de Pago Móvil Form
  const [bankName, setBankName] = useState(pagoMovilConfig.bankName);
  const [bankCode, setBankCode] = useState(pagoMovilConfig.bankCode);
  const [idNumber, setIdNumber] = useState(pagoMovilConfig.idNumber);
  const [phone, setPhone] = useState(pagoMovilConfig.phone);
  const [accountHolder, setAccountHolder] = useState(pagoMovilConfig.accountHolder);
  const [notes, setNotes] = useState(pagoMovilConfig.notes || '');
  const [configSaved, setConfigSaved] = useState(false);

  // QR Amount State
  const [qrAmountUSD, setQrAmountUSD] = useState<number>(50);
  const [qrAmountBs, setQrAmountBs] = useState<number>(() => {
    const rate = bcvRate || 36.5;
    return 50 * rate;
  });
  const [qrCustomText, setQrCustomText] = useState('');
  const [copiedData, setCopiedData] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentRate = bcvRate || 36.5;

  // Actualizar cálculo de Bs al cambiar monto en USD o tasa
  useEffect(() => {
    setQrAmountBs(Number((qrAmountUSD * currentRate).toFixed(2)));
  }, [qrAmountUSD, currentRate]);

  // Generar QR en Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    // Formato estándar para Pago Móvil venezolano o texto amigable
    // Ejemplo: PAGO_MOVIL:BANCO=0102;RIF=V26136645;TEL=04141234567;MONTO=1825.00
    const rawQrPayload = `PAGOMOVIL:${bankCode}:${idNumber.replace(/[^0-9]/g, '')}:${phone.replace(/[^0-9]/g, '')}:${qrAmountBs.toFixed(2)}`;
    
    QRCode.toCanvas(
      canvasRef.current,
      rawQrPayload,
      {
        width: 240,
        margin: 2,
        color: {
          dark: '#701a75', // Deep fuchsia
          light: '#ffffff',
        },
      },
      (error) => {
        if (error) console.error('Error generando QR:', error);
      }
    );
  }, [bankCode, idNumber, phone, qrAmountBs]);

  const handleSaveBankConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PagoMovilConfig = {
      bankName,
      bankCode,
      idNumber,
      phone,
      accountHolder,
      notes,
    };
    onUpdatePagoMovilConfig(updated);
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const handleCopyPaymentData = () => {
    const textToCopy = `🎈 *DATOS OFICIALES DE PAGO - BALLÓN DULCES KLHOE*\n\n` +
      `📲 *PAGO MÓVIL (BNC):*\n` +
      `• Banco: ${bankName}\n` +
      `• Cédula / RIF: ${idNumber}\n` +
      `• Teléfono: ${phone}\n` +
      `• Titular: ${accountHolder}\n\n` +
      `🟡 *BINANCE PAY:*\n` +
      `• Teléfono / ID: 04145057120\n` +
      `• Usuario: Morabia18\n\n` +
      `🔵 *ZELLE:*\n` +
      `• Cuenta / Destinatario: ReySantaella9122205630\n\n` +
      `💰 *Monto a Pagar:* Bs. ${qrAmountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (Equivalente a $${qrAmountUSD.toFixed(2)} USD a Tasa BCV: ${currentRate.toFixed(2)} Bs/$)\n\n` +
      `📌 *Nota:* ${notes || 'Favor enviar capture del comprobante con número de referencia bancaria visible.'}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 3000);
  };

  const handleDownloadQrImage = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `pago-movil-ballon-dulces-klhoe-${qrAmountUSD}usd.png`;
    a.click();
  };

  // ==========================================
  // SECCIÓN: PLANTILLAS DE MENSAJES WHATSAPP
  // ==========================================
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [clientCustomPhone, setClientCustomPhone] = useState('');
  const [activeTemplateType, setActiveTemplateType] = useState<
    'reserva' | 'saldo' | 'despacho' | 'agradecimiento'
  >('saldo');
  const [messageBody, setMessageBody] = useState('');

  // Sincronizar datos al elegir cliente o factura
  useEffect(() => {
    const client = clients.find((c) => c.id === selectedClientId);
    if (client) {
      setClientCustomPhone(client.phone);
    }
  }, [selectedClientId, clients]);

  // Generar texto de la plantilla automáticamente
  useEffect(() => {
    const client = clients.find((c) => c.id === selectedClientId);
    const clientName = client ? client.name : '[Nombre del Cliente]';
    const inv = invoices.find((i) => i.id === selectedInvoiceId);

    const docNum = inv ? `${inv.type} Nº ${inv.documentNumber}` : 'su evento';
    const totalUSD = inv ? inv.totalUSD : qrAmountUSD;
    const totalBs = inv ? inv.totalBs : (qrAmountUSD * currentRate);
    const eventDate = inv ? inv.issueDate : 'la fecha acordada';
    const address = inv ? (inv.clientAddress || 'su locación') : (client?.address || 'su locación');

    let template = '';

    if (activeTemplateType === 'reserva') {
      template = `🎈 *BALLÓN DULCES KLHOE* - Confirmación de Reserva\n\n` +
        `¡Hola *${clientName}*! 🎉\n` +
        `Es un placer saludarte. Te confirmamos que la reserva de mobiliario y decoración para tu evento (*${docNum}*) está formalmente registrada para el día *${eventDate}*.\n\n` +
        `📍 *Lugar de Entrega:* ${address}\n` +
        `💵 *Monto Total:* $${totalUSD.toFixed(2)} (Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })})\n` +
        `📈 *Tasa Oficial BCV del día:* ${currentRate.toFixed(2)} Bs/$\n\n` +
        `Quedamos a tu entera disposición para cualquier detalle adicional.\n` +
        `¡Haremos que tu fiesta sea inolvidable!\n\n` +
        `_Emprendimiento Ballón Dulces khloe • "Detalles que marcan la diferencia en tu fiesta"_`;
    } else if (activeTemplateType === 'saldo') {
      template = `🎈 *${COMPANY_INFO.name.toUpperCase()}* - Recordatorio de Saldo Pendiente\n\n` +
        `Hola *${clientName}*, un gusto saludarte.\n` +
        `Te recordamos que para tu evento de mañana (*${docNum}*) el saldo restante a liquidar es de:\n\n` +
        `💵 *Monto en Divisas:* $${totalUSD.toFixed(2)} USD\n` +
        `🇻🇪 *Equivalente en Bolívares:* Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}\n` +
        `📊 *Tasa Oficial BCV:* ${currentRate.toFixed(2)} Bs/$\n\n` +
        `🏦 *Datos para Pago Móvil (BNC 0191):*\n` +
        `• Banco: ${bankName}\n` +
        `• C.I / RIF: ${idNumber}\n` +
        `• Teléfono: ${phone}\n` +
        `• Titular: ${accountHolder}\n\n` +
        `🟡 *Binance Pay:* 04145057120 (Usuario: Morabia18)\n` +
        `🔵 *Zelle:* ReySantaella9122205630\n\n` +
        `Por favor, envíanos el capture del comprobante con la referencia bancaria visible al realizar el pago. ¡Muchas gracias! 😊`;
    } else if (activeTemplateType === 'despacho') {
      template = `🎈 *${COMPANY_INFO.name.toUpperCase()}* - ¡Pedido en Camino!\n\n` +
        `Estimado(a) *${clientName}*,\n` +
        `Te notificamos que nuestro equipo va en camino a tu locación (*${address}*) para la entrega de tu pedido y decoración (*${docNum}*).\n\n` +
        `🕒 *Tiempo estimado de llegada:* 25 a 45 minutos aprox.\n\n` +
        `Por favor, asegúrate de estar atento para autorizar la recepción. ¡Nos vemos en breve! 🚚🎈`;
    } else if (activeTemplateType === 'agradecimiento') {
      template = `🎈 *${COMPANY_INFO.name.toUpperCase()}* - ¡Muchas Gracias por Elegirnos!\n\n` +
        `Querido(a) *${clientName}*,\n` +
        `Queremos darte las gracias por habernos permitido ser parte de tu celebración con nuestros detalles y dulces finos.\n\n` +
        `Esperamos de corazón que tú y todos tus invitados hayan disfrutado cada detalle. Si te gustó nuestro servicio, nos encantaría que nos etiquetes en tus fotos de redes sociales y nos recomiendes con tus familiares y amigos. 📸✨\n\n` +
        `¡Siempre a tu orden para futuras ocasiones especiales!\n` +
        `_${COMPANY_INFO.name} • "${COMPANY_INFO.slogan}"_`;
    }

    setMessageBody(template);
  }, [activeTemplateType, selectedClientId, selectedInvoiceId, qrAmountUSD, currentRate, clients, invoices, bankName, idNumber, phone, accountHolder]);

  const handleSendWhatsApp = () => {
    const rawDigits = clientCustomPhone.replace(/[^0-9]/g, '');
    if (!rawDigits) {
      alert('Por favor indica un número de teléfono de WhatsApp válido.');
      return;
    }

    // Agregar código de país si no lo tiene (ej: si empieza por 0414 -> 58414)
    let formattedPhone = rawDigits;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '58' + formattedPhone.slice(1);
    } else if (!formattedPhone.startsWith('58') && formattedPhone.length === 10) {
      formattedPhone = '58' + formattedPhone;
    }

    const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageBody)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
            <MessageCircle className="w-5 h-5" />
          </span>
          <h2 className="text-xl md:text-2xl font-bold font-script text-fuchsia-950">
            Automatización de Mensajes y Cobranzas por WhatsApp
          </h2>
        </div>
        <p className="text-xs text-stone-600 mt-1">
          Generador dinámico de código QR para Pago Móvil, plantillas para cobranzas con cálculo BCV en vivo y notificaciones de eventos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUMNA IZQUIERDA: GENERADOR DE QR Y DATOS BANCARIOS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tarjeta del Código QR de Pago Móvil */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-fuchsia-900" />
                <h3 className="font-bold text-sm text-stone-900">
                  Código QR de Pago Móvil
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-fuchsia-50 text-fuchsia-900 px-2 py-0.5 rounded border border-fuchsia-200">
                Tasa BCV: {currentRate.toFixed(2)} Bs/$
              </span>
            </div>

            {/* Ajuste de Monto a Cobrar */}
            <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Monto en USD ($):
                </label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-stone-500">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={qrAmountUSD}
                    onChange={(e) => setQrAmountUSD(Number(e.target.value))}
                    className="w-full pl-6 pr-2 py-1.5 bg-white border border-stone-200 rounded-xl font-bold font-mono text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-1">
                  Total en Bolívares (Bs.):
                </label>
                <div className="p-1.5 bg-white border border-stone-200 rounded-xl font-bold font-mono text-fuchsia-950 text-right truncate">
                  Bs. {qrAmountBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Visualizador QR Centrado */}
            <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-fuchsia-50/50 to-white rounded-2xl border border-fuchsia-100 shadow-inner">
              <canvas ref={canvasRef} className="rounded-xl shadow-xs" />
              <p className="text-[10px] text-stone-500 font-mono text-center mt-2">
                Escanea desde la app bancaria para pagar Bs. {qrAmountBs.toFixed(2)}
              </p>
            </div>

            {/* Acciones Rápidas del QR */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={handleCopyPaymentData}
                className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                {copiedData ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedData ? '¡Copiado!' : 'Copiar Datos'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadQrImage}
                className="py-2.5 px-3 bg-fuchsia-950 hover:bg-fuchsia-900 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Descargar QR</span>
              </button>
            </div>
          </div>

          {/* Configuración de Datos Bancarios */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900 border-b border-stone-200 pb-2">
              Configuración de Datos Bancarios (Pago Móvil)
            </h3>

            <form onSubmit={handleSaveBankConfig} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Banco Receptor:</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Ej. Banco de Venezuela (0102) o Banesco"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-0.5">Código Banco:</label>
                  <input
                    type="text"
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    placeholder="0102"
                    maxLength={4}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono text-center"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-stone-600 block mb-0.5">Cédula / RIF:</label>
                  <input
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="V-26136645"
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Teléfono Asociado:</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="04141234567"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Nombre del Titular:</label>
                <input
                  type="text"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Emprendimiento Ballón Dulces khloe"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-600 mb-0.5">Instrucción para el Cliente:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Favor enviar capture con el número de referencia visible..."
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {configSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span>{configSaved ? '¡Guardado Correctamente!' : 'Guardar Datos Bancarios'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* COLUMNA DERECHA: CENTRO DE MENSAJES Y PLANTILLAS (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="border-b border-stone-200 pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <span>Generador de Mensajes y Plantillas para Clientes</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Selecciona al cliente o factura para completar fechas, saldos en USD y tasa BCV al instante.
              </p>
            </div>

            {/* Selectores de Cliente y Factura */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Seleccionar Cliente:
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="">-- Cliente genérico o manual --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Vincular Factura / Nota (Opcional):
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => setSelectedInvoiceId(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl"
                >
                  <option value="">-- Sin documento vinculado --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.type} Nº {inv.documentNumber} - {inv.clientName} (${inv.totalUSD.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Teléfono Destino */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Número de WhatsApp Destino:
              </label>
              <input
                type="text"
                value={clientCustomPhone}
                onChange={(e) => setClientCustomPhone(e.target.value)}
                placeholder="Ej. +584141234567 o 04141234567"
                className="w-full p-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono"
              />
            </div>

            {/* Selector de Plantilla */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Tipo de Mensaje / Plantilla:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTemplateType('saldo')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    activeTemplateType === 'saldo'
                      ? 'bg-red-50 border-red-500 text-red-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  💳 Saldo 24h BCV
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTemplateType('reserva')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    activeTemplateType === 'reserva'
                      ? 'bg-fuchsia-50 border-fuchsia-500 text-fuchsia-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  🎉 Confirmar Reserva
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTemplateType('despacho')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    activeTemplateType === 'despacho'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  🚚 Mobiliario en Camino
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTemplateType('agradecimiento')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-center cursor-pointer transition-all ${
                    activeTemplateType === 'agradecimiento'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  ⭐ Agradecimiento
                </button>
              </div>
            </div>

            {/* Vista Previa y Editor del Mensaje */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-700">
                  Mensaje a Enviar (Puedes editarlo libremente):
                </label>
                <span className="text-[10px] text-stone-400">
                  Soporta formato *negrita*, _cursiva_
                </span>
              </div>
              <textarea
                rows={9}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className="w-full p-3 text-xs bg-stone-50 border border-stone-200 rounded-2xl font-mono leading-relaxed text-stone-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Botón Principal de Envío */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-stone-500">
                Se abrirá WhatsApp Web o la App oficial con el texto precargado.
              </span>

              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-all text-sm"
              >
                <Send className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
