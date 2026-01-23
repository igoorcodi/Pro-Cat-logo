
import React, { useState, useMemo, useRef } from 'react';
import { X, Save, Trash2, Image as ImageIcon, Search, Check, Upload, AlertCircle, FileImage, Link as LinkIcon, Building2, ImageOff, Palette, Hash, Type, Type as TypeIcon } from 'lucide-react';
import { Catalog, Product } from '../types';

interface CatalogFormProps {
  initialData?: Catalog;
  products: Product[];
  onClose: () => void;
  onSave: (catalog: Partial<Catalog>) => void;
  onDelete: (id: string | number) => void;
}

const DEFAULT_SYSTEM_COLOR = '#4f46e5';

const colorPalettes = [
  { name: 'Indigo (Padrão)', color: '#4f46e5' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Violet', color: '#8b5cf6' },
  { name: 'Slate', color: '#334155' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Cyan', color: '#06b6d4' }
];

const CatalogForm: React.FC<CatalogFormProps> = ({ initialData, products, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Catalog>>({
    name: '',
    slug: '',
    description: '',
    coverImage: '',
    logoUrl: '',
    primaryColor: DEFAULT_SYSTEM_COLOR,
    productIds: [],
    createdAt: new Date().toISOString(),
    coverTitle: '',
    coverSubtitle: '',
    titleFontSize: 'lg',
    subtitleFontSize: 'md',
    ...initialData
  });

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Garantir que sempre temos uma cor válida para o CSS, mesmo se o usuário apagar o campo hex
  const activePrimaryColor = useMemo(() => {
    const color = formData.primaryColor || '';
    return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : DEFAULT_SYSTEM_COLOR;
  }, [formData.primaryColor]);

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

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value && !value.startsWith('#')) value = '#' + value;
    // Permite digitar até 7 caracteres (# + 6 hex)
    if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
      setFormData({ ...formData, primaryColor: value });
    }
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
    
    // Se o campo de cor estiver vazio ou inválido no envio, salva a cor padrão
    const finalColor = /^#[0-9A-Fa-f]{6}$/.test(formData.primaryColor || '') 
      ? formData.primaryColor 
      : DEFAULT_SYSTEM_COLOR;

    const submissionData = {
      ...formData,
      primaryColor: finalColor
    };

    if (submissionData.slug) {
      submissionData.slug = submissionData.slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    onSave(submissionData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-full sm:h-[90vh]">
        <div className="p-4 sm:p-6 text-white flex justify-between items-center shrink-0" style={{ backgroundColor: activePrimaryColor }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/20">
              <ImageIcon size={20} className="sm:size-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-black tracking-tight">{initialData ? 'Gerenciar' : 'Novo Catálogo'}</h3>
              <p className="text-[10px] sm:text-xs text-white/80 font-medium">Personalize a identidade da sua vitrine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-6 h-6 sm:w-7 h-7" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto lg:overflow-hidden flex flex-col lg:flex-row bg-slate-50/30">
          <div className="w-full lg:w-1/2 p-5 sm:p-8 lg:p-10 lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-slate-100 bg-white">
            <form id="catalog-form" onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 pb-10">
              
              <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <Palette size={14} style={{ color: activePrimaryColor }} /> Identidade Visual
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                      <input 
                        type="text" 
                        value={formData.primaryColor?.replace('#', '') || ''}
                        onChange={handleHexChange}
                        placeholder="4F46E5"
                        className="pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest focus:ring-2 outline-none w-28"
                        style={{ '--tw-ring-color': activePrimaryColor + '40' } as React.CSSProperties}
                      />
                    </div>
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-white">
                      <input 
                        type="color" 
                        value={activePrimaryColor}
                        onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                        className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer border-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {colorPalettes.map(palette => (
                    <button
                      key={palette.color}
                      type="button"
                      onClick={() => setFormData({ ...formData, primaryColor: palette.color })}
                      className={`w-full aspect-square rounded-xl border-4 transition-all ${activePrimaryColor.toLowerCase() === palette.color.toLowerCase() ? 'border-white shadow-lg scale-110' : 'border-transparent opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: palette.color, borderColor: activePrimaryColor.toLowerCase() === palette.color.toLowerCase() ? 'white' : 'transparent' }}
                      title={palette.name}
                    >
                      {activePrimaryColor.toLowerCase() === palette.color.toLowerCase() && <Check size={16} className="text-white mx-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <TypeIcon size={14} style={{ color: activePrimaryColor }} /> Conteúdo da Capa
                </label>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Título Principal (Banner)</label>
                      <div className="flex gap-1">
                        {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFormData({...formData, titleFontSize: size})}
                            className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black uppercase transition-all ${formData.titleFontSize === size ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input 
                      type="text"
                      value={formData.coverTitle || ''}
                      onChange={e => setFormData(prev => ({ ...prev, coverTitle: e.target.value }))}
                      placeholder="Ex: Coleção Verão 2025"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 outline-none font-bold text-slate-800"
                      style={{ '--tw-ring-color': activePrimaryColor + '20' } as React.CSSProperties}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Texto Secundário / Slogan</label>
                      <div className="flex gap-1">
                        {(['sm', 'md', 'lg'] as const).map(size => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFormData({...formData, subtitleFontSize: size})}
                            className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black uppercase transition-all ${formData.subtitleFontSize === size ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                    <input 
                      type="text"
                      value={formData.coverSubtitle || ''}
                      onChange={e => setFormData(prev => ({ ...prev, coverSubtitle: e.target.value }))}
                      placeholder="Ex: As melhores ofertas estão aqui"
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 outline-none font-bold text-slate-600"
                      style={{ '--tw-ring-color': activePrimaryColor + '20' } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <LinkIcon size={14} /> Link Personalizado
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text"
                    value={formData.slug || ''}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="ex: minha-loja-2025"
                    className="flex-1 px-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm font-bold text-indigo-600 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-100 rounded-3xl space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Building2 size={14} style={{ color: activePrimaryColor }} /> Logotipo da Vitrine
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
                      className="absolute -bottom-2 -right-2 p-2 text-white rounded-xl shadow-lg hover:brightness-110 transition-all active:scale-95"
                      style={{ backgroundColor: activePrimaryColor }}
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
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome Administrativo do Catálogo*</label>
                <input 
                  required
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Coleção Inverno 2024"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 outline-none font-bold text-slate-800"
                  style={{ '--tw-ring-color': activePrimaryColor + '20' } as React.CSSProperties}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Imagem de Capa*</label>
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
                      ? 'border-slate-100' 
                      : 'border-slate-100 bg-slate-50 hover:bg-slate-100 hover:border-slate-200'
                  }`}
                  style={formData.coverImage ? { borderColor: activePrimaryColor + '20' } : {}}
                >
                  {formData.coverImage ? (
                    <>
                      <img 
                        src={formData.coverImage} 
                        alt="Capa" 
                        className="absolute inset-0 w-full h-full object-cover opacity-60" 
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="px-4 py-2 bg-white text-slate-900 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
                          <Upload size={14} /> Trocar Imagem
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto" style={{ color: activePrimaryColor }}>
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
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: activePrimaryColor }}>
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
                  className="pl-10 pr-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:ring-4 outline-none shadow-sm w-full"
                  style={{ '--tw-ring-color': activePrimaryColor + '20' } as React.CSSProperties}
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
                        ? 'bg-white shadow-md' 
                        : 'bg-white border-transparent hover:border-slate-200 shadow-sm'
                    }`}
                    style={isSelected ? { borderColor: activePrimaryColor } : {}}
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
                      isSelected ? 'text-white' : 'border-slate-200 bg-white'
                    }`}
                    style={isSelected ? { backgroundColor: activePrimaryColor, borderColor: activePrimaryColor } : {}}
                    >
                      {isSelected && <Check size={14} className="stroke-[4]" />}
                    </div>
                  </div>
                );
              })}
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
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-4 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 hover:brightness-110"
              style={{ backgroundColor: activePrimaryColor }}
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
