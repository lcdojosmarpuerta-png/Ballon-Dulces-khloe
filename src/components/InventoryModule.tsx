import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  DollarSign, 
  Layers, 
  CheckCircle, 
  Upload, 
  Link as LinkIcon,
  Tag,
  Share2,
  MessageCircle,
  Copy,
  Check,
  X
} from 'lucide-react';
import { InventoryCategory, InventoryItem } from '../types';

interface InventoryModuleProps {
  inventory: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id' | 'updatedAt'>) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

const CATEGORIES: InventoryCategory[] = [
  'Mobiliario',
  'Decoración',
  'Pasapalos',
  'Comestibles',
  'Equipos de sonido',
];

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  inventory,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogPhone, setCatalogPhone] = useState('');
  const [copiedCatalog, setCopiedCatalog] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('Decoración');
  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<number>(10);
  const [imageUrl, setImageUrl] = useState('');
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setCategory('Decoración');
    setQuantity(1);
    setPrice(10);
    setImageUrl('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category);
    setQuantity(item.quantity);
    setPrice(item.price);
    setImageUrl(item.imageUrl);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('⚠️ La imagen no debe exceder los 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('⚠️ Ingresa el nombre del artículo.');
      return;
    }

    const finalImage = imageUrl.trim() || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&auto=format&fit=crop&q=80';

    if (editingItem) {
      onUpdateItem({
        ...editingItem,
        name: name.trim(),
        category,
        quantity: Number(quantity) || 0,
        price: Number(price) || 0,
        imageUrl: finalImage,
        updatedAt: new Date().toISOString(),
      });
      showToast('Artículo de inventario actualizado');
    } else {
      onAddItem({
        name: name.trim(),
        category,
        quantity: Number(quantity) || 0,
        price: Number(price) || 0,
        imageUrl: finalImage,
      });
      showToast('Nuevo artículo agregado al stock');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, itemName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el artículo "${itemName}" del inventario?`)) {
      onDeleteItem(id);
      showToast('Artículo eliminado del inventario');
    }
  };

  const generateWhatsAppCatalog = () => {
    let text = `🎈 *BALLÓN DULCES KLHOE* 🎈\n`;
    text += `_"Detalles que marcan la diferencia en tu fiesta"_\n`;
    text += `✨ *CATÁLOGO OFICIAL DE ARTÍCULOS Y MOBILIARIO* ✨\n`;
    text += `-------------------------------------------------\n\n`;

    CATEGORIES.forEach((cat) => {
      const itemsInCat = inventory.filter((item) => item.category === cat);
      if (itemsInCat.length > 0) {
        const catEmoji = cat === 'Mobiliario' ? '🛋️' : cat === 'Decoración' ? '🎀' : cat === 'Pasapalos' ? '🍢' : cat === 'Comestibles' ? '🧁' : '🔊';
        text += `${catEmoji} *${cat.toUpperCase()}:*\n`;
        itemsInCat.forEach((it) => {
          text += `• *${it.name}* - $${it.price.toFixed(2)} USD (Disponibles: ${it.quantity} uds)\n`;
        });
        text += `\n`;
      }
    });

    text += `-------------------------------------------------\n`;
    text += `📌 *Nota:* Precios expresados en USD, pagaderos en Bolívares (Bs) según la Tasa Oficial BCV del día.\n`;
    text += `📲 *Para presupuestos y reservas contáctanos al:* +58 414-1234567\n`;
    text += `✨ ¡Gracias por preferir Ballón Dulces Klhoe!`;
    return text;
  };

  const handleSendCatalogWhatsApp = () => {
    const catalogText = generateWhatsAppCatalog();
    let targetPhone = catalogPhone.replace(/[^0-9]/g, '');
    if (targetPhone.startsWith('0')) {
      targetPhone = `58${targetPhone.slice(1)}`;
    } else if (targetPhone && !targetPhone.startsWith('58')) {
      targetPhone = `58${targetPhone}`;
    }

    const whatsappUrl = targetPhone
      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(catalogText)}`
      : `https://wa.me/?text=${encodeURIComponent(catalogText)}`;

    window.open(whatsappUrl, '_blank');
    setIsCatalogModalOpen(false);
  };

  const handleCopyCatalog = () => {
    const catalogText = generateWhatsAppCatalog();
    navigator.clipboard.writeText(catalogText);
    setCopiedCatalog(true);
    setTimeout(() => setCopiedCatalog(false), 2500);
  };

  // Filtrado
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-stone-800 text-sm">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Boxes className="w-6 h-6 text-fuchsia-600" />
            <span className="text-stone-900">Módulo 2: Carga de Inventario</span>
          </h2>
          <p className="text-sm text-stone-500">
            Control de existencias para mobiliario, decoración, pasapalos, comestibles y sonido.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsCatalogModalOpen(true)}
            id="btn-share-catalog-whatsapp"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-emerald-200 transition-all cursor-pointer"
            title="Compartir catálogo con todo el stock por WhatsApp a clientes"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Compartir Catálogo (WhatsApp)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            id="btn-add-inventory"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-fuchsia-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Artículo</span>
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-inventory-input"
            type="text"
            placeholder="Buscar por nombre de artículo o servicio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 shadow-xs"
          />
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {['Todas', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-red-600 to-fuchsia-600 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-fuchsia-100 hover:bg-fuchsia-50/60 hover:text-fuchsia-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Tarjetas (Visual & High Quality) */}
      {filteredInventory.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-sky-100 shadow-xs">
          <Boxes className="w-12 h-12 mx-auto text-stone-300 mb-3" />
          <h3 className="text-base font-semibold text-stone-700">Inventario listo para ingresar artículos</h3>
          <p className="text-xs text-stone-400 mt-1 mb-4">
            Comienza agregando el mobiliario, arreglos con globos, dulces o pasapalos de tu emprendimiento.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 via-pink-500 to-amber-500 hover:from-sky-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar Primer Producto</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map((item) => {
            const isLowStock = item.quantity <= 3;
            return (
              <div
                key={item.id}
                id={`inventory-card-${item.id}`}
                className="group bg-white rounded-2xl border border-fuchsia-100/90 shadow-xs hover:border-fuchsia-300 hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Imagen del Producto */}
                  <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        // Fallback image
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-md text-fuchsia-900 text-[11px] font-bold rounded-lg shadow-xs border border-fuchsia-100">
                        {item.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg shadow-xs backdrop-blur-md ${
                          isLowStock
                            ? 'bg-red-500/95 text-white'
                            : 'bg-fuchsia-700/95 text-white'
                        }`}
                      >
                        Stock: {item.quantity} uds
                      </span>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-stone-800 text-base leading-snug line-clamp-2">
                      {item.name}
                    </h3>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="text-[11px] text-stone-400 uppercase font-semibold block">
                          Precio Unitario
                        </span>
                        <div className="text-xl font-extrabold text-red-600 font-mono">
                          ${item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción: Editar y Eliminar */}
                <div className="px-4 py-3 bg-stone-50/70 border-t border-fuchsia-50 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    id={`edit-item-${item.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-fuchsia-300 hover:text-fuchsia-600 rounded-xl text-xs font-semibold text-stone-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>

                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    id={`delete-item-${item.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 hover:border-red-300 hover:text-red-600 rounded-xl text-xs font-semibold text-stone-700 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Agregar / Editar Artículo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-fuchsia-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
              <Boxes className="w-5 h-5 text-fuchsia-600" />
              <span>{editingItem ? 'Editar Artículo' : 'Nuevo Artículo para Eventos'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre del Artículo / Servicio *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Set de globos temáticos dorados..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Categoría *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Cantidad Disponible (Stock) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Precio Unitario en Dólares ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 font-mono"
                  required
                />
              </div>

              {/* Imagen: URL o Carga de archivo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-stone-700">
                    Imagen del Producto
                  </label>
                  <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageInputMode('url')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        imageInputMode === 'url' ? 'bg-white shadow-xs font-semibold text-fuchsia-900' : 'text-stone-500'
                      }`}
                    >
                      Enlace / URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className={`px-2 py-0.5 rounded-md cursor-pointer ${
                        imageInputMode === 'upload' ? 'bg-white shadow-xs font-semibold text-fuchsia-900' : 'text-stone-500'
                      }`}
                    >
                      Subir Archivo
                    </button>
                  </div>
                </div>

                {imageInputMode === 'url' ? (
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-fuchsia-200 rounded-xl hover:bg-fuchsia-50/50 cursor-pointer text-xs text-fuchsia-700 font-medium">
                      <Upload className="w-4 h-4" />
                      <span>Seleccionar imagen desde tu dispositivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Previsualización */}
                {imageUrl && (
                  <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-stone-200">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-xl text-sm font-semibold shadow-xs shadow-fuchsia-200 transition-all cursor-pointer"
                >
                  {editingItem ? 'Guardar Cambios' : 'Registrar en Inventario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPARTIR CATÁLOGO POR WHATSAPP */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-fuchsia-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-fuchsia-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Compartir Catálogo por WhatsApp
                  </h3>
                  <p className="text-xs text-stone-500">
                    Envía el inventario completo organizado por categorías a tus clientes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCatalogModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Teléfono opcional del cliente */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Número de WhatsApp del Cliente (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. +584141234567 o déjalo vacío para abrir WhatsApp y elegir contacto"
                value={catalogPhone}
                onChange={(e) => setCatalogPhone(e.target.value)}
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Si colocas el número, abrirá directamente el chat con este cliente.
              </span>
            </div>

            {/* Vista Previa del Catálogo */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                  Vista Previa del Mensaje ({inventory.length} artículos en stock)
                </span>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  Formato WhatsApp
                </span>
              </div>
              <pre className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-[11px] text-stone-800 font-mono max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
                {generateWhatsAppCatalog()}
              </pre>
            </div>

            {/* Botones de Acción */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={handleCopyCatalog}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white border border-stone-300 hover:border-emerald-500 text-stone-700 hover:text-emerald-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                {copiedCatalog ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>¡Catálogo Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Catálogo</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSendCatalogWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-emerald-200 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
