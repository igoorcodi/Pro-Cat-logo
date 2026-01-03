
import React, { useState, useMemo } from 'react';
import { X, Save, Trash2, Image as ImageIcon, Search, Check } from 'lucide-react';
import { Catalog, Product } from '../types';

interface CatalogFormProps {
  initialData?: Catalog;
  products: Product[];
  onClose: () => void;
  onSave: (catalog: Catalog) => void;
  onDelete: (id: string) => void;
}

const CatalogForm: React.FC<CatalogFormProps> = ({ initialData, products, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Catalog>>(initialData || {
    name: '',
    description: '',
    coverImage: 'https://picsum.photos/seed/catalog/800/600',
    productIds: [],
    createdAt: new Date().toISOString()
  });

  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  const toggleProduct = (id: string) => {
    setFormData(prev => {
      const currentIds = prev.productIds || [];
      const newIds = currentIds.includes(id) 
        ? currentIds.filter(pid => pid !== id) 
        : [...currentIds, id];
      return { ...prev, productIds: newIds };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    onSave({
      ...formData,
      id: initialData?.id || Math.random().toString(36).substr(2, 9),
    } as Catalog);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[90vh]">
        {/* Header - Indigo to Purple Gradient like the image */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20">
              <ImageIcon size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{initialData ? 'Gerenciar Catálogo' : 'Novo Catálogo'}</h3>
              <p className="text-xs text-indigo-100 font-medium">Personalize sua vitrine digital</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Left Side: Info */}
          <div className="w-full lg:w-1/2 p-10 overflow-y-auto border-r border-slate-100">
            <form id="catalog-form" onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome do Catálogo*</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Coleção Inverno 2024"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Descrição</label>
                <textarea 
                  rows={4}
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Os melhores produtos para se manter aquecido..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none resize-none font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Imagem de Capa (URL)</label>
                <input 
                  type="text"
                  value={formData.coverImage}
                  onChange={e => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-medium"
                />
                <div className="mt-6 aspect-video rounded-3xl overflow-hidden border border-slate-200 relative group bg-slate-100 shadow-inner">
                  <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-[2px]">
                    <span className="text-white text-xs font-black uppercase tracking-widest">Visualização da Capa</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Right Side: Product Selection */}
          <div className="w-full lg:w-1/2 p-10 bg-slate-50/50 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">Selecionar Produtos</h4>
                <p className="text-xs text-slate-500 font-bold">
                  {formData.productIds?.length} produtos selecionados
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none shadow-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {filteredProducts.map(product => {
                const isSelected = formData.productIds?.includes(product.id);
                return (
                  <div 
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`p-4 rounded-[1.5rem] border-2 flex items-center gap-5 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-50 border-indigo-500 shadow-md shadow-indigo-100 scale-[1.02]' 
                        : 'bg-white border-white hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-inner border border-slate-100">
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-base truncate tracking-tight">{product.name}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{product.category}</p>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 bg-white'
                    }`}>
                      {isSelected && <Check size={18} className="stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions - Layout matching the provided screenshot */}
        <div className="px-10 py-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            {initialData && (
              <button 
                onClick={() => onDelete(initialData.id)}
                className="flex items-center gap-2 px-5 py-3 text-red-500 hover:bg-red-50 rounded-2xl font-black text-sm transition-all"
              >
                <Trash2 size={20} />
                Excluir Catálogo
              </button>
            )}
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={onClose}
              className="px-8 py-3 text-slate-500 font-black text-sm hover:text-slate-800 transition-all"
            >
              Cancelar
            </button>
            <button 
              form="catalog-form"
              type="submit"
              className="flex items-center gap-3 px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base transition-all shadow-xl shadow-indigo-100 group active:scale-95"
            >
              <Save size={22} className="group-hover:rotate-12 transition-transform" />
              Salvar Catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogForm;
