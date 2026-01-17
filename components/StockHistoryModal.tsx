
import React from 'react';
import { 
  X, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Calendar, 
  ShoppingCart,
  AlertCircle
} from 'lucide-react';
import { Product, StockHistoryEntry } from '../types';

interface StockHistoryModalProps {
  product: Product;
  onClose: () => void;
}

const StockHistoryModal: React.FC<StockHistoryModalProps> = ({ product, onClose }) => {
  const history = product.stock_history || [];

  const getReasonConfig = (reason: string) => {
    switch (reason) {
      case 'sale_delivery':
        return { icon: <ShoppingCart size={14} />, label: 'Venda (Entrega)', color: 'text-red-600', bg: 'bg-red-50' };
      case 'manual_adjustment':
        return { icon: <History size={14} />, label: 'Ajuste Manual', color: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 'initial_stock':
        return { icon: <Package size={14} />, label: 'Estoque Inicial', color: 'text-emerald-600', bg: 'bg-emerald-50' };
      default:
        return { icon: <AlertCircle size={14} />, label: 'Outros', color: 'text-slate-600', bg: 'bg-slate-50' };
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <History size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Histórico de Estoque</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{product.name} (SKU: {product.sku || 'N/A'})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-slate-50/50">
          {history.length > 0 ? (
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {history.slice().reverse().map((log: StockHistoryEntry, idx) => {
                const config = getReasonConfig(log.reason);
                const isPositive = log.change_amount > 0;
                
                return (
                  <div key={log.id} className="relative flex items-start gap-6 animate-in slide-in-from-left-4 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                    {/* Circle Icon */}
                    <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm z-10 shrink-0 ${config.bg} ${config.color} border border-white`}>
                      {config.icon}
                    </div>

                    {/* Log Card */}
                    <div className="flex-1 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                          {config.label}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar size={12} />
                          <span className="text-[10px] font-black uppercase">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Anterior</span>
                          <span className="text-lg font-black text-slate-400">{log.previous_stock}</span>
                        </div>
                        
                        <div className="flex flex-col items-center">
                           {isPositive ? <TrendingUp size={16} className="text-emerald-500 mb-1" /> : <TrendingDown size={16} className="text-red-500 mb-1" />}
                           <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                              {isPositive ? '+' : ''}{log.change_amount}
                           </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Novo Saldo</span>
                          <span className="text-lg font-black text-slate-900">{log.new_stock}</span>
                        </div>
                      </div>

                      {log.notes && (
                        <div className="mt-3 pt-3 border-t border-slate-50 flex items-start gap-2 italic text-slate-500 text-xs">
                           <span>"{log.notes}"</span>
                        </div>
                      )}

                      {log.reference_id && (
                        <div className="mt-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                          REF: #{log.reference_id.substring(0, 8)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30 gap-3">
              <History size={48} />
              <p className="font-black uppercase tracking-widest text-sm">Sem histórico registrado</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button onClick={onClose} className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
            Fechar Auditoria
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockHistoryModal;
