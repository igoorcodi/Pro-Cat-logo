
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Package, 
  User as UserIcon, 
  Smartphone,
  Info,
  Layers,
  X,
  Ticket,
  ShoppingCart,
  Edit2,
  Eye,
  RotateCcw,
  Calendar,
  Hash,
  Ban,
  Wallet,
  SlidersHorizontal,
  Filter,
  RefreshCw,
  SearchCheck,
  ChevronUp,
  ArrowUpDown
} from 'lucide-react';
import { ShowcaseOrder } from '../types';

interface ShowcaseOrderListProps {
  orders: ShowcaseOrder[];
  onComplete: (id: number | string) => Promise<void>;
  onRevert: (id: number | string) => void;
  onDelete: (id: number | string, name: string) => void;
  onEdit: (order: ShowcaseOrder) => void;
}

type SortConfig = { key: keyof ShowcaseOrder; direction: 'asc' | 'desc' } | null;

const ShowcaseOrderList: React.FC<ShowcaseOrderListProps> = ({ orders, onComplete, onRevert, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'completed' | 'canceled'>('all');
  const [viewingItems, setViewingItems] = useState<ShowcaseOrder | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  
  // Estados do Filtro Avançado
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    startDate: '',
    endDate: '',
    clientName: '',
    orderId: '',
    clientPhone: '',
    status: 'all'
  });

  const handleSort = (key: keyof ShowcaseOrder) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredOrders = useMemo(() => {
    let result = orders.filter(o => {
      // Busca Rápida (Search Term)
      const term = searchTerm.toLowerCase();
      const matchesQuickSearch = !searchTerm || 
                           o.client_name.toLowerCase().includes(term) || 
                           o.client_phone.includes(term) || 
                           String(o.id).includes(term);
      
      // Filtro de Status (Dropdown Principal)
      const matchesQuickStatus = statusFilter === 'all' || o.status === statusFilter;

      // Filtros Avançados
      const orderDate = new Date(o.created_at);
      orderDate.setHours(0, 0, 0, 0);

      const matchesStartDate = !advancedFilters.startDate || orderDate >= new Date(advancedFilters.startDate);
      const matchesEndDate = !advancedFilters.endDate || orderDate <= new Date(advancedFilters.endDate);
      const matchesName = !advancedFilters.clientName || o.client_name.toLowerCase().includes(advancedFilters.clientName.toLowerCase());
      const matchesId = !advancedFilters.orderId || String(o.id) === advancedFilters.orderId;
      const matchesPhone = !advancedFilters.clientPhone || o.client_phone.includes(advancedFilters.clientPhone);
      const matchesStatus = advancedFilters.status === 'all' || o.status === advancedFilters.status;

      return matchesQuickSearch && matchesQuickStatus && matchesStartDate && matchesEndDate && matchesName && matchesId && matchesPhone && matchesStatus;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let valA: any = a[sortConfig.key];
        let valB: any = b[sortConfig.key];

        if (sortConfig.key === 'created_at') {
          valA = new Date(valA || 0).getTime();
          valB = new Date(valB || 0).getTime();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [orders, searchTerm, statusFilter, advancedFilters, sortConfig]);

  const SortIcon = ({ column }: { column: keyof ShowcaseOrder }) => {
    if (sortConfig?.key !== column) return <ArrowUpDown size={12} className="opacity-30" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={12} className="text-indigo-600" /> : <ChevronDown size={12} className="text-indigo-600" />;
  };

  const handleWhatsApp = (phone: string, order: ShowcaseOrder) => {
    const cleanPhone = phone.replace(/\D/g, '');
    let msg = `Olá ${order.client_name}, referente ao seu pedido #${order.id} na vitrine...`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const clearAdvancedFilters = () => {
    setAdvancedFilters({
      startDate: '',
      endDate: '',
      clientName: '',
      orderId: '',
      clientPhone: '',
      status: 'all'
    });
  };

  const hasActiveAdvancedFilters = useMemo(() => {
    return advancedFilters.startDate !== '' || 
           advancedFilters.endDate !== '' || 
           advancedFilters.clientName !== '' || 
           advancedFilters.orderId !== '' || 
           advancedFilters.clientPhone !== '' || 
           advancedFilters.status !== 'all';
  }, [advancedFilters]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full md:w-1/2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Busca rápida (Nome, ID, Tel)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className={`p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center relative group ${hasActiveAdvancedFilters ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            title="Filtro Avançado"
          >
            <SearchCheck size={20} className={hasActiveAdvancedFilters ? 'animate-pulse' : ''} />
            {hasActiveAdvancedFilters && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                !
              </span>
            )}
          </button>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="w-full md:w-auto px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-50"
          >
            <option value="all">Todos os Pedidos</option>
            <option value="waiting">Aguardando</option>
            <option value="completed">Concluídos</option>
            <option value="canceled">Estornados</option>
          </select>
        </div>
      </div>

      {/* Visão Desktop - Tabela Estruturada */}
      <div className="hidden lg:block bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-left w-28">
                  <button onClick={() => handleSort('id')} className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                    Código <SortIcon column="id" />
                  </button>
                </th>
                <th className="px-6 py-5 text-left">
                  <button onClick={() => handleSort('created_at')} className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                    Data / Horário <SortIcon column="created_at" />
                  </button>
                </th>
                <th className="px-6 py-5 text-left">
                  <button onClick={() => handleSort('client_name')} className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                    Cliente <SortIcon column="client_name" />
                  </button>
                </th>
                <th className="px-6 py-5 text-center">
                  <button onClick={() => handleSort('total')} className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mx-auto">
                    Total <SortIcon column="total" />
                  </button>
                </th>
                <th className="px-6 py-5 text-center">
                  <button onClick={() => handleSort('status')} className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors mx-auto">
                    Status <SortIcon column="status" />
                  </button>
                </th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest sticky right-0 bg-slate-50 z-10 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.1)]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map(order => {
                const orderDate = new Date(order.created_at);
                return (
                  <tr key={order.id} className={`group transition-colors ${order.status === 'completed' ? 'bg-emerald-50/5' : order.status === 'canceled' ? 'opacity-60 bg-slate-50/50' : 'hover:bg-slate-50/80'}`}>
                    <td className="px-6 py-5">
                      <span className="font-mono text-xs font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 uppercase">#{order.id}</span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                           <Calendar size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700">{orderDate.toLocaleDateString('pt-BR')}</span>
                          <span className="text-[10px] font-bold text-slate-400">{orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                          <UserIcon size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-800 uppercase truncate">{order.client_name}</p>
                          <p className="text-[10px] font-bold text-slate-400 truncate">{order.client_phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-black text-indigo-600">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                        order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                        order.status === 'canceled' ? 'bg-slate-100 text-slate-400 border-slate-200' :
                        'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.status === 'completed' ? <CheckCircle2 size={12} /> : order.status === 'canceled' ? <Ban size={12} /> : <Clock size={12} />}
                        {order.status === 'completed' ? 'Concluído' : order.status === 'canceled' ? 'Estornado' : 'Aguardando'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right sticky right-0 bg-white group-hover:bg-slate-50 z-10 shadow-[-10px_0_15px_-10px_rgba(0,0,0,0.1)] transition-colors">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === 'waiting' && (
                          <button 
                            onClick={() => onComplete(order.id)}
                            title="Concluir Pedido e Baixar Estoque"
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95"
                          >
                            <CheckCircle2 size={16} /> Confirmar
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <button 
                            onClick={() => onRevert(order.id)}
                            title="Estornar: Pedido voltará ao registro e estoque será devolvido"
                            className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-all shadow-sm"
                          >
                            <RotateCcw size={18} />
                          </button>
                        )}
                        <button onClick={() => setViewingItems(order)} title="Ver Itens" className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Eye size={18} /></button>
                        {order.status !== 'canceled' && (
                          <button onClick={() => onEdit(order)} title="Editar Dados" className="p-2.5 bg-slate-50 text-slate-400 hover:text-indigo-600 rounded-xl transition-all shadow-sm"><Edit2 size={18} /></button>
                        )}
                        <button onClick={() => handleWhatsApp(order.client_phone, order)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"><MessageCircle size={18}/></button>
                        <button onClick={() => onDelete(order.id, order.client_name)} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={18}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visão Mobile */}
      <div className="lg:hidden space-y-4">
        {filteredOrders.map(order => {
          const orderDate = new Date(order.created_at);
          return (
            <div key={order.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-black text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  #{order.id}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                  order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                  order.status === 'canceled' ? 'bg-slate-100 text-slate-400 border-slate-200' :
                  'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {order.status === 'completed' ? 'Concluído' : order.status === 'canceled' ? 'Estornado' : 'Aguardando'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                  <UserIcon size={20} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-slate-800 text-base uppercase truncate">{order.client_name}</h4>
                  <p className="text-[11px] font-bold text-slate-400">{orderDate.toLocaleDateString('pt-BR')} às {orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-y border-slate-50">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total do Pedido</p>
                   <p className="text-lg font-black text-indigo-600">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <button 
                  onClick={() => setViewingItems(order)}
                  className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest border border-slate-100"
                >
                  {order.items?.length || 0} Itens
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {order.status === 'waiting' && (
                  <button 
                    onClick={() => onComplete(order.id)}
                    className="col-span-2 flex items-center justify-center gap-2 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest"
                  >
                    <CheckCircle2 size={16} /> Confirmar Entrega
                  </button>
                )}
                <button 
                  onClick={() => handleWhatsApp(order.client_phone, order)}
                  className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                >
                  <MessageCircle size={16} /> Whats
                </button>
                <button 
                  onClick={() => onEdit(order)}
                  className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                >
                  <Edit2 size={16} /> Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center space-y-4">
           <ShoppingCart size={48} className="text-slate-200" />
           <p className="font-black text-slate-800 uppercase tracking-widest">Nenhum pedido encontrado</p>
           {hasActiveAdvancedFilters && (
             <button onClick={clearAdvancedFilters} className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline">Limpar Filtros Avançados</button>
           )}
        </div>
      )}

      {/* Modal de Filtro Avançado - PREENCHENDO TODA A TELA COM BLUR */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl h-full sm:h-auto sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
              <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                       <Filter size={24} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black uppercase tracking-tight">Filtro Avançado</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Refine sua busca de pedidos vitrine</p>
                    </div>
                 </div>
                 <button onClick={() => setIsFilterModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <Calendar size={14} className="text-indigo-500" /> Data Inicial
                       </label>
                       <input 
                         type="date" 
                         value={advancedFilters.startDate}
                         onChange={e => setAdvancedFilters({...advancedFilters, startDate: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 outline-none"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <Calendar size={14} className="text-indigo-500" /> Data Final
                       </label>
                       <input 
                         type="date" 
                         value={advancedFilters.endDate}
                         onChange={e => setAdvancedFilters({...advancedFilters, endDate: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <UserIcon size={14} className="text-indigo-500" /> Nome do Cliente
                    </label>
                    <input 
                      type="text" 
                      placeholder="Pesquisar por nome completo ou parte dele..."
                      value={advancedFilters.clientName}
                      onChange={e => setAdvancedFilters({...advancedFilters, clientName: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 outline-none"
                    />
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <Hash size={14} className="text-indigo-500" /> ID do Pedido
                       </label>
                       <input 
                         type="text" 
                         placeholder="Ex: 42"
                         value={advancedFilters.orderId}
                         onChange={e => setAdvancedFilters({...advancedFilters, orderId: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 outline-none"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                         <Smartphone size={14} className="text-indigo-500" /> WhatsApp / Tel
                       </label>
                       <input 
                         type="tel" 
                         placeholder="Somente números..."
                         value={advancedFilters.clientPhone}
                         onChange={e => setAdvancedFilters({...advancedFilters, clientPhone: e.target.value})}
                         className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-50 outline-none"
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <Ban size={14} className="text-indigo-500" /> Situação do Pedido
                    </label>
                    <div className="relative">
                      <select 
                        value={advancedFilters.status}
                        onChange={e => setAdvancedFilters({...advancedFilters, status: e.target.value})}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-black text-sm focus:ring-4 focus:ring-indigo-50 outline-none appearance-none"
                      >
                         <option value="all">Todas as Situações</option>
                         <option value="waiting">⏳ Aguardando Confirmação</option>
                         <option value="completed">✅ Concluído</option>
                         <option value="canceled">🚫 Estornado / Cancelado</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                 </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-4 shrink-0">
                 <button 
                  onClick={clearAdvancedFilters}
                  className="flex-1 flex items-center justify-center gap-3 px-6 py-5 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
                 >
                    <RefreshCw size={18} /> Limpar
                 </button>
                 <button 
                  onClick={() => setIsFilterModalOpen(false)}
                  className="flex-[2] flex items-center justify-center gap-3 px-6 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                 >
                    <CheckCircle2 size={20} /> Aplicar Filtros
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal de Detalhes dos Itens */}
      {viewingItems && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[85vh]">
             <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight">Itens do Pedido</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Pedido #{viewingItems.id} • {viewingItems.client_name}</p>
                  </div>
                </div>
                <button onClick={() => setViewingItems(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
             </div>
             <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 gap-3">
                   {viewingItems.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shrink-0 border border-slate-200">
                            {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200"><Info size={20}/></div>}
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-800 text-sm uppercase truncate">{item.productName}</h4>
                            {item.selectedSub && <p className="text-[10px] font-bold text-indigo-500 uppercase">Opção: {item.selectedSub.name}</p>}
                            <p className="text-[11px] font-bold text-slate-400 mt-1">{item.quantity} un. x R$ {item.price.toLocaleString('pt-BR')}</p>
                         </div>
                         <div className="text-right">
                            <p className="font-black text-indigo-600">R$ {(item.price * item.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                         </div>
                      </div>
                   ))}
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-3">
                   {viewingItems.coupon_code && (
                      <div className="flex items-center justify-between text-emerald-600">
                         <div className="flex items-center gap-2"><Ticket size={16}/><span className="text-[10px] font-black uppercase tracking-widest">Cupom Aplicado</span></div>
                         <span className="font-black text-xs uppercase">{viewingItems.coupon_code}</span>
                      </div>
                   )}
                   {viewingItems.payment_method_name && (
                      <div className="flex items-center justify-between text-slate-500">
                         <div className="flex items-center gap-2"><Wallet size={16}/><span className="text-[10px] font-black uppercase tracking-widest">Pagamento</span></div>
                         <span className="font-black text-xs uppercase">{viewingItems.payment_method_name}</span>
                      </div>
                   )}
                   <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Total Geral</span>
                      <span className="text-3xl font-black text-indigo-600">R$ {viewingItems.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                   </div>
                </div>
             </div>
             <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button onClick={() => setViewingItems(null)} className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-slate-100 transition-all">Fechar</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowcaseOrderList;
