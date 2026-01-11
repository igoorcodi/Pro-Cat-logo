
import React, { useState, useMemo, useRef } from 'react';
import { X, Save, Trash2, Image as ImageIcon, Search, Check, Upload, AlertCircle, FileImage, Link as LinkIcon, Building2, ImageOff } from 'lucide-react';
import { Catalog, Product } from '../types';

interface CatalogFormProps {
  initialData?: Catalog;
  products: Product[];
  onClose: () => void;
  onSave: (catalog: Partial<Catalog>) => void;
  onDelete: (id: string | number) => void;
}

const CatalogForm: React.FC<CatalogFormProps> = ({ initialData, products, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Catalog>>(initialData || {
    name: '',
    slug: '',
    description: '',
    coverImage: '',
    logoUrl: '',
    productIds: [],
    createdAt: new Date().toISOString()
  });

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = useMemo(() => {
    const search = searchTerm.toLowerCase();
    return products.filter(p => {
      const name = p.name || '';
      const category = p.category || '';
      return name.toLowerCase().includes(search) || category.toLowerCase().includes(search);
    });
  }, [products, searchTerm]);

  const toggleProduct = (id: string | number) => {
    setFormData(prev => {
      const currentIds = prev.productIds || [];
      const newIds = currentIds.includes(id) 
        ? currentIds.filter(pid => pid !== id) 
        : [...currentIds, id];
      return { ...prev, productIds: newIds };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'logoUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert("Por favor, selecione apenas imagens nos formatos JPG ou PNG.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        [field]: base64
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      alert("O nome do catálogo é obrigatório.");
      return;
    }
    if (!formData.coverImage) {
      alert("Por favor, selecione uma imagem de capa (JPG ou PNG).");
      return;
    }
    
    if (formData.slug) {
        formData.slug = formData.slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-full sm:h-[90vh]">
        <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20">
              <ImageIcon size={20} className="sm:size-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-black tracking-tight">{initialData ? 'Gerenciar' : 'Novo Catálogo'}</h3>
              <p className="text-[10px] sm:text-xs text-indigo-100 font-medium">Sua vitrine digital</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 sm:w-7 h-7" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row bg-slate-50/30">
          <div className="w-full lg:w-1/2 p-5 sm:p-8 lg:p-10 lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-100 bg-white">
            <form id="catalog-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <LinkIcon size={14} /> Link Personalizado
                </label>
                <div className="flex items-center gap-2">
                  <div className="hidden sm:block px-3 py-2 bg-indigo-100/50 border border-indigo-200 rounded-xl text-[10px] font-black text-indigo-400 whitespace-nowrap">
                    .../?c=
                  </div>
                  <input 
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="ex: minha-loja-2025"
                    className="flex-1 px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm font-bold text-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
                <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-tight">O link facilitará o acesso dos seus clientes.</p>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Building2 size={14} className="text-indigo-500" /> Logotipo da Vitrine
                </label>
                <div className="flex items-center gap-6">
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 shadow-sm flex items-center justify-center overflow-hidden">
                      {formData.logoUrl ? (
                        <img src={formData.logoUrl} className="w-full h-full object-cover" alt="Logo" />
                      ) : (
                        <Building2 size={32} className="text-slate-300" />
                      )}
                    </div>
                    <button 
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      <Upload size={14} />
                    </button>
                    <input 
                      type="file" 
                      ref={logoInputRef} 
                      onChange={(e) => handleFileChange(e, 'logoUrl')} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Selecione um logotipo específico para esta vitrine. Se não enviado, usaremos o logo padrão da sua conta.
                    </p>
                    {formData.logoUrl && (
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                        className="mt-2 text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-700"
                      >
                        Remover Logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome da Vitrine*</label>
                <input 
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Coleção Inverno 2024"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Breve Descrição</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Conte um pouco sobre essa coleção..."
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none resize-none font-medium text-sm"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Imagem de Capa (Obrigatória)*</label>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e, 'coverImage')}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative aspect-video rounded-3xl overflow-hidden border-4 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center text-center p-6 ${
                    formData.coverImage 
                      ? 'border-indigo-100' 
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  {formData.coverImage ? (
                    <>
                      <img 
                        src={formData.coverImage} 
                        alt="Capa" 
                        className="absolute inset-0 w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-4 py-2 bg-white text-slate-900 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
                          <Upload size={14} /> Trocar Imagem
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-indigo-500">
                        <ImageIcon size={24} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clique para subir foto de capa</p>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-1/2 p-5 sm:p-8 lg:p-10 lg:overflow-y-auto flex flex-col h-full bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h4 className="text-lg font-black text-slate-800 tracking-tight">Produtos da Vitrine</h4>
                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">
                  {formData.productIds?.length || 0} SELECIONADOS
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text"
                  placeholder="Filtrar produtos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 pr-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-indigo-100 outline-none shadow-sm w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pb-8">
              {filteredProducts.map(product => {
                const isSelected = formData.productIds?.includes(product.id);
                return (
                  <div 
                    key={product.id}
                    onClick={() => toggleProduct(product.id)}
                    className={`p-3 rounded-2xl border-2 flex items-center gap-4 cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-white border-indigo-600 shadow-md ring-1 ring-indigo-600/10' 
                        : 'bg-white border-transparent hover:border-slate-200 shadow-sm'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageOff size={16} className="text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate tracking-tight">{product.name || 'Sem nome'}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{product.category || 'Sem categoria'}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-200 bg-white'
                    }`}>
                      {isSelected && <Check size={14} className="stroke-[4]" />}
                    </div>
                  </div>
                );
              })}
              {filteredProducts.length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <p className="font-black uppercase tracking-widest text-[10px]">Nenhum produto encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 sm:px-10 py-5 bg-white border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="w-full sm:w-auto">
            {initialData && (
              <button 
                type="button"
                onClick={() => onDelete(initialData.id)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-red-500 hover:bg-red-50 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                <Trash2 size={18} /> Excluir
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-800 transition-all"
            >
              Descartar
            </button>
            <button 
              form="catalog-form"
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 active:scale-95"
            >
              <Save size={18} /> Gravar Catálogo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogForm;
