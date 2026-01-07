
import React, { useState, useMemo, useRef } from 'react';
import { X, Save, Trash2, Image as ImageIcon, Search, Check, Upload, AlertCircle, FileImage, Link as LinkIcon } from 'lucide-react';
import { Catalog, Product } from '../types';

interface CatalogFormProps {
  initialData?: Catalog;
  products: Product[];
  onClose: () => void;
  onSave: (catalog: Partial<Catalog>) => void;
  onDelete: (id: string) => void;
}

const CatalogForm: React.FC<CatalogFormProps> = ({ initialData, products, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Catalog>>(initialData || {
    name: '',
    slug: '',
    description: '',
    coverImage: '',
    productIds: [],
    createdAt: new Date().toISOString()
  });

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        coverImage: base64
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
    
    // Limpeza simples do slug: remove espaços e caracteres especiais
    if (formData.slug) {
        formData.slug = formData.slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[90vh]">
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
          <div className="w-full lg:w-1/2 p-6 lg:p-10 overflow-y-auto border-r border-slate-100 custom-scrollbar">
            <form id="catalog-form" onSubmit={handleSubmit} className="space-y-8">
              
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <LinkIcon size={14} /> ID Personalizado (Link)
                </label>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 bg-indigo-100/50 border border-indigo-200 rounded-xl text-[10px] font-black text-indigo-400 whitespace-nowrap">
                    .../?c=
                  </div>
                  <input 
                    type="text"
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="ex: minha-loja-2025"
                    className="flex-1 px-4 py-2 bg-white border border-indigo-200 rounded-xl text-sm font-bold text-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
                <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-tight">Este ID será usado no link compartilhado para seus clientes.</p>
              </div>

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

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Imagem de Capa (JPG ou PNG)*</label>
                </div>

                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`mt-2 aspect-video rounded-3xl overflow-hidden border-4 border-dashed transition-all cursor-pointer group relative flex flex-col items-center justify-center text-center p-6 ${
                    formData.coverImage 
                      ? 'border-indigo-100 hover:border-indigo-300' 
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                >
                  {formData.coverImage ? (
                    <>
                      <img 
                        src={formData.coverImage} 
                        alt="Capa do Catálogo" 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="px-6 py-2 bg-white text-slate-900 rounded-full font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2">
                          <Upload size={14} /> Alterar Imagem
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto text-indigo-500 group-hover:scale-110 transition-transform">
                        <FileImage size={32} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Selecionar Foto de Capa</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Formatos aceitos: JPG ou PNG</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="w-full lg:w-1/2 p-6 lg:p-10 bg-slate-50/50 flex flex-col h-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h4 className="text-xl font-black text-slate-800 tracking-tight">Selecionar Produtos</h4>
                <p className="text-xs text-slate-500 font-bold">
                  {formData.productIds?.length || 0} produtos selecionados
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-11 pr-5 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-500 transition-all outline-none shadow-sm w-full"
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
                      <img src={product.images[0] || 'https://via.placeholder.com/100'} alt="" className="w-full h-full object-cover" />
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
              {filteredProducts.length === 0 && (
                <div className="text-center py-20 opacity-30">
                  <Search size={40} className="mx-auto mb-4" />
                  <p className="font-black uppercase tracking-widest text-xs">Nenhum produto encontrado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-10 py-6 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            {initialData && (
              <button 
                type="button"
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
