
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
  EyeOff,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Hash
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
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredPromos = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return promotions.filter(p => {
      const matchesSearch = p.code.toLowerCase().includes(term) || String(p.id).includes(term);
      const matchesStatus = showInactive ? true : p.status === 'active';
      return matchesSearch && matchesStatus;
    });
  }, [promotions, searchTerm, showInactive]);

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

  // Funções de Máscara
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleNumericChange = (field: keyof Promotion, value: string) => {
    if (!editingPromo) return;
    const rawValue = value.replace(/\D/g, '');
    const numericValue = parseFloat(rawValue) / 100;
    setEditingPromo({ ...editingPromo, [field]: numericValue || 0 });
  };

  return (
    <>
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por código ou ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="bg-white border border-slate-200 rounded-2xl p-1 flex shadow-sm shrink-0">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grade"
              >
                <LayoutGrid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                title="Lista"
              >
                <ListIcon size={18} />
              </button>
            </div>

            <button 
              onClick={() => setShowInactive(!showInactive)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${showInactive ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-500'}`}
            >
              {showInactive ? <EyeOff size={14} /> : <Eye size={14} />}
              <span className="xs:inline">{showInactive ? 'Ocultar' : 'Inativos'}</span>
            </button>
            
            <button 
              onClick={() => handleOpenForm()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              <Plus size={16} /> <span className="hidden xs:inline">Novo Cupom</span><span className="xs:hidden">Novo</span>
            </button>
          </div>
        </div>

        {filteredPromos.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredPromos.map(promo => {
                const isExpired = promo.expiry_date && new Date(promo.expiry_date) < new Date();
                const isFull = promo.usage_limit > 0 && promo.usage_count >= promo.usage_limit;
                
                return (
                  <div key={promo.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                    {(isExpired || isFull || promo.status === 'inactive') && <div className="absolute inset-0 bg-slate-50/40 backdrop-blur-[1px] z-10" />}
                    
                    <div className="absolute top-4 right-4 flex gap-2 z-20">
                      <button onClick={() => handleOpenForm(promo)} className="p-2 bg-white/80 backdrop-blur-md text-slate-400 hover:text-indigo-600 rounded-xl shadow-sm transition-all"><Edit2 size={16}/></button>
                      <button onClick={() => onDelete(promo.id, promo.code)} className="p-2 bg-white/80 backdrop-blur-md text-slate-400 hover:text-red-500 rounded-xl shadow-sm transition-all"><Trash2 size={16}/></button>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-inner shrink-0 ${promo.status === 'active' && !isFull && !isExpired ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Ticket size={24} className="sm:size-7" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                            #{promo.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight uppercase truncate">{promo.code}</h4>
                          {/* 
                            Fix: Wrapped Eye icon in a span with 'title' attribute because Lucide icons 
                            do not support the 'title' prop directly.
                          */}
                          {promo.show_on_home && (
                            <span title="Exibindo na vitrine">
                              <Eye size={14} className="text-indigo-500" />
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${promo.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                            {promo.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                          {isFull && <span className="text-[8px] font-black uppercase tracking-widest bg-red-50 text-red-500 px-2 py-0.5 rounded-md">Esgotado</span>}
                          {isExpired && <span className="text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-500 px-2 py-0.5 rounded-md">Expirado</span>}
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="hidden md:block bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cupom</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Desconto</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Validade</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uso</th>
                        <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredPromos.map(promo => {
                        const isExpired = promo.expiry_date && new Date(promo.expiry_date) < new Date();
                        const isFull = promo.usage_limit > 0 && promo.usage_count >= promo.usage_limit;
                        
                        return (
                          <tr key={promo.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs font-black text-slate-500 bg-slate-100 px-2 py-1 rounded">#{promo.id}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${promo.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                  <Ticket size={16} />
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{promo.code}</p>
                                  {promo.show_on_home && <p className="text-[9px] font-bold text-indigo-500 uppercase">Em destaque na Home</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-indigo-600">
                                  {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `R$ ${promo.discount_value.toLocaleString('pt-BR')}`}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Mínimo R$ {promo.min_order_value}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs font-bold ${isExpired ? 'text-red-400' : 'text-slate-600'}`}>
                                {promo.expiry_date ? new Date(promo.expiry_date).toLocaleDateString('pt-BR') : 'Perpétuo'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className={`text-xs font-black ${isFull ? 'text-red-500' : 'text-slate-700'}`}>
                                  {promo.usage_count} {promo.usage_limit > 0 ? `/ ${promo.usage_limit}` : 'usos'}
                                </span>
                                <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                  <div 
                                    className={`h-full ${isFull ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                    style={{ width: promo.usage_limit > 0 ? `${Math.min(100, (promo.usage_count / promo.usage_limit) * 100)}%` : '0%' }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${promo.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {promo.status === 'active' ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleOpenForm(promo)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white shadow-sm transition-all"><Edit2 size={16}/></button>
                                <button onClick={() => onDelete(promo.id, promo.code)} className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-white shadow-sm transition-all"><Trash2 size={16}/></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="md:hidden space-y-3">
                {filteredPromos.map(promo => {
                  const isExpired = promo.expiry_date && new Date(promo.expiry_date) < new Date();
                  const isFull = promo.usage_limit > 0 && promo.usage_count >= promo.usage_limit;
                  return (
                    <div key={promo.id} onClick={() => handleOpenForm(promo)} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all relative overflow-hidden">
                      {(isExpired || isFull || promo.status === 'inactive') && <div className="absolute inset-0 bg-slate-50/20 backdrop-blur-[0.5px]" />}
                      
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${promo.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Ticket size={18} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                           <span className="text-[9px] font-black text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">#{promo.id}</span>
                           <h4 className="text-sm font-black text-slate-800 uppercase truncate">{promo.code}</h4>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] font-black text-indigo-600">
                             {promo.discount_type === 'percentage' ? `${promo.discount_value}%` : `R$ ${promo.discount_value}`}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {promo.usage_count} {promo.usage_limit > 0 ? `/ ${promo.usage_limit}` : 'un.'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${promo.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                          {promo.status === 'active' ? 'Ativo' : 'Off'}
                        </span>
                        <ChevronRight className="text-slate-300" size={16} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <Ticket size={48} className="opacity-40" />
            </div>
            <div className="space-y-2 px-6">
              <h4 className="text-xl font-black text-slate-800 uppercase tracking-widest">Nenhum Cupom Encontrado</h4>
              <p className="text-sm font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">
                {showInactive ? 'Não há cupons arquivados.' : 'Você precisa criar um cupom de desconto para que seus clientes possam aplicar promoções no carrinho da vitrine.'}
              </p>
            </div>
            {!showInactive && (
              <button 
                onClick={() => handleOpenForm()}
                className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                <Plus size={18} /> Criar Primeiro Cupom
              </button>
            )}
          </div>
        )}
      </div>

      {isFormOpen && editingPromo && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col h-full sm:h-auto sm:max-h-[90vh]">
            <div className="p-6 bg-indigo-600 text-white flex justify-between items-center shrink-0">
              <h3 className="font-black uppercase tracking-widest text-sm">{editingPromo.id ? 'Editar Regras do Cupom' : 'Novo Cupom'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24}/></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onSave(editingPromo); setIsFormOpen(false); }} className="p-6 sm:p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Código do Cupom*</label>
                <input required type="text" value={editingPromo.code} onChange={e => setEditingPromo({...editingPromo, code: e.target.value.toUpperCase().replace(/\s+/g, '')})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-indigo-600 outline-none focus:ring-4 focus:ring-indigo-50" placeholder="EX: VERAO2025" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <input 
                      type="text" 
                      required 
                      value={formatCurrency(editingPromo.discount_value || 0)} 
                      onChange={e => handleNumericChange('discount_value', e.target.value)} 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black outline-none" 
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {editingPromo.discount_type === 'percentage' ? <Percent size={14}/> : <DollarSign size={14}/>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Valor Mín. Pedido</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formatCurrency(editingPromo.min_order_value || 0)} 
                      onChange={e => handleNumericChange('min_order_value', e.target.value)} 
                      className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none" 
                    />
                    <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Teto Máx. Desconto (R$)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      disabled={editingPromo.discount_type !== 'percentage'} 
                      value={formatCurrency(editingPromo.max_discount_value || 0)} 
                      onChange={e => handleNumericChange('max_discount_value', e.target.value)} 
                      className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none disabled:opacity-30" 
                      placeholder="Opcional" 
                    />
                    <DollarSign size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 ${editingPromo.discount_type !== 'percentage' ? 'opacity-30' : ''}`} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <button type="button" onClick={() => setEditingPromo({...editingPromo, status: 'inactive'})} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${editingPromo.status === 'inactive' ? 'bg-red-50 border-red-500 text-red-600' : 'bg-white border-slate-100 text-slate-400'}`}>Inativo</button>
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
