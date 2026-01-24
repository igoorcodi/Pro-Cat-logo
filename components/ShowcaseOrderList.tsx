
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
  Eye
} from 'lucide-react';
import { ShowcaseOrder } from '../types';

interface ShowcaseOrderListProps {
  orders: ShowcaseOrder[];
  onComplete: (id: number | string) => Promise<void>;
  onDelete: (id: number | string, name: string) => void;
  onEdit: (order: ShowcaseOrder) => void;
}

const ShowcaseOrderList: React.FC<ShowcaseOrderListProps> = ({ orders, onComplete, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'completed'>('all');
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
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className={`bg-white rounded-[2rem] p-6 border-2 transition-all hover:shadow-xl group relative overflow-hidden ${order.status === 'completed' ? 'border-emerald-100 opacity-80' : 'border-slate-50 hover:border-indigo-100'}`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {order.status === 'completed' ? <CheckCircle2 size={28} /> : <Clock size={28} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">#{order.id}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {order.status === 'completed' ? 'Concluído' : 'Aguardando'}
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-slate-800 uppercase truncate">{order.client_name}</h4>
                  <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5"><Smartphone size={12} className="text-indigo-400" /> {order.client_phone}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 lg:gap-8">
                <div className="flex flex-col items-center sm:items-start">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total do Pedido</p>
                   <p className="text-xl font-black text-indigo-600">R$ {order.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                
                <div className="flex flex-col items-center sm:items-start">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Ações Rápidas</p>
                   <div className="flex items-center gap-2">
                      <button onClick={() => setViewingItems(order)} title="Ver Itens" className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"><Eye size={18} /></button>
                      {order.status === 'waiting' && <button onClick={() => onEdit(order)} title="Editar Pedido" className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-all"><Edit2 size={18} /></button>}
                   </div>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  {order.status === 'waiting' && (
                    <button 
                      onClick={() => onComplete(order.id)}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all active:scale-95"
                    >
                      <CheckCircle2 size={16} /> Concluir Pedido
                    </button>
                  )}
                  <button onClick={() => handleWhatsApp(order.client_phone, order)} className="p-3 bg-white border border-slate-200 text-emerald-600 rounded-2xl hover:bg-emerald-50 transition-all shadow-sm"><MessageCircle size={20}/></button>
                  <button onClick={() => onDelete(order.id, order.client_name)} className="p-3 bg-white border border-slate-200 text-red-400 rounded-2xl hover:bg-red-50 transition-all shadow-sm"><Trash2 size={20}/></button>
                </div>
              </div>
            </div>
            
            {order.coupon_code && (
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                 <Ticket size={12} className="text-indigo-500" />
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">CUPOM APLICADO:</span>
                 <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">{order.coupon_code}</span>
              </div>
            )}
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
             <ShoppingCart size={48} className="mx-auto mb-4 text-slate-300 opacity-40" />
             <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Nenhum pedido encontrado</p>
          </div>
        )}
      </div>

      {/* Modal de Detalhes dos Itens */}
      {viewingItems && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
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
                 <button onClick={() => { setViewingItems(null); onEdit(viewingItems); }} className="py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-100 transition-all flex items-center justify-center gap-2">
                    <Edit2 size={14} /> Editar
                 </button>
                 <button onClick={() => setViewingItems(null)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Fechar</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowcaseOrderList;
