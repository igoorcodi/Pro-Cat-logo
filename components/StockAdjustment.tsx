
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Save, 
  ArrowLeft, 
  Package, 
  Plus, 
  Minus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ImageOff,
  MessageSquare
} from 'lucide-react';
import { Product } from '../types';

interface StockAdjustmentProps {
  products: Product[];
  onSave: (updates: { id: string | number, newStock: number, notes?: string }[]) => Promise<void>;
  onCancel: () => void;
}

const StockAdjustment: React.FC<StockAdjustmentProps> = ({ products, onSave, onCancel }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [adjustments, setAdjustments] = useState<Record<string | number, number>>({});
  const [notes, setNotes] = useState<Record<string | number, string>>({});

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      const id = String(p.id).toLowerCase();
      return name.includes(search) || sku.includes(search) || id.includes(search);
    });
  }, [products, searchTerm]);

  const handleAdjust = (id: string | number, currentStock: number, newValue: number) => {
    const val = Math.max(0, newValue);
    if (val === currentStock) {
      const newAdjusts = { ...adjustments };
      delete newAdjusts[id];
      setAdjustments(newAdjusts);
    } else {
      setAdjustments(prev => ({ ...prev, [id]: val }));
    }
  };

  const handleNoteChange = (id: string | number, text: string) => {
    setNotes(prev => ({ ...prev, [id]: text }));
  };

  const handleQuickAdjust = (id: string | number, currentStock: number, delta: number) => {
    const base = adjustments[id] !== undefined ? adjustments[id] : currentStock;
    handleAdjust(id, currentStock, base + delta);
  };

  const hasChanges = Object.keys(adjustments).length > 0;

  const handleSaveAll = async () => {
    if (!hasChanges) return;
    setIsSaving(true);
    const payload = Object.entries(adjustments).map(([id, newStock]) => ({
      id,
      newStock,
      notes: notes[id] || 'Ajuste em massa no painel'
    }));
    await onSave(payload);
    setIsSaving(false);
    setAdjustments({});
    setNotes({});
  };

  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <button onClick={onCancel} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold transition-all mb-2">
            <ArrowLeft size={18} /> Voltar para Produtos
          </button>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Package className="text-indigo-600" /> Ajuste de Estoque em Massa
          </h2>
          <p className="text-sm text-slate-500 font-medium">Atualize as quantidades e registre os motivos de uma só vez.</p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nome ou SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50 outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Produto</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Atual</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Ajuste / Novo</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo da Alteração</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map(product => {
                const isChanged = adjustments[product.id] !== undefined;
                const displayValue = isChanged ? adjustments[product.id] : product.stock;
                
                return (
                  <tr key={product.id} className={`transition-colors ${isChanged ? 'bg-amber-50/50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-100 flex items-center justify-center shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} className="w-full h-full object-cover" />
                          ) : (
                            <ImageOff size={16} className="text-slate-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{product.name}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase">SKU: {product.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-black text-slate-400 text-sm">{product.stock}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => handleQuickAdjust(product.id, product.stock, -1)}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
                        >
                          <Minus size={16} />
                        </button>
                        
                        <input 
                          type="number"
                          min="0"
                          value={displayValue}
                          onChange={(e) => handleAdjust(product.id, product.stock, parseInt(e.target.value) || 0)}
                          className={`w-20 px-2 py-2 rounded-xl text-center font-black text-sm outline-none border-2 transition-all ${
                            isChanged ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100' : 'border-slate-100 bg-slate-50'
                          }`}
                        />

                        <button 
                          onClick={() => handleQuickAdjust(product.id, product.stock, 1)}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="relative group">
                          <MessageSquare className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isChanged ? 'text-amber-400' : 'text-slate-300'}`} size={14} />
                          <input 
                            type="text"
                            placeholder="Descreva o motivo..."
                            disabled={!isChanged}
                            value={notes[product.id] || ''}
                            onChange={(e) => handleNoteChange(product.id, e.target.value)}
                            className={`w-full pl-9 pr-4 py-2 text-xs font-bold rounded-xl border-2 transition-all outline-none ${
                              isChanged 
                                ? 'bg-white border-amber-200 text-amber-900 focus:border-amber-400' 
                                : 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
                          />
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <AlertCircle size={40} />
                      <p className="text-xs font-black uppercase mt-2 tracking-widest">Nenhum produto encontrado</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 lg:left-72 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-100 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Package size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens Alterados</p>
            <p className="text-lg font-black text-slate-800">{Object.keys(adjustments).length}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="px-8 py-3 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-800 transition-all">Cancelar</button>
          <button 
            onClick={handleSaveAll}
            disabled={!hasChanges || isSaving}
            className={`flex items-center gap-3 px-12 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale ${
              hasChanges ? 'bg-indigo-600 text-white shadow-indigo-100' : 'bg-slate-200 text-slate-400'
            }`}
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            Gravar Ajustes
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;
