
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  ChevronRight, 
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
  Ban
} from 'lucide-react';
import { ShowcaseOrder } from '../types';

interface ShowcaseOrderListProps {
  orders: ShowcaseOrder[];
  onComplete: (id: number | string) => Promise<void>;
  onRevert: (id: number | string) => void;
  onDelete: (id: number | string, name: string) => void;
  onEdit: (order: ShowcaseOrder) => void;
}

const ShowcaseOrderList: React.FC<ShowcaseOrderListProps> = ({ orders, onComplete, onRevert, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'completed' | 'canceled'>('all');
  const [viewingItems, setViewingItems] = useState<ShowcaseOrder | null>(null);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return orders.filter(o => {
      const matchesSearch = o.client_name.toLowerCase().includes(term) || 
                           o.client_phone.includes(term) || 
                           String(o.id).includes(term);
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const handleWhatsApp = (phone: string, order: ShowcaseOrder) => {
    const cleanPhone = phone.replace(/\D/g, '');
    let msg = `Olá ${order.client_name}, referente ao seu pedido #${order.id} na vitrine...`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente, telefone ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm"
          />
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
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-28">Código</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Data / Horário</th>
              <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
              <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
              <th className="px-6 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.map(order => {
              const orderDate = new Date(order.created_at);
              return (
                <tr key={order.id} className={`group hover:bg-slate-50/80 transition-colors ${order.status === 'completed' ? 'bg-emerald-50/5' : order.status === 'canceled' ? 'opacity-60 bg-slate-50/50' : ''}`}>
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
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      {order.status === 'waiting' && (
                        <button 
                          onClick={() => onComplete(order.id)}
                          title="Concluir Pedido e Baixar Estoque"
                          className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                        >
                          <CheckCircle2 size={18} />
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
                      <button onClick={() => setViewingItems(order)} title="Ver Itens" className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"><Eye size={18} /></button>
                      {order.status !== 'canceled' && (
                        <button onClick={() => onEdit(order)} title="Editar Dados" className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"><Edit2 size={18} /></button>
                      )}
                      <button onClick={() => handleWhatsApp(order.client_phone, order)} className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-all"><MessageCircle size={18}/></button>
                      <button onClick={() => onDelete(order.id, order.client_name)} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Visão Mobile - Cards Refinados */}
      <div className="lg:hidden space-y-4">
        {filteredOrders.map(order => {
          const orderDate = new Date(order.created_at);
          return (
            <div key={order.id} className={`bg-white rounded-[2rem] p-5 border-2 transition-all active:scale-[0.98] ${
              order.status === 'completed' ? 'border-emerald-100' : 
              order.status === 'canceled' ? 'border-slate-100 opacity-60' :
              'border-slate-50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="font-mono text-[11px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 w-fit mb-1">#{order.id}</span>
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                    <Clock size={12} />
                    {orderDate.toLocaleDateString('pt-BR')} - {orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  order.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
                  order.status === 'canceled' ? 'bg-slate-100 text-slate-400 border border-slate-200' :
                  'bg-amber-50 text-amber-600 border border-amber-100'
                }`}>
                  {order.status === 'completed' ? 'Concluído' : order.status === 'canceled' ? 'Estornado' : 'Aguardando'}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-5">
                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-indigo-400 shrink-0 border border-slate-100">
                    <UserIcon size={24} />
                 </div>
                 <div className="min-w-0 flex-1">
                    <h4 className="text-base font-black text-slate-800 uppercase leading-tight truncate">{order.client_name}</h4>
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-1"><Smartphone size={12} className="text-emerald-500" /> {order.client_phone}</p>
                 </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 rounded-[1.5rem] p-4 mb-5">
                 <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Total Geral</span>
                   <span className="text-xl font-black text-indigo-600 tracking-tight">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                 </div>
                 <button onClick={() => setViewingItems(order)} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 uppercase shadow-sm">
                   <Layers size={14} /> Itens
                 </button>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {order.status === 'waiting' && (
                  <button onClick={() => onComplete(order.id)} className="col-span-2 flex items-center justify-center gap-2 bg-emerald-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100 active:scale-95">
                    <CheckCircle2 size={16} /> Concluir
                  </button>
                )}
                {order.status === 'completed' && (
                  <button onClick={() => onRevert(order.id)} className="col-span-2 flex items-center justify-center gap-2 bg-amber-500 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-amber-100 active:scale-95">
                    <RotateCcw size={16} /> Estornar
                  </button>
                )}
                {order.status === 'canceled' && (
                  <div className="col-span-2 flex items-center justify-center gap-2 bg-slate-100 text-slate-400 py-3.5 rounded-2xl font-black text-[10px] uppercase cursor-not-allowed">
                    <Ban size={16} /> Bloqueado
                  </div>
                )}
                
                {order.status !== 'canceled' ? (
                  <button onClick={() => onEdit(order)} className="p-3.5 bg-white border border-slate-200 text-indigo-600 rounded-2xl flex items-center justify-center active:scale-95"><Edit2 size={20}/></button>
                ) : (
                  <button disabled className="p-3.5 bg-slate-50 border border-slate-100 text-slate-300 rounded-2xl flex items-center justify-center cursor-not-allowed"><Edit2 size={20}/></button>
                )}
                <button onClick={() => handleWhatsApp(order.client_phone, order)} className="p-3.5 bg-white border border-slate-200 text-emerald-600 rounded-2xl flex items-center justify-center active:scale-95"><MessageCircle size={20}/></button>
                <button onClick={() => onDelete(order.id, order.client_name)} className="p-3.5 bg-white border border-slate-200 text-red-400 rounded-2xl flex items-center justify-center active:scale-95"><Trash2 size={20}/></button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
           <ShoppingCart size={48} className="mx-auto mb-4 text-slate-300 opacity-40" />
           <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Nenhum pedido encontrado</p>
        </div>
      )}

      {/* Modal de Detalhes dos Itens */}
      {viewingItems && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[80vh]">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Package size={20} className="text-indigo-400" />
                  <div>
                    <h3 className="font-black text-sm uppercase">Itens do Pedido</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">#{viewingItems.id} • {viewingItems.client_name}</p>
                  </div>
               </div>
               <button onClick={() => setViewingItems(null)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
               {viewingItems.items?.map((item, idx) => (
                 <div key={idx} className="flex gap-4 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden border shrink-0">
                      {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <Package size={20} className="m-auto mt-3 text-slate-300" />}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                       <h4 className="text-xs font-black text-slate-800 uppercase truncate">{item.productName}</h4>
                       <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{item.quantity} un. x R$ {item.price.toLocaleString('pt-BR')}</p>
                          <p className="text-xs font-black text-indigo-600">R$ {(item.price * item.quantity).toLocaleString('pt-BR')}</p>
                       </div>
                       {item.selectedSub && <p className="text-[9px] font-black text-indigo-400 uppercase mt-1">Opção: {item.selectedSub.name}</p>}
                    </div>
                 </div>
               ))}
            </div>
            <div className="p-6 bg-white border-t border-slate-100">
               <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor do Pedido</span>
                 <span className="text-xl font-black text-slate-900">R$ {viewingItems.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="grid grid-cols-2 gap-3 mt-6">
                 {viewingItems.status !== 'canceled' && (
                    <button onClick={() => { setViewingItems(null); onEdit(viewingItems); }} className="py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                        <Edit2 size={14} /> Editar
                    </button>
                 )}
                 <button onClick={() => setViewingItems(null)} className={`py-4 ${viewingItems.status === 'canceled' ? 'col-span-2' : ''} bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all`}>Fechar</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowcaseOrderList;
