
import React, { useState, useMemo } from 'react';
import { 
  Ticket, 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  Tag, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Percent,
  DollarSign,
  ChevronDown,
  Save,
  Users,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { Promotion } from '../types';

interface PromotionManagerProps {
  promotions: Promotion[];
  onSave: (promo: Partial<Promotion>) => void;
  onDelete: (id: string | number, name: string) => void;
}

const PromotionManager: React.FC<PromotionManagerProps> = ({ promotions, onSave, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<Partial<Promotion> | null>(null);

  const filteredPromos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return promotions.filter(p => p.code.toLowerCase().includes(term));
  }, [promotions, searchTerm]);

  const handleOpenForm = (promo?: Promotion) => {
    setEditingPromo(promo || {
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_value: 0,
      max_discount_value: 0,
      usage_limit: 0,
      show_on_home: false,
      status: 'active'
    });
    setIsFormOpen(true);
  };

  return (
    <>
      {/* Container Principal Animado */}
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código do cupom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm"
            />
          </div>
          <button 
            onClick={() => handleOpenForm()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} /> Novo Cupom
          </button>
        </div>

        {filteredPromos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromos.map(promo => {
              const isExpired = promo.expiry_date && new Date(promo.expiry_date) < new Date();
              const isFull = promo.usage_limit > 0 && promo.usage_count >= promo.usage_limit;
              
              return (
                <div key={promo.id} className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                  {(isExpired || isFull) && <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[1px] z-10" />}
                  
                  <div className="absolute top-4 right-4 flex gap-2 z-20">
                    <button onClick={() => handleOpenForm(promo)} className="p-2 bg-white/80 backdrop-blur-md text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm"><Edit2 size={16}/></button>
                    <button onClick={() => onDelete(promo.id, promo.code)} className="p-2 bg-white/80 backdrop-blur-md text-slate-400 hover:text-red-500 rounded-xl shadow-sm"><Trash2 size={16}/></button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${promo.status === 'active' && !isFull && !isExpired ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Ticket size={28} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase truncate">{promo.code}</h4>
                        {promo.show_on_home && <Eye size={14} className="text-indigo-500" title="Exibindo na vitrine" />}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${promo.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {promo.status === 'active' ? 'Ativo' : 'Pausado'}
                        </span>
                        {isFull && <span className="text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-500 px-2 py-0.5 rounded-md">Esgotado</span>}
                        {isExpired && <span className="text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-500 px-2 py-0.5 rounded-md">Expirado</span>}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Desconto</p>
                        <p className="text-sm font-black text-indigo-600">
                          {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `R$ ${promo.discount_value.toLocaleString('pt-BR')}`}
                        </p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Usos</p>
                        <p className="text-sm font-black text-slate-700">
                          {promo.usage_count} {promo.usage_limit > 0 ? `/ ${promo.usage_limit}` : 'un.'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 px-1">
                        <div className="flex items-center gap-1"><Calendar size={12}/> {promo.expiry_date ? new Date(promo.expiry_date).toLocaleDateString('pt-BR') : 'Sem expiração'}</div>
                        <div className="flex items-center gap-1"><ShieldCheck size={12}/> Min: R$ {promo.min_order_value}</div>
                      </div>
                      {promo.discount_type === 'percentage' && promo.max_discount_value > 0 && (
                        <div className="bg-indigo-50/50 p-2 rounded-lg text-center">
                          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Limite de R$ {promo.max_discount_value.toLocaleString('pt-BR')} por pedido</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Ticket size={48} className="opacity-40" />
            </div>
            <div className="space-y-2 px-6">
              <h4 className="text-xl font-black text-slate-800 uppercase tracking-widest">Nenhum Cupom Encontrado</h4>
              <p className="text-sm font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">
                Você precisa criar um cupom de desconto para que seus clientes possam aplicar promoções no carrinho da vitrine.
              </p>
            </div>
            <button 
              onClick={() => handleOpenForm()}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              <Plus size={18} /> Criar Primeiro Cupom
            </button>
          </div>
        )}
      </div>

      {/* MODAL: Posicionado fora do container animado para garantir o preenchimento total da tela */}
      {isFormOpen && editingPromo && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h3 className="font-black uppercase tracking-widest text-sm">{editingPromo.id ? 'Editar Regras do Cupom' : 'Novo Cupom'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onSave(editingPromo); setIsFormOpen(false); }} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Código do Cupom*</label>
                <input required type="text" value={editingPromo.code} onChange={e => setEditingPromo({...editingPromo, code: e.target.value.toUpperCase().replace(/\s+/g, '')})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-50" placeholder="EX: VERAO2025" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo de Desconto</label>
                  <div className="relative">
                    <select value={editingPromo.discount_type} onChange={e => setEditingPromo({...editingPromo, discount_type: e.target.value as any})} className="w-full pl-5 pr-10 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold appearance-none outline-none">
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Valor Fixo (R$)</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Valor do Desconto</label>
                  <div className="relative">
                    <input type="number" step="0.01" required value={editingPromo.discount_value} onChange={e => setEditingPromo({...editingPromo, discount_value: parseFloat(e.target.value) || 0})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none" />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{editingPromo.discount_type === 'percentage' ? <Percent size={14}/> : <DollarSign size={14}/>}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Valor Mín. Pedido</label>
                  <input type="number" step="0.01" value={editingPromo.min_order_value} onChange={e => setEditingPromo({...editingPromo, min_order_value: parseFloat(e.target.value) || 0})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teto Máx. Desconto (R$)</label>
                  <input type="number" step="0.01" disabled={editingPromo.discount_type !== 'percentage'} value={editingPromo.max_discount_value} onChange={e => setEditingPromo({...editingPromo, max_discount_value: parseFloat(e.target.value) || 0})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none disabled:opacity-30" placeholder="Opcional" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Limite Total Usos</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input type="number" value={editingPromo.usage_limit} onChange={e => setEditingPromo({...editingPromo, usage_limit: parseInt(e.target.value) || 0})} className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Data de Expiração</label>
                  <input type="date" value={editingPromo.expiry_date ? new Date(editingPromo.expiry_date).toISOString().split('T')[0] : ''} onChange={e => setEditingPromo({...editingPromo, expiry_date: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status e Visibilidade</label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setEditingPromo({...editingPromo, status: 'active'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${editingPromo.status === 'active' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white border-slate-100 text-slate-400'}`}>Ativo</button>
                    <button type="button" onClick={() => setEditingPromo({...editingPromo, status: 'inactive'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${editingPromo.status === 'inactive' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-slate-100 text-slate-400'}`}>Pausado</button>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => setEditingPromo({...editingPromo, show_on_home: !editingPromo.show_on_home})}
                    className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${editingPromo.show_on_home ? 'bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    {editingPromo.show_on_home ? <Eye size={18}/> : <EyeOff size={18}/>}
                    {editingPromo.show_on_home ? 'Em destaque na Vitrine' : 'Oculto na Vitrine (Apenas Carrinho)'}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 active:scale-95">
                <Save size={20} /> Salvar Regras do Cupom
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PromotionManager;
