import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Phone, 
  MapPin, 
  Send, 
  Trash2, 
  Edit3, 
  Users, 
  Calendar,
  CheckCircle,
  Clock,
  Share2
} from 'lucide-react';
import { Client } from '../types';
import { generateSocialMediaWhatsAppMessage, COMPANY_INFO } from '../data/companyInfo';

interface ClientsModuleProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export const ClientsModule: React.FC<ClientsModuleProps> = ({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [cedulaRif, setCedulaRif] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenNewClient = () => {
    setEditingClient(null);
    setName('');
    setCedulaRif('');
    setPhone('');
    setAddress('');
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('⚠️ Por favor completa al menos el nombre y teléfono del cliente.');
      return;
    }

    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        name: name.trim(),
        cedulaRif: cedulaRif.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      showToast('Cliente actualizado correctamente');
      setEditingClient(null);
    } else {
      onAddClient({
        name: name.trim(),
        cedulaRif: cedulaRif.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });
      showToast('Cliente registrado con éxito en base de datos local');
    }

    setName('');
    setCedulaRif('');
    setPhone('');
    setAddress('');
    setIsFormOpen(false);
  };

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCedulaRif(client.cedulaRif || '');
    setPhone(client.phone);
    setAddress(client.address);
    setIsFormOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingClient(null);
    setName('');
    setCedulaRif('');
    setPhone('');
    setAddress('');
    setIsFormOpen(false);
  };

  const handleDeleteClick = (id: string, clientName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al cliente "${clientName}"?`)) {
      onDeleteClient(id);
      showToast('Cliente eliminado de la base local');
    }
  };

  // Filtrado en tiempo real incluyendo Cédula / RIF
  const filteredClients = clients.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.cedulaRif && c.cedulaRif.toLowerCase().includes(term)) ||
      c.phone.toLowerCase().includes(term) ||
      c.address.toLowerCase().includes(term)
    );
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" />
            <span className="text-stone-900">Módulo 1: Registro de Clientes</span>
          </h2>
          <p className="text-sm text-stone-500">
            Directorio con Cédula/RIF, datos de contacto para fiestas y enlace directo a WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl font-medium flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-red-500" />
            <span>{clients.length} clientes</span>
          </div>

          <button
            onClick={handleOpenNewClient}
            id="btn-register-new-client"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-fuchsia-200 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Registrar Nuevo Cliente</span>
          </button>
        </div>
      </div>

      {/* MODAL DESPLEGABLE: Formulario de Registro / Edición */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-fuchsia-100 max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-fuchsia-100">
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-fuchsia-600" />
                <span>{editingClient ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}</span>
              </h3>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nombre y Apellido *
                </label>
                <input
                  id="client-name-input"
                  type="text"
                  placeholder="Ej. Valentina Mendoza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Cédula / RIF (Documento de Identidad)
                </label>
                <input
                  id="client-cedula-rif-input"
                  type="text"
                  placeholder="Ej. V-26136645-0 / J-12345678-0"
                  value={cedulaRif}
                  onChange={(e) => setCedulaRif(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-colors uppercase font-mono"
                />
                <span className="text-[11px] text-stone-400 mt-1 block">
                  Identificador para la emisión formal de facturas y notas de entrega.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  id="client-phone-input"
                  type="text"
                  placeholder="Ej. +584141234567 o 04141234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Dirección / Lugar del Evento
                </label>
                <textarea
                  id="client-address-input"
                  rows={3}
                  placeholder="Ej. Urb. Las Delicias, Quinta Los Rosales..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  id="save-client-btn"
                  className="py-2.5 px-5 bg-gradient-to-r from-red-600 to-fuchsia-600 hover:from-red-700 hover:to-fuchsia-700 text-white rounded-xl text-sm font-semibold shadow-xs shadow-fuchsia-200 transition-all cursor-pointer"
                >
                  {editingClient ? 'Actualizar Cliente' : 'Guardar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Directorio de Clientes (Ancho Completo) */}
      <div className="space-y-4">
        {/* Barra de Búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-client-input"
            type="text"
            placeholder="Buscar por nombre, Cédula/RIF, teléfono o dirección en tiempo real..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500/30 focus:border-fuchsia-500 shadow-xs transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Tabla de Clientes */}
        <div className="bg-white rounded-2xl border border-fuchsia-100 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-fuchsia-100 bg-gradient-to-r from-red-50/40 to-fuchsia-50/40 flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-fuchsia-950">
              Directorio de Clientes ({filteredClients.length})
            </h4>
            <span className="text-[11px] text-stone-400">
              Persistencia en localStorage
            </span>
          </div>

          {filteredClients.length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              <Users className="w-12 h-12 mx-auto text-stone-300 mb-2" />
              <p className="text-sm font-medium">No se encontraron clientes</p>
              <p className="text-xs mt-1 mb-4">Usa el botón "Registrar Nuevo Cliente" para comenzar.</p>
              <button
                onClick={handleOpenNewClient}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-fuchsia-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrar Primer Cliente</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 overflow-x-auto">
              {filteredClients.map((client) => {
                // Limpiar teléfono para WhatsApp
                const rawPhone = client.phone.replace(/[^0-9]/g, '');
                const formattedPhone = rawPhone.startsWith('0') 
                  ? `58${rawPhone.slice(1)}` 
                  : rawPhone.startsWith('58') 
                  ? rawPhone 
                  : `58${rawPhone}`;

                const defaultMessage = encodeURIComponent(
                  `¡Hola ${client.name}! Te escribimos desde *${COMPANY_INFO.name}*. "${COMPANY_INFO.slogan}". ¿En qué podemos ayudarte para tu próximo evento? ✨`
                );
                const whatsappUrl = `https://wa.me/${formattedPhone}?text=${defaultMessage}`;

                const socialMessage = encodeURIComponent(
                  generateSocialMediaWhatsAppMessage(client.name)
                );
                const socialWhatsappUrl = `https://wa.me/${formattedPhone}?text=${socialMessage}`;

                return (
                  <div
                    key={client.id}
                    className="p-4 hover:bg-fuchsia-50/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-stone-800 text-sm">
                          {client.name}
                        </span>
                        {client.cedulaRif && (
                          <span className="text-[10px] font-mono font-bold bg-fuchsia-50 text-fuchsia-900 border border-fuchsia-200 px-2 py-0.5 rounded-md">
                            {client.cedulaRif}
                          </span>
                        )}
                        <span className="text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-mono">
                          {client.createdAt ? new Date(client.createdAt).toLocaleDateString('es-VE') : 'Reciente'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          {client.phone}
                        </span>
                        {client.address && (
                          <span className="flex items-center gap-1 truncate max-w-xs">
                            <MapPin className="w-3.5 h-3.5 text-stone-400" />
                            {client.address}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
                      {/* Botón Solicitado: Enviar redes sociales vía WhatsApp */}
                      <a
                        href={socialWhatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        title="Enviar vía WhatsApp los perfiles de redes sociales de la empresa"
                      >
                        <Share2 className="w-3 h-3 text-pink-200" />
                        <span>Enviar Redes</span>
                      </a>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        title="Enviar mensaje de saludo por WhatsApp"
                      >
                        <Send className="w-3 h-3" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        onClick={() => handleEditClick(client)}
                        title="Editar cliente"
                        className="p-2 text-stone-500 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteClick(client.id, client.name)}
                        title="Eliminar cliente"
                        className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
