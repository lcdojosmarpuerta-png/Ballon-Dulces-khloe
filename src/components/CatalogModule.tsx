import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  ArrowRight, 
  Layers, 
  Share2, 
  Check, 
  X,
  PackageCheck
} from 'lucide-react';
import { InventoryItem, InventoryCategory, CatalogCartItem } from '../types';

interface CatalogModuleProps {
  inventory: InventoryItem[];
  bcvRate: number | null;
  onTransferToInvoice: (items: { inventoryId?: string; name: string; quantity: number; unitPrice: number; category?: string }[]) => void;
}

export const CatalogModule: React.FC<CatalogModuleProps> = ({
  inventory,
  bcvRate,
  onTransferToInvoice,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CatalogCartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const currentRate = bcvRate || 36.5;

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Todos los Artículos' },
    { id: 'Mobiliario', label: 'Mobiliario' },
    { id: 'Decoración', label: 'Decoración & Globos' },
    { id: 'Pasapalos', label: 'Pasapalos' },
    { id: 'Comestibles', label: 'Comestibles & Tortas' },
    { id: 'Equipos de sonido', label: 'Sonido e Iluminación' },
  ];

  // Filtrar inventario
  const filteredItems = inventory.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Manejo de Carrito / Cotizador
  const handleAddToCart = (item: InventoryItem) => {
    const existing = cart.find((c) => c.item.id === item.id);
    if (existing) {
      setCart(
        cart.map((c) => (c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c))
      );
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCart(
      cart
        .map((c) => {
          if (c.item.id === itemId) {
            const newQty = c.quantity + delta;
            return newQty > 0 ? { ...c, quantity: newQty } : null;
          }
          return c;
        })
        .filter(Boolean) as CatalogCartItem[]
    );
  };

  const handleRemoveFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.item.id !== itemId));
  };

  const totalUSD = cart.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
  const totalBs = totalUSD * currentRate;
  const totalPieces = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleSendQuoteWhatsApp = () => {
    if (cart.length === 0) return;

    let text = `🎈 *COTIZACIÓN DE MOBILIARIO Y FIESTA - BALLÓN DULCES KLHOE*\n\n` +
      `¡Hola! Aquí tienes la cotización de los artículos seleccionados:\n\n`;

    cart.forEach((c) => {
      const itemSubtotal = c.item.price * c.quantity;
      text += `• *${c.item.name}* (x${c.quantity})\n  Precio: $${c.item.price.toFixed(2)} c/u → Subtotal: $${itemSubtotal.toFixed(2)}\n`;
    });

    text += `\n💰 *Total Estimado:* $${totalUSD.toFixed(2)} USD\n` +
      `🇻🇪 *Equivalente en Bolívares:* Bs. ${totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })} (Tasa BCV: ${currentRate.toFixed(2)} Bs/$)\n\n` +
      `_¿Deseas confirmar esta reserva o agregar algún otro detalle para tu evento?_\n` +
      `_Emprendimiento Ballón Dulces khloe • "Detalles que marcan la diferencia en tu fiesta"_`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleTransfer = () => {
    if (cart.length === 0) return;
    const mapped = cart.map((c) => ({
      inventoryId: c.item.id,
      name: c.item.name,
      quantity: c.quantity,
      unitPrice: c.item.price,
      category: c.item.category,
    }));
    onTransferToInvoice(mapped);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Catálogo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-stone-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-fuchsia-100 text-fuchsia-800">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-script text-fuchsia-950">
              Catálogo Digital Interactivo & Cotizador de Fiestas
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Galería visual de mobiliario, pasapalos y decoraciones con precios duales en USD y Bolívares (Tasa Oficial BCV).
          </p>
        </div>

        {/* Botón flotante para ver cotización activa */}
        <button
          onClick={() => setShowCartDrawer(!showCartDrawer)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
            cart.length > 0
              ? 'bg-fuchsia-950 text-white hover:bg-fuchsia-900 ring-2 ring-fuchsia-400/50 animate-pulse'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-fuchsia-300" />
          <span>Tu Combo ({totalPieces})</span>
          {cart.length > 0 && (
            <span className="ml-1 bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              ${totalUSD.toFixed(0)}
            </span>
          )}
        </button>
      </div>

      {/* Barra de Filtros por Categoría y Buscador */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-fuchsia-950 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar mobiliario, pasapalos o backing..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-fuchsia-500"
          />
        </div>
      </div>

      {/* Grid del Catálogo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredItems.map((item) => {
          const itemBs = item.price * currentRate;
          const inCart = cart.find((c) => c.item.id === item.id);
          const realAvailable = item.quantity;

          return (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md hover:border-fuchsia-300 transition-all flex flex-col group"
            >
              {/* Imagen del Producto */}
              <div className="relative h-44 bg-stone-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full border border-white/20">
                  {item.category}
                </span>
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                  <span className="text-[10px] font-mono font-bold bg-white/95 backdrop-blur-md text-stone-800 px-2.5 py-0.5 rounded-full shadow-xs">
                    Stock: {realAvailable}
                  </span>
                </div>
              </div>

              {/* Detalles y Precios */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-sm text-stone-900 group-hover:text-fuchsia-950 transition-colors line-clamp-2">
                    {item.name}
                  </h4>
                </div>

                <div className="pt-2 border-t border-stone-100 flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Precio Alquiler / Venta:</span>
                    <div className="flex items-baseline gap-1">
                      <strong className="text-lg font-bold text-red-600 font-mono">
                        ${item.price.toFixed(2)}
                      </strong>
                      <span className="text-[11px] text-stone-500 font-mono">
                        (Bs. {itemBs.toLocaleString('es-VE', { maximumFractionDigits: 2 })})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="p-2.5 bg-fuchsia-950 hover:bg-red-600 text-white rounded-2xl shadow-xs transition-colors cursor-pointer"
                    title="Añadir a mi combo"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DRAWER / PANEL LATERAL DE TU COMBO DE FIESTA */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between animate-slideInRight">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-fuchsia-900" />
                  <h3 className="font-bold text-base text-stone-900">
                    Tu Combo de Fiesta
                  </h3>
                </div>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1 rounded-full text-stone-400 hover:bg-stone-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista de Artículos */}
              <div className="mt-4 space-y-3 max-h-[58vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-stone-400 space-y-2">
                    <ShoppingBag className="w-10 h-10 mx-auto opacity-40" />
                    <p className="text-xs">No has agregado artículos al combo todavía.</p>
                  </div>
                ) : (
                  cart.map(({ item, quantity }) => (
                    <div
                      key={item.id}
                      className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1 truncate">
                        <h5 className="font-bold text-stone-900 truncate">{item.name}</h5>
                        <span className="text-[11px] text-stone-500 font-mono">
                          ${item.price.toFixed(2)} c/u
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="p-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold font-mono text-sm w-5 text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="p-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="p-1 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Totales y Acciones */}
            <div className="border-t border-stone-200 pt-4 space-y-3">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Piezas totales:</span>
                  <span className="font-mono font-bold">{totalPieces} uds.</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Tasa Oficial BCV:</span>
                  <span className="font-mono">{currentRate.toFixed(2)} Bs/$</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-stone-900 border-t border-stone-200 pt-1">
                  <span>Total USD:</span>
                  <span className="text-red-600 font-mono text-base">${totalUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-xs text-fuchsia-950 bg-fuchsia-50 p-2 rounded-xl border border-fuchsia-200">
                  <span>Total en Bolívares:</span>
                  <span className="font-mono">
                    Bs. {totalBs.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={handleSendQuoteWhatsApp}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Cotización por WhatsApp</span>
                </button>

                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={() => {
                    handleTransfer();
                    setShowCartDrawer(false);
                  }}
                  className="w-full py-3 bg-fuchsia-950 hover:bg-fuchsia-900 disabled:opacity-50 text-white rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Transferir a Factura / Presupuesto</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
