
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  Package,
  AlertTriangle,
  ImageOff,
  ChevronDown,
  Check,
  Layers,
  History,
  MessageSquare
} from 'lucide-react';
import { Product, Category, Subcategory } from '../types';

interface ProductFormProps {
  initialData?: Product;
  categories: Category[];
  isClone?: boolean;
  onSave: (product: Partial<Product>, stockNote?: string) => void;
  onCancel: () => void;
  onShowHistory?: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, categories, isClone, onSave, onCancel, onShowHistory }) => {
  const [formData, setFormData] = useState<Partial<Product>>(initialData || {
    name: '',
    description: '',
    price: 0,
    sku: '',
    stock: 0,
    status: 'active',
    categoryId: '',
    subcategoryIds: [],
    subcategory_stock: {},
    tags: [],
    images: []
  });

  const [stockNote, setStockNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isStockModified = useMemo(() => {
    if (!initialData || isClone) return false;
    return formData.stock !== initialData.stock;
  }, [formData.stock, initialData, isClone]);

  const selectedCategory = useMemo(() => {
    if (!formData.categoryId) return null;
    return categories.find(c => String(c.id) === String(formData.categoryId));
  }, [categories, formData.categoryId]);

  const selectedSubcategories = useMemo(() => {
    if (!selectedCategory || !formData.subcategoryIds) return [];
    return selectedCategory.subcategories?.filter(s => formData.subcategoryIds?.includes(s.id)) || [];
  }, [selectedCategory, formData.subcategoryIds]);

  // Atualiza o estoque total sempre que houver mudança nos estoques das subcategorias
  useEffect(() => {
    if (formData.subcategoryIds && formData.subcategoryIds.length > 0) {
      const total = Object.entries(formData.subcategory_stock || {}).reduce((acc, [id, qty]) => {
        // Apenas soma se o ID ainda estiver na lista de subcategorias selecionadas
        if (formData.subcategoryIds?.includes(id) || formData.subcategoryIds?.includes(Number(id))) {
          return acc + (Number(qty) || 0);
        }
        return acc;
      }, 0);
      
      if (total !== formData.stock) {
        setFormData(prev => ({ ...prev, stock: total }));
      }
    }
  }, [formData.subcategory_stock, formData.subcategoryIds]);

  // Máscara de Moeda
  const formatCurrency = (value: number | string) => {
    let val = typeof value === 'number' ? value.toFixed(2) : value;
    val = val.replace(/\D/g, '');
    const options = { minimumFractionDigits: 2 };
    const result = new Intl.NumberFormat('pt-BR', options).format(
      parseFloat(val) / 100
    );
    return result;
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = parseFloat(rawValue) / 100;
    setFormData(prev => ({ ...prev, price: numericValue || 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    const finalData = { ...formData };
    if (isClone) delete finalData.id;
    
    onSave(finalData, stockNote);
    setIsSaving(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImagesCount = formData.images?.length || 0;
    if (currentImagesCount >= 5) {
      alert("Limite máximo de 5 imagens atingido.");
      return;
    }

    const remainingSlots = 5 - currentImagesCount;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), base64].slice(0, 5)
        }));
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleCategoryChange = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryId: catId,
      subcategoryIds: [],
      subcategory_stock: {}
    }));
  };

  const toggleSubcategory = (subId: string | number) => {
    setFormData(prev => {
      const ids = prev.subcategoryIds || [];
      const stock = { ...prev.subcategory_stock } || {};
      const exists = ids.includes(subId);
      
      let newIds;
      if (exists) {
        newIds = ids.filter(id => id !== subId);
        delete stock[String(subId)];
      } else {
        newIds = [...ids, subId];
        stock[String(subId)] = 0;
      }

      return {
        ...prev,
        subcategoryIds: newIds,
        subcategory_stock: stock
      };
    });
  };

  const handleSubStockChange = (subId: string | number, qty: number) => {
    const safeQty = Math.max(0, qty);
    setFormData(prev => ({
      ...prev,
      subcategory_stock: {
        ...(prev.subcategory_stock || {}),
        [String(subId)]: safeQty
      }
    }));
  };

  const selectAllSubcategories = () => {
    if (!selectedCategory || !selectedCategory.subcategories) return;
    const allIds = selectedCategory.subcategories.map(s => s.id);
    const newStock: Record<string, number> = {};
    allIds.forEach(id => {
      newStock[String(id)] = formData.subcategory_stock?.[String(id)] || 0;
    });

    setFormData(prev => ({
      ...prev,
      subcategoryIds: allIds,
      subcategory_stock: newStock
    }));
  };

  const clearSubcategories = () => {
    setFormData(prev => ({ ...prev, subcategoryIds: [], subcategory_stock: {} }));
  };

  const hasSubcategories = selectedSubcategories.length > 0;

  return (
    <div className="max-w-4xl mx-auto pb-32 sm:pb-20 animate-in slide-in-from-right-4 duration-500 px-2 sm:px-0">
      {isClone && (
        <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-amber-50 border-2 border-amber-200 rounded-[1.5rem] sm:rounded-[2rem] flex flex-col sm:flex-row items-center gap-3 sm:gap-4 animate-in slide-in-from-top-4 duration-500">
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200 shrink-0">
            <AlertTriangle size={24} className="sm:size-[30px]" />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="text-base sm:text-lg font-black text-amber-900 uppercase tracking-tight">Clonando Produto</h4>
            <p className="text-xs sm:text-sm font-bold text-amber-700">O novo produto será criado ao salvar.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button 
          onClick={onCancel}
          className="flex items-center gap-1.5 sm:gap-2 text-slate-500 hover:text-slate-800 font-bold transition-colors text-sm sm:text-base"
        >
          <ArrowLeft size={18} />
          <span className="hidden sm:inline">Voltar para Lista</span>
          <span className="sm:hidden">Voltar</span>
        </button>
        <h2 className="text-lg sm:text-2xl font-black text-slate-800 tracking-tight text-right">
          {isClone ? 'Revisar Cópia' : initialData ? 'Editar Produto' : 'Novo Produto'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Informações Básicas */}
        <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-5 sm:mb-6 text-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Plus size={18} />
            </div>
            <h3 className="font-black text-base sm:text-lg uppercase tracking-tight">Informações Básicas</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nome do Produto*</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 sm:py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all font-bold text-slate-800"
                placeholder="Ex: Tênis Esportivo Pro"
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Descrição</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50/50 outline-none resize-none font-medium text-sm text-slate-600"
                placeholder="Detalhes sobre o material, uso, etc."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Preço de Venda*</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">R$</div>
                <input 
                  required
                  type="text" 
                  value={formatCurrency(formData.price || 0)}
                  onChange={handlePriceChange}
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50/50 outline-none font-black text-indigo-600"
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">SKU / Código</label>
              <input 
                type="text" 
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50/50 outline-none font-bold uppercase text-slate-800"
                placeholder="REF-123"
              />
            </div>
          </div>
        </section>

        {/* Estoque e Classificação */}
        <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Package size={18} />
              </div>
              <h3 className="font-black text-base sm:text-lg uppercase tracking-tight">Estoque e Classificação</h3>
            </div>
            
            {initialData && onShowHistory && (
              <button 
                type="button"
                onClick={() => onShowHistory(initialData)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all"
              >
                <History size={14} /> Ver Histórico
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                {hasSubcategories ? 'Estoque Total (Auto)' : 'Estoque Disponível'}
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  readOnly={hasSubcategories}
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                  className={`w-full px-4 py-3.5 border rounded-xl focus:ring-4 focus:ring-indigo-50/50 outline-none font-black ${
                    hasSubcategories 
                      ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200' 
                      : 'bg-slate-50 text-slate-800 border-slate-100'
                  }`}
                />
                {hasSubcategories && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Check className="text-indigo-500" size={16} />
                  </div>
                )}
              </div>
              {hasSubcategories && (
                <p className="text-[9px] font-bold text-indigo-400 uppercase px-1">Soma das variações abaixo</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoria Principal*</label>
              <div className="relative">
                <select 
                  required
                  value={formData.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-indigo-50/50 outline-none font-bold text-slate-800 cursor-pointer appearance-none"
                >
                  <option value="">Selecionar...</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>

            {isStockModified && !hasSubcategories && (
              <div className="space-y-2 col-span-1 md:col-span-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest px-1 flex items-center gap-2">
                  <MessageSquare size={14} /> Por que você está alterando o estoque?
                </label>
                <input 
                  type="text" 
                  value={stockNote}
                  onChange={(e) => setStockNote(e.target.value)}
                  placeholder="Ex: Recebimento de carga, Ajuste de inventário..."
                  className="w-full px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl focus:ring-4 focus:ring-amber-100/50 outline-none font-bold text-amber-900"
                />
              </div>
            )}

            {/* Gerenciamento de Subcategorias e Estoque por Variação */}
            {selectedCategory && selectedCategory.subcategories && selectedCategory.subcategories.length > 0 && (
              <div className="space-y-6 animate-in slide-in-from-top-2 duration-300 col-span-1 md:col-span-2">
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between px-1 mb-4">
                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                      <Layers size={14} /> Seleção de Variações
                    </label>
                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={selectAllSubcategories}
                        className="text-[9px] font-black text-indigo-600 uppercase hover:underline"
                      >
                        Selecionar Todas
                      </button>
                      <button 
                        type="button" 
                        onClick={clearSubcategories}
                        className="text-[9px] font-black text-slate-400 uppercase hover:underline"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {selectedCategory.subcategories.map(sub => {
                      const isSelected = formData.subcategoryIds?.includes(sub.id);
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => toggleSubcategory(sub.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
                            isSelected 
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                              : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200'
                          }`}
                        >
                          {isSelected && <Check size={14} className="stroke-[4]" />}
                          {sub.name}
                        </button>
                      );
                    })}
                  </div>

                  {hasSubcategories && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Quantidade por Variação</label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedSubcategories.map(sub => (
                            <div key={sub.id} className="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl group transition-all hover:bg-white hover:shadow-md">
                              <span className="font-bold text-xs text-indigo-900 uppercase truncate pr-2">{sub.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-indigo-300 uppercase">Qtd</span>
                                <input 
                                  type="number"
                                  min="0"
                                  value={formData.subcategory_stock?.[String(sub.id)] || 0}
                                  onChange={(e) => handleSubStockChange(sub.id, parseInt(e.target.value) || 0)}
                                  className="w-16 px-2 py-1.5 bg-white border border-indigo-200 rounded-lg text-center font-black text-xs text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-200"
                                />
                              </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Imagens do Produto */}
        <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div className="flex items-center gap-2 text-slate-800">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <ImageIcon size={18} />
              </div>
              <h3 className="font-black text-base sm:text-lg uppercase tracking-tight">Imagens do Produto</h3>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {formData.images?.length || 0} / 5 Imagens
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4">
            {formData.images?.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group shadow-sm">
                <img src={img} alt="" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== idx) }))}
                  className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-lg lg:opacity-0 lg:group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {(formData.images?.length || 0) < 5 && (
              <div className="relative aspect-square">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-full border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-400 transition-all bg-slate-50 active:bg-slate-100"
                >
                  <Upload size={20} />
                  <span className="text-[10px] font-black mt-2 uppercase tracking-widest">Upload</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Rodapé fixo de Ações */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-72 p-4 sm:p-6 bg-white/90 backdrop-blur-md border-t border-slate-100 flex items-center justify-between sm:justify-end gap-3 sm:gap-6 z-40 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none px-6 py-3.5 text-slate-500 font-black text-xs uppercase tracking-widest hover:text-slate-800 transition-all active:scale-95"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={isSaving}
            className="flex-[2] sm:flex-none flex items-center justify-center gap-2 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 active:scale-95"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {isClone ? 'Confirmar Cópia' : 'Salvar Produto'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
